#!/bin/bash
set -euo pipefail

# =============================================================================
# Otasuke (お助け君) - EC2 Deploy Script
# Amazon Linux 2023 / t2.micro
# =============================================================================

APP_DIR="/home/ec2-user/kensetsu-matching"
BACKEND_DIR="${APP_DIR}/backend"
FRONTEND_DIR="${APP_DIR}/frontend"

echo "========================================="
echo " Otasuke Deploy Script"
echo "========================================="

# -----------------------------------------------------------------------------
# 1. System packages
# -----------------------------------------------------------------------------
echo "[1/7] Installing system packages..."
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
# 2. Clone / Pull repository
# -----------------------------------------------------------------------------
echo "[2/7] Setting up repository..."
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    git pull origin main
else
    echo "ERROR: Repository not found at ${APP_DIR}"
    echo "Please clone your repository first:"
    echo "  git clone <your-repo-url> ${APP_DIR}"
    exit 1
fi

# -----------------------------------------------------------------------------
# 3. Backend setup
# -----------------------------------------------------------------------------
echo "[3/7] Setting up backend..."
cd "$BACKEND_DIR"

# Check .env exists
if [ ! -f .env ]; then
    echo "ERROR: backend/.env not found!"
    echo "Create it with your RDS connection string:"
    echo "  DATABASE_URL=postgresql+asyncpg://<user>:<pass>@<rds-endpoint>:5432/kensetsu"
    echo "  CORS_ORIGINS=http://<your-ec2-public-ip>"
    echo "  JWT_SECRET_KEY=<random-secret>"
    echo "  APP_ENV=production"
    exit 1
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
# 4. Frontend setup
# -----------------------------------------------------------------------------
echo "[4/7] Setting up frontend..."
cd "$FRONTEND_DIR"

# Create .env.local for production
if [ ! -f .env.local ]; then
    echo "NEXT_PUBLIC_API_BASE_URL=/api" > .env.local
    echo "Created frontend/.env.local with NEXT_PUBLIC_API_BASE_URL=/api"
fi

npm install
npm run build

# -----------------------------------------------------------------------------
# 5. Systemd services
# -----------------------------------------------------------------------------
echo "[5/7] Creating systemd services..."

# Backend service
sudo tee /etc/systemd/system/otasuke-backend.service > /dev/null <<'UNIT'
[Unit]
Description=Otasuke Backend (FastAPI)
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/kensetsu-matching/backend
Environment=PATH=/home/ec2-user/kensetsu-matching/backend/.venv/bin:/usr/local/bin:/usr/bin
ExecStart=/home/ec2-user/kensetsu-matching/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2
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
# 6. Nginx
# -----------------------------------------------------------------------------
echo "[6/7] Configuring Nginx..."
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
# 7. Seed data (optional)
# -----------------------------------------------------------------------------
echo "[7/7] Seeding database..."
cd "$BACKEND_DIR"
source .venv/bin/activate

if python -c "from app.config import settings; print(settings.DATABASE_URL)" &>/dev/null; then
    python seed.py && echo "Seed data inserted." || echo "Seed skipped (may already exist)."
else
    echo "Skipping seed: could not load settings."
fi

deactivate

# -----------------------------------------------------------------------------
# Done
# -----------------------------------------------------------------------------
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
echo ""
echo "Access your app at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo '<EC2_PUBLIC_IP>')"
echo ""
echo "Useful commands:"
echo "  sudo journalctl -u otasuke-backend -f   # Backend logs"
echo "  sudo journalctl -u otasuke-frontend -f   # Frontend logs"
echo "  sudo journalctl -u nginx -f              # Nginx logs"
