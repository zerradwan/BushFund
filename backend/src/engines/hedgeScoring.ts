/**
 * Hedge scoring: ranks contract suggestions per exposure.
 * Uses deterministic mock data and formula: score = liquidity * (1 - price) * relevanceBoost
 */

import type { Exposures, TickerExposure, MarketContract, ScoredSuggestion } from '../types';
import { fetchMockPolymarketContracts } from '../connectors/mockPolymarket';
import { fetchMockKalshiContracts } from '../connectors/mockKalshi';

/** Exposure key is ticker or sector for matching suggestions */
export type ExposureKey = string;

/** Map exposure keys to relevance keywords for matching contract titles */
const EXPOSURE_RELEVANCE: Record<string, string[]> = {
  TECHNOLOGY: ['recession', 'tech', 'nasdaq', 'sp500', 'rate', 'fed', 'inflation', 'vix'],
  FINANCIALS: ['recession', 'fed', 'rate', 'bank', 'stress', 'gdp', 'unemployment'],
  HEALTHCARE: ['recession', 'inflation', 'gdp', 'cpi'],
  'CONSUMER STAPLES': ['recession', 'inflation', 'cpi', 'gdp'],
  'CONSUMER DISCRETIONARY': ['recession', 'gdp', 'unemployment', 'sp500'],
  INDUSTRIALS: ['recession', 'gdp', 'oil', 'rate'],
  ENERGY: ['oil', 'recession', 'inflation', 'cpi'],
  OTHER: ['recession', 'fed', 'rate', 'president', 'gdp', 'inflation'],
};

function getRelevanceKeywords(exposureKey: string): string[] {
  const key = exposureKey.toUpperCase();
  return EXPOSURE_RELEVANCE[key] ?? EXPOSURE_RELEVANCE.OTHER;
}

function relevanceBoost(contractTitle: string, exposureKey: string): number {
  const keywords = getRelevanceKeywords(exposureKey);
  const titleLower = contractTitle.toLowerCase();
  let matches = 0;
  for (const kw of keywords) {
    if (titleLower.includes(kw.toLowerCase())) matches++;
  }
  if (matches === 0) return 0.5;
  return 1 + Math.min(matches * 0.2, 0.6);
}

/**
 * Score a single contract for an exposure key.
 * Formula: score = liquidity * (1 - price) * relevanceBoost
 */
export function scoreContract(contract: MarketContract, exposureKey: string): number {
  const relevance = relevanceBoost(contract.title, exposureKey);
  const liquidityNorm = Math.log10(contract.liquidity + 1) / 6;
  const costFactor = 1 - contract.price;
  return liquidityNorm * costFactor * relevance;
}

/**
 * Suggested position size: allocate a small % of exposure value to hedge (e.g. 5%).
 * suggestedContracts = (exposureValue * hedgePct) / (contractPrice * notionalPerContract).
 * For binary contracts we use notionalPerContract = 1 (pay $1 if yes).
 * So: suggestedContracts = (exposureValue * 0.05) / contractPrice.
 */
const HEDGE_ALLOCATION_PCT = 0.05;

export function suggestedPositionSize(exposureValue: number, contractPrice: number): number {
  if (contractPrice <= 0) return 0;
  return Math.max(0, (exposureValue * HEDGE_ALLOCATION_PCT) / contractPrice);
}

/**
 * Fetch all mock contracts, score them for each top exposure, return ranked suggestions.
 */
export async function getRankedSuggestions(
  exposures: Exposures,
  limitPerExposure: number = 5
): Promise<Map<ExposureKey, ScoredSuggestion[]>> {
  const [poly, kalshi] = await Promise.all([
    fetchMockPolymarketContracts(),
    fetchMockKalshiContracts(),
  ]);
  const allContracts = [...poly, ...kalshi];

  const result = new Map<ExposureKey, ScoredSuggestion[]>();
  const exposureKeys = exposures.topNExposures.map((e) => e.ticker);
  const valueByTicker = new Map(exposures.byTicker.map((e) => [e.ticker, e.value]));

  for (const key of exposureKeys) {
    const exposureValue = valueByTicker.get(key) ?? 0;
    const scored: ScoredSuggestion[] = allContracts.map((contract) => ({
      contract,
      score: scoreContract(contract, key),
      exposureKey: key,
      suggestedPositionSize: suggestedPositionSize(exposureValue, contract.price),
    }));
    scored.sort((a, b) => b.score - a.score);
    result.set(key, scored.slice(0, limitPerExposure));
  }

  return result;
}

/**
 * Get exposure key for sector (for sector-level suggestions). Used when we want
 * suggestions by sector rather than ticker.
 */
export function getSectorExposureKeys(exposures: Exposures): ExposureKey[] {
  return exposures.bySector.map((s) => s.sector.toUpperCase());
}
