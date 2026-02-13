const API_BASE = import.meta.env.VITE_API_URL || '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export interface CreatePortfolioPayload {
  name: string;
  positions: { ticker: string; qty: number; price: number }[];
}

export async function createPortfolioJson(payload: CreatePortfolioPayload) {
  return request<{ id: number; name: string; holdings: { ticker: string; qty: number; price: number }[] }>(
    '/api/portfolio',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function createPortfolioCsv(name: string, file: File) {
  const form = new FormData();
  form.append('name', name);
  form.append('csv', file);
  const res = await fetch(`${API_BASE}/api/portfolio`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export async function getPortfolio(id: number) {
  return request<import('./types').PortfolioResult>(`/api/portfolio/${id}`);
}

export async function analyzePortfolio(id: number) {
  return request<{
    portfolioId: number;
    exposures: import('./types').Exposures;
    suggestions: Record<string, import('./types').SuggestionItem[]>;
  }>(`/api/portfolio/${id}/analyze`, { method: 'POST' });
}
