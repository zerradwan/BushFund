import { useState, useEffect } from 'react';
import { getPortfolio, analyzePortfolio } from '../api';
import type { Exposures, SuggestionItem } from '../types';

interface ResultsViewProps {
  portfolioId: number;
  onBack: () => void;
}

const SIZING_FORMULA = 'Suggested size = (exposure value × 5%) ÷ contract price. We allocate 5% of the exposure value as notional hedge; for binary contracts (pay $1 if yes), this gives the number of contracts to consider.';

export function ResultsView({ portfolioId, onBack }: ResultsViewProps) {
  const [portfolio, setPortfolio] = useState<Awaited<ReturnType<typeof getPortfolio>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getPortfolio(portfolioId);
      setPortfolio(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [portfolioId]);

  const runAnalyze = async () => {
    setError(null);
    setAnalyzing(true);
    try {
      const data = await analyzePortfolio(portfolioId);
      setPortfolio((prev) =>
        prev ? { ...prev, exposures: data.exposures, suggestions: data.suggestions } : null
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!portfolio) return null;

  const exposures = portfolio.exposures;
  const suggestions = portfolio.suggestions ?? {};

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Results: {portfolio.portfolio.name}</h2>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-slate-600 hover:underline"
        >
          ← Back to input
        </button>
      </div>

      {/* Holdings */}
      <section>
        <h3 className="mb-2 font-medium">Holdings</h3>
        <div className="overflow-x-auto rounded border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-3 py-2 text-left font-medium">Ticker</th>
                <th className="px-3 py-2 text-right font-medium">Qty</th>
                <th className="px-3 py-2 text-right font-medium">Price</th>
                <th className="px-3 py-2 text-right font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.holdings.map((h, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-medium">{h.ticker}</td>
                  <td className="px-3 py-2 text-right">{h.qty}</td>
                  <td className="px-3 py-2 text-right">${h.price.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right">${(h.qty * h.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Exposure summary */}
      {exposures && (
        <section>
          <h3 className="mb-2 font-medium">Exposure summary</h3>
          <p className="mb-2 text-sm text-slate-600">
            Total value: <strong>${exposures.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded border border-slate-200 bg-white p-3">
              <h4 className="text-xs font-medium uppercase text-slate-500">By sector</h4>
              <ul className="mt-2 space-y-1 text-sm">
                {exposures.bySector.map((s) => (
                  <li key={s.sector} className="flex justify-between">
                    <span>{s.sector}</span>
                    <span>{s.pct.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded border border-slate-200 bg-white p-3">
              <h4 className="text-xs font-medium uppercase text-slate-500">Top exposures (by value)</h4>
              <ul className="mt-2 space-y-1 text-sm">
                {exposures.topNExposures.map((t) => (
                  <li key={t.ticker} className="flex justify-between">
                    <span>{t.ticker}</span>
                    <span>{t.pct.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Analyze button if no suggestions yet */}
      {Object.keys(suggestions).length === 0 && (
        <div>
          <button
            type="button"
            onClick={runAnalyze}
            disabled={analyzing}
            className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {analyzing ? 'Analyzing…' : 'Run hedge analysis'}
          </button>
        </div>
      )}

      {/* Suggestions per exposure */}
      {Object.keys(suggestions).length > 0 && (
        <section>
          <h3 className="mb-2 font-medium">Hedge suggestions (top 5 per exposure)</h3>
          <p className="mb-3 text-xs text-slate-500">{SIZING_FORMULA}</p>
          {Object.entries(suggestions).map(([exposureKey, list]) => (
            <div key={exposureKey} className="mb-6">
              <h4 className="mb-2 text-sm font-medium text-slate-700">Exposure: {exposureKey}</h4>
              <div className="space-y-3">
                {list.map((item, idx) => (
                  <SuggestionCard key={item.contract.id + idx} item={item} exposures={exposures} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function SuggestionCard({
  item,
  exposures,
}: {
  item: SuggestionItem;
  exposures?: Exposures | null;
}) {
  const [scenario, setScenario] = useState<'yes' | 'no'>('no');
  const contract = item.contract;
  const size = item.suggestedPositionSize ?? 0;
  const cost = size * contract.price;
  const payoutIfYes = size * 1;
  const pnlIfYes = payoutIfYes - cost;
  const pnlIfNo = -cost;

  const totalValue = exposures?.totalValue ?? 0;
  const pnlDelta = scenario === 'yes' ? pnlIfYes : pnlIfNo;
  const pctDelta = totalValue > 0 ? (pnlDelta / totalValue) * 100 : 0;

  return (
    <div className="rounded border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-slate-900">{contract.title}</p>
          <p className="text-xs text-slate-500">
            Price {(contract.price * 100).toFixed(0)}¢ · Liquidity {contract.liquidity.toLocaleString()} · Expiry {contract.expiry.slice(0, 10)}
          </p>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-600">
        Suggested position size: <strong>{size.toFixed(0)}</strong> contracts
        {item.suggestedPositionSize != null && (
          <> (formula: 5% of exposure ÷ price)</>
        )}
      </p>
      <div className="mt-3 flex items-center gap-4">
        <span className="text-sm font-medium">Scenario:</span>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            name={`scenario-${contract.id}`}
            checked={scenario === 'yes'}
            onChange={() => setScenario('yes')}
          />
          <span className="text-sm">Event happens</span>
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            name={`scenario-${contract.id}`}
            checked={scenario === 'no'}
            onChange={() => setScenario('no')}
          />
          <span className="text-sm">Event doesn&apos;t happen</span>
        </label>
      </div>
      <p className="mt-2 text-sm">
        Portfolio P&L delta (mocked):{' '}
        <strong className={pnlDelta >= 0 ? 'text-green-700' : 'text-red-700'}>
          ${pnlDelta.toFixed(2)} ({pctDelta >= 0 ? '+' : ''}{pctDelta.toFixed(2)}% of portfolio)
        </strong>
      </p>
    </div>
  );
}
