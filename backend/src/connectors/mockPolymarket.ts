/**
 * Mock Polymarket connector. Returns deterministic contract data.
 * TODO: Swap for real Polymarket API when integrating live markets.
 */

import type { MarketContract } from '../types';

const MOCK_CONTRACTS: MarketContract[] = [
  { id: 'poly-recession-2026', title: 'US recession in 2026?', price: 0.35, liquidity: 120000, expiry: '2026-12-31T23:59:59Z', source: 'polymarket' },
  { id: 'poly-fed-hike-jun26', title: 'Fed rate hike by Jun 2026', price: 0.22, liquidity: 85000, expiry: '2026-06-30T23:59:59Z', source: 'polymarket' },
  { id: 'poly-president-2028', title: 'US President 2028 - Republican wins', price: 0.48, liquidity: 200000, expiry: '2028-11-30T23:59:59Z', source: 'polymarket' },
  { id: 'poly-sp500-2026', title: 'S&P 500 above 6000 by end of 2026', price: 0.55, liquidity: 150000, expiry: '2026-12-31T23:59:59Z', source: 'polymarket' },
  { id: 'poly-tech-crash', title: 'Nasdaq down 20% in 2026', price: 0.28, liquidity: 90000, expiry: '2026-12-31T23:59:59Z', source: 'polymarket' },
  { id: 'poly-inflation-4pct', title: 'US CPI above 4% in 2026', price: 0.18, liquidity: 60000, expiry: '2026-12-31T23:59:59Z', source: 'polymarket' },
  { id: 'poly-oil-100', title: 'Oil above $100 in 2026', price: 0.25, liquidity: 50000, expiry: '2026-12-31T23:59:59Z', source: 'polymarket' },
  { id: 'poly-unemployment-5', title: 'US unemployment above 5% by Dec 2026', price: 0.32, liquidity: 70000, expiry: '2026-12-31T23:59:59Z', source: 'polymarket' },
];

export async function fetchMockPolymarketContracts(): Promise<MarketContract[]> {
  return [...MOCK_CONTRACTS];
}

export function getMockPolymarketContractsSync(): MarketContract[] {
  return [...MOCK_CONTRACTS];
}
