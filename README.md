# BushFund MVP (POC)

BushFund analyzes portfolio exposure and suggests prediction-market hedges (mock Polymarket/Kalshi). This repo is a runnable **proof-of-concept** with no real broker or exchange integrations.

## Features

- **Portfolio input**: Manual tickers (quantity & price) or CSV upload
- **Exposure engine**: Sector breakdown, total value, % per ticker (built-in ticker→sector map for ~30 tickers; unknown → "Other")
- **Hedge suggestions**: Mock connectors return ranked contracts; scoring uses liquidity, price, and relevance
- **UI**: Input view + Results view with sizing guidance and simple "Event happens / doesn't happen" P&L scenario

## Tech stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js 18+, Express, TypeScript (ts-node)
- **Database**: PostgreSQL
- **Testing**: Jest (unit + API tests)

## Quick start

### 1. Database

```bash
docker-compose up -d
# or: docker compose up -d
```

Then apply the schema:

```bash
psql postgresql://bushfund:bushfund@localhost:5432/bushfund -f migrations/001_schema.sql
```

(Or from `backend`: `psql $DATABASE_URL -f src/db/schema.sql`.)

### 2. Backend

```bash
cp .env.example .env
# Edit .env if needed (defaults work with docker-compose)

cd backend
npm install
npm run dev
```

API runs at **http://localhost:4000**.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:3000** and proxies `/api` to the backend.

### 4. Run tests

```bash
cd backend
npm test
```

## API overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check (DB status) |
| POST | `/api/portfolio` | Create portfolio (JSON or multipart CSV) |
| GET | `/api/portfolio/:id` | Get portfolio, holdings, exposures, last suggestions |
| POST | `/api/portfolio/:id/analyze` | Compute exposures and hedge suggestions |
| GET | `/api/markets/suggest?exposure=<key>&limit=5` | Suggested contracts for an exposure key (mock) |

### Example curl commands

**Create portfolio (JSON):**

```bash
curl -X POST http://localhost:4000/api/portfolio \
  -H "Content-Type: application/json" \
  -d '{"name":"My Portfolio","positions":[{"ticker":"AAPL","qty":100,"price":185.5},{"ticker":"MSFT","qty":45,"price":415.2}]}'
```

**Create portfolio (CSV):**

```bash
curl -X POST http://localhost:4000/api/portfolio \
  -F "name=CSV Portfolio" \
  -F "csv=@sample-data/portfolio-example.csv"
```

**Get portfolio and run analysis:**

```bash
# Replace :id with returned id from create
curl http://localhost:4000/api/portfolio/1
curl -X POST http://localhost:4000/api/portfolio/1/analyze
```

**Market suggestions (standalone):**

```bash
curl "http://localhost:4000/api/markets/suggest?exposure=AAPL&limit=5"
```

**Health:**

```bash
curl http://localhost:4000/api/health
```

## Sample data

- `sample-data/portfolio-example.json` — 10 tickers, realistic qty/price
- `sample-data/portfolio-example.csv` — same data as CSV (columns: ticker, qty, price)

Mock contracts in the backend include themes such as "Recession 2026", "Fed rate hike by Jun 2026", "US President 2028".

## Configuration

Copy `.env.example` to `.env`. Main variables:

- `PORT` — API port (default 4000)
- `DATABASE_URL` — Postgres connection string (default matches docker-compose)
- `VITE_API_URL` — Frontend: API base URL (empty when using Vite proxy)

## Ticker–sector mapping

The exposure engine uses a built-in map of ~30 tickers to sectors (Technology, Financials, Healthcare, Consumer Staples, Consumer Discretionary, Industrials, Energy). Any ticker not in the map is labeled **Other**. The mapping is in `backend/src/engines/tickerSectorMap.ts` and can be extended or replaced when integrating real data.

## TODO / extension points

- **Real connectors**: Replace `connectors/mockPolymarket.ts` and `connectors/mockKalshi.ts` with live API clients; use env vars for API keys.
- **Broker integration**: Replace manual/CSV input with Plaid or broker APIs (see TODO comments in portfolio routes).
- **Auth**: Add authentication and scope portfolios by user.

## License

MIT (or as specified in the repo).
