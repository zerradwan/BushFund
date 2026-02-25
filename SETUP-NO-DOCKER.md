# BushFund setup without Docker

## Easiest: no Postgres at all (in-memory)

You can run the app **without installing Postgres or psql**. Data is stored in memory (lost when the server restarts).

From the BushFund repo root:

```bash
cd backend
USE_MEMORY_DB=1 npm run dev
```

In another terminal:

```bash
cd frontend
npm run dev
```

Open **http://localhost:3000** → Load sample portfolio → Create portfolio & view results → Run hedge analysis.

---

## Optional: install PostgreSQL (persistent data)

Use this if you want data to persist. You need **PostgreSQL** installed locally.

## 1. Install PostgreSQL (Mac with Homebrew)

```bash
brew install postgresql@15
brew services start postgresql@15
```

If you use a different Postgres version (e.g. `postgresql` or `postgresql@16`), start that instead.

Add `psql` to your PATH if needed (Homebrew will show the path after install), for example:

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## 2. Create the database and user

Connect as your Mac user (default superuser) and create the app user and database:

```bash
psql postgres -c "CREATE USER bushfund WITH PASSWORD 'bushfund';"
psql postgres -c "CREATE DATABASE bushfund OWNER bushfund;"
```

If your Postgres is set up with a different superuser (e.g. `postgres`), use that:

```bash
psql -U postgres -c "CREATE USER bushfund WITH PASSWORD 'bushfund';"
psql -U postgres -c "CREATE DATABASE bushfund OWNER bushfund;"
```

## 3. Run the schema migration

From the BushFund repo root:

```bash
cd /Users/zainradwan/Documents/Experimenting/BushFund
psql postgresql://bushfund:bushfund@localhost:5432/bushfund -f migrations/001_schema.sql
```

## 4. Start the app

```bash
# Backend (terminal 1)
cd backend && npm run dev

# Frontend (terminal 2)
cd frontend && npm run dev
```

Or from repo root (after `npm install`): `npm run demo`

Then open **http://localhost:3000**, click **Load sample portfolio**, then **Create portfolio & view results**.

---

**If you prefer to use your existing Postgres user** (e.g. your Mac username with no password), create the database and tables, then set `DATABASE_URL` in a `.env` file in the repo root or in `backend/`:

```bash
# Example if your user is zainradwan and no password:
DATABASE_URL=postgresql://zainradwan@localhost:5432/bushfund
```

Then create the database and run the migration:

```bash
createdb bushfund
psql postgresql://zainradwan@localhost:5432/bushfund -f migrations/001_schema.sql
```

Update `backend/.env` or `backend/.env` with this `DATABASE_URL` so the backend uses it.
