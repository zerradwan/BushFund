export interface Position {
  ticker: string;
  qty: number;
  price: number;
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
  source?: string;
}

export interface SuggestionItem {
  contract: MarketContract;
  score: number;
  suggestedPositionSize?: number;
}

export interface PortfolioResult {
  portfolio: { id: number; name: string; created_at: string };
  holdings: Position[];
  exposures?: Exposures;
  suggestions?: Record<string, SuggestionItem[]>;
}
