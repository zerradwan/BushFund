-- BushFund MVP schema
-- Run after docker-compose up: psql postgresql://bushfund:bushfund@localhost:5432/bushfund -f migrations/001_schema.sql

CREATE TABLE IF NOT EXISTS portfolios (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS holdings (
  id SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  ticker VARCHAR(32) NOT NULL,
  qty DECIMAL(20, 6) NOT NULL,
  price DECIMAL(20, 6) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_holdings_portfolio ON holdings(portfolio_id);

CREATE TABLE IF NOT EXISTS suggestions (
  id SERIAL PRIMARY KEY,
  portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  exposure_key VARCHAR(64) NOT NULL,
  contract_json JSONB NOT NULL,
  score DECIMAL(20, 6) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suggestions_portfolio ON suggestions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_exposure ON suggestions(portfolio_id, exposure_key);
