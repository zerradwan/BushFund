/**
 * Portfolio, holdings, and suggestions repository.
 */

import { query } from './client';
import type { Portfolio, Holding, Exposures, SuggestionRow, MarketContract } from '../types';
import { computeExposures, normalizePositions } from '../engines/exposureEngine';
import type { Position } from '../types';

export async function createPortfolio(name: string, positions: Position[]): Promise<{ id: number; name: string }> {
  const normalized = normalizePositions(positions);
  const rows = await query<{ id: number; name: string }>(
    'INSERT INTO portfolios (name) VALUES ($1) RETURNING id, name',
    [name]
  );
  const portfolioId = rows[0].id;

  for (const p of normalized) {
    await query(
      'INSERT INTO holdings (portfolio_id, ticker, qty, price) VALUES ($1, $2, $3, $4)',
      [portfolioId, p.ticker, p.qty, p.price]
    );
  }

  return { id: portfolioId, name };
}

export async function getPortfolio(id: number): Promise<Portfolio | null> {
  const rows = await query<Portfolio>('SELECT id, name, created_at::text as created_at FROM portfolios WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function getHoldings(portfolioId: number): Promise<Holding[]> {
  const rows = await query<{ id: number; portfolio_id: string; ticker: string; qty: string; price: string }>(
    'SELECT id, portfolio_id, ticker, qty, price FROM holdings WHERE portfolio_id = $1',
    [portfolioId]
  );
  return rows.map((r) => ({
    id: r.id,
    portfolio_id: Number(r.portfolio_id),
    ticker: r.ticker,
    qty: Number(r.qty),
    price: Number(r.price),
  }));
}

export async function getHoldingsAsPositions(portfolioId: number): Promise<Position[]> {
  const holdings = await getHoldings(portfolioId);
  return holdings.map((h) => ({ ticker: h.ticker, qty: h.qty, price: h.price }));
}

export async function getExposuresForPortfolio(portfolioId: number): Promise<Exposures | null> {
  const positions = await getHoldingsAsPositions(portfolioId);
  if (!positions.length) return null;
  return computeExposures(positions);
}

export async function getLastSuggestions(portfolioId: number): Promise<SuggestionRow[]> {
  const rows = await query<{
    id: number;
    portfolio_id: string;
    exposure_key: string;
    contract_json: MarketContract;
    score: string;
    created_at: string;
  }>(
    `SELECT id, portfolio_id, exposure_key, contract_json, score, created_at::text as created_at
     FROM suggestions WHERE portfolio_id = $1 ORDER BY created_at DESC`,
    [portfolioId]
  );
  return rows.map((r) => ({
    id: r.id,
    portfolio_id: Number(r.portfolio_id),
    exposure_key: r.exposure_key,
    contract_json: r.contract_json,
    score: Number(r.score),
    created_at: r.created_at,
  }));
}

export async function saveSuggestions(
  portfolioId: number,
  exposureKey: string,
  suggestions: { contract: MarketContract; score: number }[]
): Promise<void> {
  for (const s of suggestions) {
    await query(
      'INSERT INTO suggestions (portfolio_id, exposure_key, contract_json, score) VALUES ($1, $2, $3, $4)',
      [portfolioId, exposureKey, JSON.stringify(s.contract), s.score]
    );
  }
}

export async function deleteSuggestionsForPortfolio(portfolioId: number): Promise<void> {
  await query('DELETE FROM suggestions WHERE portfolio_id = $1', [portfolioId]);
}
