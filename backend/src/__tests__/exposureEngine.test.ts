/**
 * Unit tests for exposureEngine: sector aggregation and top exposures.
 */

import { computeExposures, normalizePositions } from '../engines/exposureEngine';

describe('exposureEngine', () => {
  describe('computeExposures', () => {
    it('returns empty exposures for empty holdings', () => {
      const result = computeExposures([]);
      expect(result.totalValue).toBe(0);
      expect(result.byTicker).toEqual([]);
      expect(result.bySector).toEqual([]);
      expect(result.topNExposures).toEqual([]);
    });

    it('aggregates by sector and computes top N exposures', () => {
      const holdings = [
        { ticker: 'AAPL', qty: 100, price: 150 },
        { ticker: 'MSFT', qty: 50, price: 400 },
        { ticker: 'JPM', qty: 200, price: 180 },
        { ticker: 'UNKNOWN', qty: 10, price: 20 },
      ];
      const result = computeExposures(holdings, { topN: 3 });

      expect(result.totalValue).toBe(100 * 150 + 50 * 400 + 200 * 180 + 10 * 20);
      expect(result.totalValue).toBe(15000 + 20000 + 36000 + 200); // 71200

      expect(result.byTicker).toHaveLength(4);
      const byTickerMap = new Map(result.byTicker.map((t) => [t.ticker, t]));
      expect(byTickerMap.get('AAPL')?.value).toBe(15000);
      expect(byTickerMap.get('AAPL')?.pct).toBeCloseTo((15000 / 71200) * 100, 2);
      expect(byTickerMap.get('UNKNOWN')?.value).toBe(200);

      // Sectors: Technology (AAPL, MSFT), Financials (JPM), Other (UNKNOWN)
      expect(result.bySector).toHaveLength(3);
      const tech = result.bySector.find((s) => s.sector === 'Technology');
      expect(tech).toBeDefined();
      expect(tech!.value).toBe(35000);
      expect(tech!.pct).toBeCloseTo((35000 / 71200) * 100, 2);

      const financials = result.bySector.find((s) => s.sector === 'Financials');
      expect(financials!.value).toBe(36000);

      const other = result.bySector.find((s) => s.sector === 'Other');
      expect(other!.value).toBe(200);

      expect(result.topNExposures).toHaveLength(3);
      expect(result.topNExposures[0].ticker).toBe('JPM');
      expect(result.topNExposures[0].value).toBe(36000);
      expect(result.topNExposures[1].ticker).toBe('MSFT');
      expect(result.topNExposures[2].ticker).toBe('AAPL');
    });

    it('normalizes tickers to uppercase and respects topN option', () => {
      const holdings = [
        { ticker: 'aapl', qty: 1, price: 100 },
        { ticker: 'JPM', qty: 1, price: 100 },
      ];
      const result = computeExposures(holdings, { topN: 1 });

      expect(result.byTicker[0].ticker).toBe('AAPL');
      expect(result.byTicker[1].ticker).toBe('JPM');
      expect(result.topNExposures).toHaveLength(1);
      expect(result.topNExposures[0].value).toBe(100);
    });
  });

  describe('normalizePositions', () => {
    it('filters invalid and normalizes valid positions', () => {
      const raw = [
        { ticker: '  aapl  ', qty: 10, price: 100 },
        { ticker: 'MSFT', qty: 0, price: 200 },
        { ticker: 'GOOGL', qty: 5, price: -1 },
        { ticker: 'META', qty: 2, price: 300 },
      ];
      const out = normalizePositions(raw);
      expect(out).toHaveLength(2);
      expect(out[0]).toEqual({ ticker: 'AAPL', qty: 10, price: 100 });
      expect(out[1]).toEqual({ ticker: 'META', qty: 2, price: 300 });
    });
  });
});
