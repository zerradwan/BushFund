/**
 * BushFund MVP API server.
 * Config via env: PORT, DATABASE_URL, NODE_ENV.
 */

import express from 'express';
import cors from 'cors';
import portfolioRoutes from './routes/portfolioRoutes';
import marketsRoutes from './routes/marketsRoutes';
import healthRoutes from './routes/healthRoutes';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/markets', marketsRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`BushFund API listening on http://localhost:${PORT}`);
  });
}

export default app;
