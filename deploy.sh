#!/bin/bash
set -euo pipefail

# =============================================================================
# Otasuke (お助け君) - EC2 Deploy Script
# Amazon Linux 2023 / t3.micro
# Single-server: PostgreSQL + FastAPI + Next.js + Nginx
# =============================================================================

APP_DIR="/home/ec2-user/kensetsu-matching"
BACKEND_DIR="${APP_DIR}/backend"
FRONTEND_DIR="${APP_DIR}/frontend"

echo "========================================="
echo " Otasuke Deploy Script"
echo "========================================="

# Helper: Get EC2 public IP (supports IMDSv1 and IMDSv2)
get_public_ip() {
    local token ip
    token=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
        -H "X-aws-ec2-metadata-token-ttl-seconds: 60" 2>/dev/null) || true
    if [ -n "$token" ]; then
        ip=$(curl -s -H "X-aws-ec2-metadata-token: $token" \
            http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null)
    else
        ip=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null)
    fi
    echo "${ip:-localhost}"
}

# -----------------------------------------------------------------------------
# 0. Swap space (t3.micro has only 1GB RAM)
# -----------------------------------------------------------------------------
echo "[0/8] Setting up swap space..."
if [ ! -f /swapfile ]; then
    sudo dd if=/dev/zero of=/swapfile bs=128M count=8
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
    echo "Swap file created (1GB)"
else
    sudo swapon /swapfile 2>/dev/null || true
    echo "Swap file already exists, skipping."
fi

# -----------------------------------------------------------------------------
# 1. System packages
# -----------------------------------------------------------------------------
echo "[1/8] Installing system packages..."
sudo dnf update -y
sudo dnf install -y git nginx python3.12 python3.12-pip python3.12-devel \
    gcc libpq-devel

# Node.js 20 via fnm
if ! command -v node &>/dev/null; then
    echo "Installing Node.js 20..."
    curl -fsSL https://fnm.vercel.app/install | bash
    export PATH="$HOME/.local/share/fnm:$PATH"
    eval "$(fnm env)"
    fnm install 20
    fnm use 20
fi

# Ensure fnm is available in current shell
export PATH="$HOME/.local/share/fnm:$PATH"
eval "$(fnm env)" 2>/dev/null || true

echo "Python: $(python3.12 --version)"
echo "Node:   $(node --version)"
echo "npm:    $(npm --version)"

# -----------------------------------------------------------------------------
# 2. PostgreSQL 16
# -----------------------------------------------------------------------------
echo "[2/8] Setting up PostgreSQL..."
if ! command -v psql &>/dev/null; then
    sudo dnf install -y postgresql16-server postgresql16
    sudo postgresql-setup --initdb
fi

sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create database user and database (idempotent)
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='otasuke'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER otasuke WITH PASSWORD 'otasuke_prod_pw';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='kensetsu'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE kensetsu OWNER otasuke;"

# Grant all privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kensetsu TO otasuke;"

# Update pg_hba.conf to use md5 authentication for local connections
PG_HBA="/var/lib/pgsql/data/pg_hba.conf"
if grep -q "ident" "$PG_HBA" || grep -q "peer" "$PG_HBA"; then
    sudo sed -i 's/ident/md5/g' "$PG_HBA"
    sudo sed -i 's/peer/md5/g' "$PG_HBA"
    sudo systemctl restart postgresql
    echo "PostgreSQL authentication updated to md5"
fi

echo "PostgreSQL is running."

# -----------------------------------------------------------------------------
# 3. Clone / Pull repository
# -----------------------------------------------------------------------------
echo "[3/8] Setting up repository..."
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    git pull origin main || true
else
    echo "ERROR: Repository not found at ${APP_DIR}"
    echo "Please clone your repository first:"
    echo "  git clone <your-repo-url> ${APP_DIR}"
    exit 1
fi

# -----------------------------------------------------------------------------
# 4. Backend setup
# -----------------------------------------------------------------------------
echo "[4/8] Setting up backend..."
cd "$BACKEND_DIR"

# Auto-generate .env if not exists
if [ ! -f .env ]; then
    JWT_SECRET=$(python3.12 -c "import secrets; print(secrets.token_urlsafe(32))")
    PUBLIC_IP=$(get_public_ip)
    cat > .env <<EOF
