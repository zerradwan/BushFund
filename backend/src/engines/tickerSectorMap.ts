/**
 * Built-in ticker → sector mapping (~30 tickers).
 * Unknown tickers are labeled "Other".
 * TODO: Replace with real data source or broker feed when integrating live data.
 */

export const TICKER_SECTOR_MAP: Record<string, string> = {
  // Tech
  AAPL: 'Technology',
  MSFT: 'Technology',
  GOOGL: 'Technology',
  GOOG: 'Technology',
  META: 'Technology',
  AMZN: 'Technology',
  NVDA: 'Technology',
  TSLA: 'Technology',
  AMD: 'Technology',
  INTC: 'Technology',
  CRM: 'Technology',
  ORCL: 'Technology',
  ADBE: 'Technology',
  NFLX: 'Technology',
  // Financials
  JPM: 'Financials',
  BAC: 'Financials',
  WFC: 'Financials',
  GS: 'Financials',
  MS: 'Financials',
  C: 'Financials',
  SCHW: 'Financials',
  // Healthcare
  JNJ: 'Healthcare',
  UNH: 'Healthcare',
  PFE: 'Healthcare',
  ABBV: 'Healthcare',
  MRK: 'Healthcare',
  TMO: 'Healthcare',
  ABT: 'Healthcare',
  // Consumer
  WMT: 'Consumer Staples',
  PG: 'Consumer Staples',
  KO: 'Consumer Staples',
  PEP: 'Consumer Staples',
  COST: 'Consumer Staples',
  MCD: 'Consumer Discretionary',
  NKE: 'Consumer Discretionary',
  HD: 'Consumer Discretionary',
  // Industrial / Other
  CAT: 'Industrials',
  BA: 'Industrials',
  HON: 'Industrials',
  XOM: 'Energy',
  CVX: 'Energy',
};

export const SECTOR_LABEL_OTHER = 'Other';

export function getSectorForTicker(ticker: string): string {
  const normalized = (ticker || '').trim().toUpperCase();
  return TICKER_SECTOR_MAP[normalized] ?? SECTOR_LABEL_OTHER;
}
