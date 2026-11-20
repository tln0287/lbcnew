import pg from 'pg'

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Copy server/.env.example to server/.env (development) or set it in the environment.')
  process.exit(1)
}

// serverless instances each hold their own pool, so keep it small on Vercel
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: process.env.VERCEL ? 3 : 10 })
pool.on('error', (err) => console.error('PostgreSQL pool error', err))

/** Runs `fn` inside a transaction, committing on success and rolling back on any error. */
export async function tx<T>(fn: (c: pg.PoolClient) => Promise<T>): Promise<T> {
  const c = await pool.connect()
  try {
    await c.query('BEGIN')
    const out = await fn(c)
    await c.query('COMMIT')
    return out
  } catch (err) {
    await c.query('ROLLBACK').catch(() => {})
    throw err
  } finally {
    c.release()
  }
}
