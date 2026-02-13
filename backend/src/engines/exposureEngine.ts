/**
 * Exposure engine: computes portfolio exposures from holdings.
 * Input: holdings array (ticker, qty, price)
 * Output: totalValue, byTicker, bySector, topNExposures
 */

import { getSectorForTicker } from './tickerSectorMap';
import type { Position, Exposures, TickerExposure, SectorExposure } from '../types';

const DEFAULT_TOP_N = 5;

export interface ExposureEngineOptions {
  topN?: number;
}

export function computeExposures(
  holdings: Array<{ ticker: string; qty: number; price: number }>,
  options: ExposureEngineOptions = {}
): Exposures {
  const { topN = DEFAULT_TOP_N } = options;

  if (!holdings.length) {
    return {
      totalValue: 0,
      byTicker: [],
      bySector: [],
      topNExposures: [],
    };
  }

  const byTicker: TickerExposure[] = [];
  let totalValue = 0;

  for (const { ticker, qty, price } of holdings) {
    const value = qty * price;
    totalValue += value;
    byTicker.push({
      ticker: ticker.trim().toUpperCase(),
      value,
      pct: 0,
    });
  }

  // Compute percentages
  for (const row of byTicker) {
    row.pct = totalValue > 0 ? (row.value / totalValue) * 100 : 0;
  }

  // Sort by value desc for topN
  const sorted = [...byTicker].sort((a, b) => b.value - a.value);
  const topNExposures = sorted.slice(0, topN);

  // Aggregate by sector
  const sectorMap = new Map<string, number>();
  for (const row of byTicker) {
    const sector = getSectorForTicker(row.ticker);
    sectorMap.set(sector, (sectorMap.get(sector) ?? 0) + row.value);
  }

  const bySector: SectorExposure[] = Array.from(sectorMap.entries())
    .map(([sector, value]) => ({
      sector,
      value,
      pct: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return {
    totalValue,
    byTicker,
    bySector,
    topNExposures,
  };
}

/**
 * Normalize raw positions (e.g. from API) into a consistent holdings list.
 */
export function normalizePositions(positions: Position[]): Position[] {
  return positions
    .filter((p) => p.ticker != null && typeof p.qty === 'number' && typeof p.price === 'number')
    .map((p) => ({
      ticker: String(p.ticker).trim().toUpperCase(),
      qty: Number(p.qty),
      price: Number(p.price),
    }))
    .filter((p) => p.qty > 0 && p.price >= 0);
}
