import { useState } from 'react';
import { InputView } from './components/InputView';
import { ResultsView } from './components/ResultsView';

type View = 'input' | 'results';

export default function App() {
  const [view, setView] = useState<View>('input');
  const [portfolioId, setPortfolioId] = useState<number | null>(null);

  const onPortfolioCreated = (id: number) => {
    setPortfolioId(id);
    setView('results');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <h1 className="text-xl font-semibold">BushFund</h1>
        <p className="text-sm text-slate-500">Portfolio exposure → hedge suggestions (POC)</p>
      </header>

      <nav className="flex gap-2 border-b border-slate-200 bg-white px-4 py-2">
        <button
          type="button"
          onClick={() => setView('input')}
          className={`rounded px-3 py-1.5 text-sm font-medium ${view === 'input' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          Input
        </button>
        <button
          type="button"
          onClick={() => view === 'input' && portfolioId && setView('results')}
          disabled={!portfolioId}
          className={`rounded px-3 py-1.5 text-sm font-medium ${view === 'results' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50'}`}
        >
          Results
        </button>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {view === 'input' && <InputView onCreated={onPortfolioCreated} />}
        {view === 'results' && portfolioId !== null && (
          <ResultsView portfolioId={portfolioId} onBack={() => setView('input')} />
        )}
        {view === 'results' && portfolioId === null && (
          <p className="text-slate-500">Create a portfolio from the Input view first.</p>
        )}
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
        <p><strong>Risk disclaimer:</strong> This is a proof-of-concept. Hedge suggestions are from mock data only. Not financial advice. Prediction markets involve risk. Do your own research before trading.</p>
      </footer>
    </div>
  );
}
