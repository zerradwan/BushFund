import { Router, Request, Response } from 'express';
import { healthCheck } from '../db/client';
import { useMemoryStore } from '../db/store';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  if (useMemoryStore) {
    return res.status(200).json({ status: 'ok', database: 'memory' });
  }
  const dbOk = await healthCheck();
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'degraded',
    database: dbOk ? 'connected' : 'disconnected',
  });
});

export default router;
