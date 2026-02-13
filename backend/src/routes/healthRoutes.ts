import { Router, Request, Response } from 'express';
import { healthCheck } from '../db/client';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const dbOk = await healthCheck();
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'degraded',
    database: dbOk ? 'connected' : 'disconnected',
  });
});

export default router;
