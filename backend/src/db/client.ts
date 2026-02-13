/**
 * Postgres client. Uses env DATABASE_URL or defaults for local dev.
 * TODO: Use connection pooling (e.g. pg-pool) for production.
 */

import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://bushfund:bushfund@localhost:5432/bushfund';

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
});

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return (result.rows as T[]) ?? [];
  } finally {
    client.release();
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const rows = await query<{ n: number }>('SELECT 1 as n');
    return rows.length > 0 && rows[0].n === 1;
  } catch {
    return false;
  }
}
