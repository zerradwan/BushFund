import { useState } from 'react';
import { createPortfolioJson, createPortfolioCsv } from '../api';

interface InputViewProps {
  onCreated: (portfolioId: number) => void;
}

export function InputView({ onCreated }: InputViewProps) {
  const [name, setName] = useState('');
  const [positions, setPositions] = useState([{ ticker: '', qty: 0, price: 0 }]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [useCsv, setUseCsv] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRow = () => setPositions((p) => [...p, { ticker: '', qty: 0, price: 0 }]);
  const updateRow = (i: number, field: 'ticker' | 'qty' | 'price', value: string | number) => {
    setPositions((p) => {
      const next = [...p];
      if (field === 'ticker') next[i] = { ...next[i], ticker: String(value) };
      else if (field === 'qty') next[i] = { ...next[i], qty: Number(value) || 0 };
      else next[i] = { ...next[i], price: Number(value) || 0 };
      return next;
    });
  };

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (useCsv && csvFile) {
        const res = await createPortfolioCsv(name || 'CSV portfolio', csvFile);
        onCreated(res.id);
      } else {
        const valid = positions.filter((p) => p.ticker.trim() && p.qty > 0 && p.price >= 0);
        if (valid.length === 0) {
          setError('Add at least one position (ticker, qty, price).');
          return;
        }
        const res = await createPortfolioJson({
          name: name || 'My portfolio',
          positions: valid.map((p) => ({ ticker: p.ticker.trim(), qty: p.qty, price: p.price })),
        });
        onCreated(res.id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create portfolio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Portfolio input</h2>

      <div>
        <label className="block text-sm font-medium text-slate-700">Portfolio name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. My portfolio"
          className="mt-1 w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input type="radio" checked={!useCsv} onChange={() => setUseCsv(false)} />
          <span className="text-sm">Manual entry</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" checked={useCsv} onChange={() => setUseCsv(true)} />
          <span className="text-sm">CSV upload (ticker,qty,price)</span>
        </label>
      </div>

      {!useCsv && (
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Positions</span>
            <button type="button" onClick={addRow} className="text-sm text-blue-600 hover:underline">
              + Add row
            </button>
          </div>
          <div className="mt-2 overflow-x-auto rounded border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-2 text-left font-medium">Ticker</th>
                  <th className="px-3 py-2 text-left font-medium">Qty</th>
                  <th className="px-3 py-2 text-left font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-3 py-2">
                      <input
                        value={p.ticker}
                        onChange={(e) => updateRow(i, 'ticker', e.target.value)}
                        placeholder="AAPL"
                        className="w-24 rounded border border-slate-200 px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={p.qty || ''}
                        onChange={(e) => updateRow(i, 'qty', e.target.value)}
                        placeholder="0"
                        className="w-20 rounded border border-slate-200 px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={p.price || ''}
                        onChange={(e) => updateRow(i, 'price', e.target.value)}
                        placeholder="0"
                        className="w-24 rounded border border-slate-200 px-2 py-1"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {useCsv && (
        <div>
          <label className="block text-sm font-medium text-slate-700">CSV file</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
            className="mt-1 text-sm"
          />
          <p className="mt-1 text-xs text-slate-500">Columns: ticker, qty, price</p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={loading || (useCsv && !csvFile)}
        className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {loading ? 'Creating…' : 'Create portfolio & view results'}
      </button>
    </div>
  );
}
