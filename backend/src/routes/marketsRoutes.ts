/**
 * Markets API: suggest contracts by exposure key (mock connector).
 */

import { Router, Request, Response } from 'express';
import { getMockPolymarketContractsSync } from '../connectors/mockPolymarket';
import { getMockKalshiContractsSync } from '../connectors/mockKalshi';
import { scoreContract } from '../engines/hedgeScoring';
import type { MarketContract } from '../types';

const router = Router();

// GET /api/markets/suggest?exposure=<exposure_key>&limit=5
router.get('/suggest', (req: Request, res: Response) => {
  try {
    const exposure = (req.query.exposure as string) || '';
    const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 5, 1), 20);

    const poly = getMockPolymarketContractsSync();
    const kalshi = getMockKalshiContractsSync();
    const all: MarketContract[] = [...poly, ...kalshi];

    const scored = all.map((c) => ({
      ...c,
      score: scoreContract(c, exposure),
    }));
    scored.sort((a, b) => b.score - a.score);
    const list = scored.slice(0, limit);

    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

export default router;
