/**
 * API tests: POST /api/portfolio and POST /api/portfolio/:id/analyze return expected shape.
 * Uses mocked DB so tests run without Postgres.
 */

import request from 'supertest';
import app from '../index';

jest.mock('../db/client', () => ({
  pool: {},
  query: jest.fn(),
  healthCheck: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('../db/portfolioRepository', () => ({
  createPortfolio: jest.fn(() => Promise.resolve({ id: 1, name: 'Test Portfolio' })),
  getPortfolio: jest.fn((id: number) =>
    Promise.resolve(id === 1 ? { id: 1, name: 'Test Portfolio', created_at: '2026-01-01T00:00:00Z' } : null)
  ),
  getHoldings: jest.fn(() =>
    Promise.resolve([{ id: 1, portfolio_id: 1, ticker: 'AAPL', qty: 10, price: 150 }])
  ),
  getHoldingsAsPositions: jest.fn(() => Promise.resolve([{ ticker: 'AAPL', qty: 10, price: 150 }])),
  getExposuresForPortfolio: jest.fn(() =>
    Promise.resolve({
      totalValue: 1500,
      byTicker: [{ ticker: 'AAPL', value: 1500, pct: 100 }],
      bySector: [{ sector: 'Technology', value: 1500, pct: 100 }],
      topNExposures: [{ ticker: 'AAPL', value: 1500, pct: 100 }],
    })
  ),
  getLastSuggestions: jest.fn(() => Promise.resolve([])),
  deleteSuggestionsForPortfolio: jest.fn(() => Promise.resolve()),
  saveSuggestions: jest.fn(() => Promise.resolve()),
}));

describe('API', () => {
  describe('POST /api/portfolio', () => {
    it('accepts JSON and returns portfolio id and normalized holdings', async () => {
      const res = await request(app)
        .post('/api/portfolio')
        .send({
          name: 'My Portfolio',
          positions: [
            { ticker: 'AAPL', qty: 10, price: 150 },
            { ticker: 'MSFT', qty: 5, price: 400 },
          ],
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('holdings');
      expect(Array.isArray(res.body.holdings)).toBe(true);
      expect(res.body.holdings.length).toBeGreaterThanOrEqual(1);
      expect(res.body.holdings[0]).toMatchObject({
        ticker: expect.any(String),
        qty: expect.any(Number),
        price: expect.any(Number),
      });
    });

    it('returns 400 when body is invalid', async () => {
      await request(app)
        .post('/api/portfolio')
        .send({ name: 'Only name' })
        .expect(400);
    });
  });

  describe('POST /api/portfolio/:id/analyze', () => {
    it('returns exposures and suggestions with expected shape', async () => {
      const res = await request(app)
        .post('/api/portfolio/1/analyze')
        .expect(200);

      expect(res.body).toHaveProperty('portfolioId', 1);
      expect(res.body).toHaveProperty('exposures');
      expect(res.body.exposures).toMatchObject({
        totalValue: expect.any(Number),
        byTicker: expect.any(Array),
        bySector: expect.any(Array),
        topNExposures: expect.any(Array),
      });
      expect(res.body).toHaveProperty('suggestions');
      expect(typeof res.body.suggestions).toBe('object');
      const firstKey = Object.keys(res.body.suggestions)[0];
      if (firstKey) {
        const list = res.body.suggestions[firstKey];
        expect(Array.isArray(list)).toBe(true);
        if (list.length > 0) {
          expect(list[0]).toMatchObject({
            contract: {
              id: expect.any(String),
              title: expect.any(String),
              price: expect.any(Number),
              liquidity: expect.any(Number),
              expiry: expect.any(String),
            },
            score: expect.any(Number),
          });
        }
      }
    });

    it('returns 404 for unknown portfolio', async () => {
      const { getPortfolio } = require('../db/portfolioRepository');
      (getPortfolio as jest.Mock).mockResolvedValueOnce(null);

      await request(app)
        .post('/api/portfolio/999/analyze')
        .expect(404);
    });
  });

  describe('GET /api/health', () => {
    it('returns status and database', async () => {
      const res = await request(app).get('/api/health').expect(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('database');
    });
  });
});
