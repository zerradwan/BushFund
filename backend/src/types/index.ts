/**
 * Shared types for BushFund API and core modules.
 */

export interface Position {
  ticker: string;
  qty: number;
  price: number;
}

export interface PortfolioPayload {
  name: string;
  positions: Position[];
}

export interface Holding {
  id?: number;
  portfolio_id: number;
  ticker: string;
  qty: number;
  price: number;
}

export interface Portfolio {
  id: number;
  name: string;
  created_at: string;
}

export interface TickerExposure {
  ticker: string;
  value: number;
  pct: number;
}

export interface SectorExposure {
  sector: string;
  value: number;
  pct: number;
}

export interface Exposures {
  totalValue: number;
  byTicker: TickerExposure[];
  bySector: SectorExposure[];
  topNExposures: TickerExposure[];
}

export interface MarketContract {
  id: string;
  title: string;
  price: number;
  liquidity: number;
  expiry: string;
  source?: 'polymarket' | 'kalshi';
}

export interface ScoredSuggestion {
  contract: MarketContract;
  score: number;
  exposureKey: string;
  suggestedPositionSize?: number;
}

export interface SuggestionRow {
  id?: number;
  portfolio_id: number;
  exposure_key: string;
  contract_json: MarketContract;
  score: number;
  created_at?: string;
}
