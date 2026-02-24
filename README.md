# おたすけくん (Otasuke)

建設業界の元請けと下請けをつなぐマッチングプラットフォーム

## 技術スタック

### バックエンド
- **FastAPI** + **SQLAlchemy** (async) + **Alembic**
- **PostgreSQL 16** (Docker)
- JWT認証 (python-jose) / Argon2パスワードハッシュ
- S3ファイルアップロード (LocalStack対応)
- Python 3.13+

### フロントエンド
- **Next.js 16** (App Router)
- **MUI v7** (Material UI)
- **TanStack Query v5** + **Axios**
- **React Hook Form** + **Zod 4**
- TypeScript 5.9

## セットアップ

### 前提条件
- Docker Desktop
- Node.js 18+
- Python 3.13+

### 1. 環境変数

```bash
cp .env.example backend/.env
```

### 2. データベース起動

```bash
docker compose up -d db
```

### 3. バックエンド

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
alembic upgrade head
python seed.py  # シードデータ投入
uvicorn app.main:app --reload
```

API: http://localhost:8000
ドキュメント: http://localhost:8000/docs

### 4. フロントエンド

```bash
cd frontend
npm install
npm run dev
```

http://localhost:3000

## API エンドポイント

| カテゴリ | 主なエンドポイント |
|---------|-----------------|
| 認証 | `POST /auth/register`, `/login`, `/refresh` |
| 案件 | `GET /projects`, `POST /projects`, `PATCH /projects/{id}` |
| 見積もり | `POST /quotes`, `GET /quotes/my-quotes` |
| 受発注 | `GET /orders`, `POST /orders/{id}/complete` |
| 直接発注 | `POST /direct-orders`, `POST /direct-orders/{id}/accept` |
| 企業 | `POST /companies/me`, `GET /companies/{id}` |
| レビュー | `POST /orders/{id}/reviews`, `GET /companies/{id}/reviews` |
| ダッシュボード | `GET /dashboard/contractor`, `/subcontractor` |

## ページ構成

### 公開ページ
- `/` - ランディングページ
- `/browse` - 案件一覧 (フィルター付き)
- `/browse/{id}` - 案件詳細
- `/companies/{id}` - 企業プロフィール

### 認証後ページ
- `/projects` - 案件管理
- `/quotes` - 見積もり管理
- `/orders` - 受発注管理
- `/direct-orders` - 直接発注
- `/companies/me` - 自社プロフィール
- `/notifications` - 通知

## テスト用アカウント

シードデータ実行後、全アカウント共通パスワード: `password123`

## 開発

```bash
# バックエンドテスト
docker compose up -d db-test
cd backend && pytest

# リント
cd backend && ruff check .
cd frontend && npm run lint
```