DATABASE_URL=postgresql+asyncpg://otasuke:otasuke_prod_pw@localhost:5432/kensetsu
JWT_SECRET_KEY=${JWT_SECRET}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://${PUBLIC_IP}
APP_ENV=production
AWS_ACCESS_KEY_ID=disabled
AWS_SECRET_ACCESS_KEY=disabled
AWS_REGION=ap-northeast-1
S3_BUCKET_NAME=kensetsu-files
S3_ENDPOINT_URL=http://localhost:4566
EOF
    echo "Created backend/.env (DB: local PostgreSQL, IP: ${PUBLIC_IP})"
else
    echo "backend/.env already exists, skipping generation."
fi

# Create venv & install dependencies
python3.12 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -e .

# Run migrations
echo "Running Alembic migrations..."
alembic upgrade head

deactivate

# -----------------------------------------------------------------------------
# 5. Frontend setup
# -----------------------------------------------------------------------------
echo "[5/8] Setting up frontend..."
cd "$FRONTEND_DIR"

# Create .env.local for production (Nginx proxies /api -> backend)
cat > .env.local <<EOF
NEXT_PUBLIC_API_BASE_URL=/api
EOF
echo "Created frontend/.env.local with NEXT_PUBLIC_API_BASE_URL=/api"

npm install

# Limit memory for Next.js build on t3.micro
NODE_OPTIONS="--max-old-space-size=512" npm run build

# -----------------------------------------------------------------------------
# 6. Systemd services
# -----------------------------------------------------------------------------
echo "[6/8] Creating systemd services..."

# Backend service (1 worker to save memory on t3.micro)
sudo tee /etc/systemd/system/otasuke-backend.service > /dev/null <<'UNIT'
[Unit]
Description=Otasuke Backend (FastAPI)
After=network.target postgresql.service

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/kensetsu-matching/backend
Environment=PATH=/home/ec2-user/kensetsu-matching/backend/.venv/bin:/usr/local/bin:/usr/bin
ExecStart=/home/ec2-user/kensetsu-matching/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 1
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

# Frontend service
sudo tee /etc/systemd/system/otasuke-frontend.service > /dev/null <<UNIT
[Unit]
Description=Otasuke Frontend (Next.js)
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/kensetsu-matching/frontend
Environment=PATH=/home/ec2-user/.local/share/fnm/aliases/default/bin:/usr/local/bin:/usr/bin
Environment=NODE_ENV=production
ExecStart=$(which node) /home/ec2-user/kensetsu-matching/frontend/node_modules/.bin/next start -p 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable otasuke-backend otasuke-frontend
sudo systemctl restart otasuke-backend
sudo systemctl restart otasuke-frontend

# -----------------------------------------------------------------------------
# 7. Nginx
# -----------------------------------------------------------------------------
echo "[7/8] Configuring Nginx..."
sudo cp "${APP_DIR}/nginx/default.conf" /etc/nginx/conf.d/default.conf

# Remove default nginx server block if exists
sudo rm -f /etc/nginx/conf.d/nginx.conf 2>/dev/null || true
if [ -f /etc/nginx/nginx.conf ]; then
    # Comment out the default server block in nginx.conf if it exists
    sudo sed -i '/^\s*server\s*{/,/^\s*}/s/^/#/' /etc/nginx/nginx.conf 2>/dev/null || true
fi

sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

# -----------------------------------------------------------------------------
# 8. Seed data
# -----------------------------------------------------------------------------
echo "[8/8] Seeding database..."
cd "$BACKEND_DIR"
source .venv/bin/activate

python seed.py && echo "Seed data inserted." || echo "Seed skipped (may already exist)."

deactivate

# -----------------------------------------------------------------------------
# Done
# -----------------------------------------------------------------------------
PUBLIC_IP=$(get_public_ip)

echo ""
echo "========================================="
echo " Deploy complete!"
echo "========================================="
echo ""
echo "Services status:"
sudo systemctl status otasuke-backend --no-pager -l || true
echo "---"
sudo systemctl status otasuke-frontend --no-pager -l || true
echo "---"
sudo systemctl status nginx --no-pager -l || true
echo "---"
sudo systemctl status postgresql --no-pager -l || true
echo ""
echo "Access your app at: http://${PUBLIC_IP}"
echo ""
echo "Useful commands:"
echo "  sudo journalctl -u otasuke-backend -f    # Backend logs"
echo "  sudo journalctl -u otasuke-frontend -f   # Frontend logs"
echo "  sudo journalctl -u nginx -f              # Nginx logs"
echo "  sudo journalctl -u postgresql -f         # PostgreSQL logs"
echo ""
echo "Security checklist:"
echo "  - Ensure port 80 (HTTP) is open in your EC2 Security Group"
echo "  - Ensure port 22 (SSH) is restricted to your IP only"
