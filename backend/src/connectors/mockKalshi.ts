/**
 * Mock Kalshi connector. Returns deterministic contract data.
 * TODO: Swap for real Kalshi API when integrating live markets.
 */

import type { MarketContract } from '../types';

const MOCK_CONTRACTS: MarketContract[] = [
  { id: 'kalshi-recession-2026', title: 'Recession 2026', price: 0.38, liquidity: 95000, expiry: '2026-12-31T23:59:59Z', source: 'kalshi' },
  { id: 'kalshi-fed-hike-jun26', title: 'Fed rate hike by Jun 2026', price: 0.20, liquidity: 80000, expiry: '2026-06-30T23:59:59Z', source: 'kalshi' },
  { id: 'kalshi-president-2028', title: 'US President 2028', price: 0.50, liquidity: 180000, expiry: '2028-11-30T23:59:59Z', source: 'kalshi' },
  { id: 'kalshi-gdp-negative', title: 'Negative GDP growth in 2026', price: 0.30, liquidity: 65000, expiry: '2026-12-31T23:59:59Z', source: 'kalshi' },
  { id: 'kalshi-rate-cut-2026', title: 'Fed rate cut by Dec 2026', price: 0.62, liquidity: 110000, expiry: '2026-12-31T23:59:59Z', source: 'kalshi' },
  { id: 'kalshi-vix-30', title: 'VIX above 30 at any point in 2026', price: 0.40, liquidity: 72000, expiry: '2026-12-31T23:59:59Z', source: 'kalshi' },
  { id: 'kalshi-inflation-3', title: 'CPI above 3% in 2026', price: 0.55, liquidity: 88000, expiry: '2026-12-31T23:59:59Z', source: 'kalshi' },
  { id: 'kalshi-bank-stress', title: 'Major bank stress event in 2026', price: 0.15, liquidity: 45000, expiry: '2026-12-31T23:59:59Z', source: 'kalshi' },
];

export async function fetchMockKalshiContracts(): Promise<MarketContract[]> {
  return [...MOCK_CONTRACTS];
}

export function getMockKalshiContractsSync(): MarketContract[] {
  return [...MOCK_CONTRACTS];
}
