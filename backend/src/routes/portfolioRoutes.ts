/**
 * Portfolio API routes: create, get, analyze.
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { createPortfolio, getPortfolio, getHoldings, getExposuresForPortfolio, getLastSuggestions, deleteSuggestionsForPortfolio, saveSuggestions } from '../db/portfolioRepository';
import { getRankedSuggestions } from '../engines/hedgeScoring';
import type { PortfolioPayload, Position } from '../types';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

function parseCsv(buffer: Buffer): Position[] {
  const text = buffer.toString('utf-8').trim();
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].toLowerCase();
  const tickerIdx = header.includes('ticker') ? header.split(',').map((h) => h.trim()).indexOf('ticker') : 0;
  const qtyIdx = header.includes('qty') ? header.split(',').map((h) => h.trim()).indexOf('qty') : 1;
  const priceIdx = header.includes('price') ? header.split(',').map((h) => h.trim()).indexOf('price') : 2;
  const positions: Position[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim());
    const ticker = parts[tickerIdx];
    const qty = parseFloat(parts[qtyIdx] ?? '0');
    const price = parseFloat(parts[priceIdx] ?? '0');
    if (ticker && !isNaN(qty) && !isNaN(price)) {
      positions.push({ ticker, qty, price });
    }
  }
  return positions;
}

// POST /api/portfolio — JSON or CSV. TODO: Add Plaid/broker integration for live positions.
router.post('/', upload.single('csv'), async (req: Request, res: Response) => {
  try {
    let name: string;
    let positions: Position[];

    if (req.file) {
      name = (req.body.name as string) || 'Uploaded portfolio';
      positions = parseCsv(req.file.buffer);
    } else {
      const body = req.body as PortfolioPayload;
      if (!body.name || !Array.isArray(body.positions)) {
        return res.status(400).json({ error: 'Expected { name, positions } or multipart csv with ticker,qty,price' });
      }
      name = body.name;
      positions = body.positions;
    }

    const { id, name: portfolioName } = await createPortfolio(name, positions);
    const holdings = await getHoldings(id);
    const normalized = holdings.map((h) => ({ ticker: h.ticker, qty: h.qty, price: h.price }));

    res.status(201).json({
      id,
      name: portfolioName,
      holdings: normalized,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create portfolio' });
  }
});

// GET /api/portfolio/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid portfolio id' });

    const portfolio = await getPortfolio(id);
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

    const holdings = await getHoldings(id);
    const exposures = await getExposuresForPortfolio(id);
    const suggestions = await getLastSuggestions(id);

    res.json({
      portfolio: { id: portfolio.id, name: portfolio.name, created_at: portfolio.created_at },
      holdings: holdings.map((h) => ({ ticker: h.ticker, qty: h.qty, price: h.price })),
      exposures: exposures ?? undefined,
      suggestions: suggestions.map((s) => ({ exposure_key: s.exposure_key, contract: s.contract_json, score: s.score })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// POST /api/portfolio/:id/analyze
router.post('/:id/analyze', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid portfolio id' });

    const portfolio = await getPortfolio(id);
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });

    const exposures = await getExposuresForPortfolio(id);
    if (!exposures || exposures.topNExposures.length === 0) {
      return res.status(400).json({ error: 'No holdings to analyze' });
    }

    const ranked = await getRankedSuggestions(exposures, 5);
    await deleteSuggestionsForPortfolio(id);
    for (const [exposureKey, list] of ranked) {
      await saveSuggestions(
        id,
        exposureKey,
        list.map((s) => ({ contract: s.contract, score: s.score }))
      );
    }

    const suggestionsByExposure: Record<string, Array<{ contract: import('../types').MarketContract; score: number; suggestedPositionSize?: number }>> = {};
    ranked.forEach((list, key) => {
      suggestionsByExposure[key] = list.map((s) => ({
        contract: s.contract,
        score: s.score,
        suggestedPositionSize: s.suggestedPositionSize,
      }));
    });

    res.json({
      portfolioId: id,
      exposures,
      suggestions: suggestionsByExposure,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to analyze portfolio' });
  }
});

export default router;
