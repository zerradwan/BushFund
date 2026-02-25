/**
 * In-memory portfolio store. Use when Postgres is not available (no psql/Docker).
 * Data is lost when the server restarts. Set USE_MEMORY_DB=1 or leave DATABASE_URL unset to use.
 */

import type { Portfolio, Holding, Exposures, SuggestionRow, MarketContract } from '../types';
import { computeExposures, normalizePositions } from '../engines/exposureEngine';
import type { Position } from '../types';

const portfolios: { id: number; name: string; created_at: string }[] = [];
const holdings: { id: number; portfolio_id: number; ticker: string; qty: number; price: number }[] = [];
const suggestions: { id: number; portfolio_id: number; exposure_key: string; contract_json: MarketContract; score: number; created_at: string }[] = [];
let nextPortfolioId = 1;
let nextHoldingId = 1;
let nextSuggestionId = 1;

export async function createPortfolio(name: string, positions: Position[]): Promise<{ id: number; name: string }> {
  const normalized = normalizePositions(positions);
  const id = nextPortfolioId++;
  const created_at = new Date().toISOString();
  portfolios.push({ id, name, created_at });

  for (const p of normalized) {
    holdings.push({
      id: nextHoldingId++,
      portfolio_id: id,
      ticker: p.ticker,
      qty: p.qty,
      price: p.price,
    });
  }

  return { id, name };
}

export async function getPortfolio(id: number): Promise<Portfolio | null> {
  const p = portfolios.find((x) => x.id === id);
  return p ? { id: p.id, name: p.name, created_at: p.created_at } : null;
}

export async function getHoldings(portfolioId: number): Promise<Holding[]> {
  return holdings
    .filter((h) => h.portfolio_id === portfolioId)
    .map((h) => ({ id: h.id, portfolio_id: h.portfolio_id, ticker: h.ticker, qty: h.qty, price: h.price }));
}

export async function getHoldingsAsPositions(portfolioId: number): Promise<Position[]> {
  const h = await getHoldings(portfolioId);
  return h.map((x) => ({ ticker: x.ticker, qty: x.qty, price: x.price }));
}

export async function getExposuresForPortfolio(portfolioId: number): Promise<Exposures | null> {
  const positions = await getHoldingsAsPositions(portfolioId);
  if (!positions.length) return null;
  return computeExposures(positions);
}

export async function getLastSuggestions(portfolioId: number): Promise<SuggestionRow[]> {
  return suggestions
    .filter((s) => s.portfolio_id === portfolioId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((s) => ({
      id: s.id,
      portfolio_id: s.portfolio_id,
      exposure_key: s.exposure_key,
      contract_json: s.contract_json,
      score: s.score,
      created_at: s.created_at,
    }));
}

export async function saveSuggestions(
  portfolioId: number,
  exposureKey: string,
  items: { contract: MarketContract; score: number }[]
): Promise<void> {
  const created_at = new Date().toISOString();
  for (const s of items) {
    suggestions.push({
      id: nextSuggestionId++,
      portfolio_id: portfolioId,
      exposure_key: exposureKey,
      contract_json: s.contract,
      score: s.score,
      created_at,
    });
  }
}

export async function deleteSuggestionsForPortfolio(portfolioId: number): Promise<void> {
  for (let i = suggestions.length - 1; i >= 0; i--) {
    if (suggestions[i].portfolio_id === portfolioId) suggestions.splice(i, 1);
  }
}
