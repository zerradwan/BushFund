/**
 * Portfolio store: uses in-memory when USE_MEMORY_DB=1 (no Postgres/psql needed).
 * Otherwise uses Postgres via portfolioRepository.
 */

import * as memoryStore from './memoryStore';
import * as portfolioRepository from './portfolioRepository';

export const useMemoryStore =
  process.env.USE_MEMORY_DB === '1' || process.env.USE_MEMORY_DB === 'true';

const repo = useMemoryStore ? memoryStore : portfolioRepository;

export const createPortfolio = repo.createPortfolio;
export const getPortfolio = repo.getPortfolio;
export const getHoldings = repo.getHoldings;
export const getHoldingsAsPositions = repo.getHoldingsAsPositions;
export const getExposuresForPortfolio = repo.getExposuresForPortfolio;
export const getLastSuggestions = repo.getLastSuggestions;
export const saveSuggestions = repo.saveSuggestions;
export const deleteSuggestionsForPortfolio = repo.deleteSuggestionsForPortfolio;
