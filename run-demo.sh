#!/usr/bin/env bash
# BushFund demo: start DB (if Docker available), migrate, then run backend + frontend.

set -e
cd "$(dirname "$0")"

echo "=== BushFund Demo ==="
echo ""

# Optional: start Postgres and run migration
if command -v docker &>/dev/null; then
  echo "Starting Postgres..."
  (docker compose up -d 2>/dev/null || docker-compose up -d 2>/dev/null) || true
  sleep 3
  if docker compose exec -T postgres psql -U bushfund -d bushfund -c "SELECT 1" &>/dev/null; then
    echo "Running DB migration..."
    docker compose exec -T postgres psql -U bushfund -d bushfund < migrations/001_schema.sql 2>/dev/null ||
      docker compose exec -T postgres psql -U bushfund -d bushfund < migrations/001_schema.sql 2>/dev/null || true
  fi
else
  echo "Docker not found. Using in-memory storage (no Postgres needed)."
  echo ""
  export USE_MEMORY_DB=1
fi

echo "Installing dependencies..."
(cd backend && npm install --silent 2>/dev/null || npm install)
(cd frontend && npm install --silent 2>/dev/null || npm install)
echo ""

echo "Starting backend (port 4000) and frontend (port 3000)..."
if [ -n "$USE_MEMORY_DB" ]; then
  npm run start
else
  npm run demo
fi
