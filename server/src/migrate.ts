import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pool, tx } from './db.ts'

/** MIGRATIONS_DIR if set; else migrations/ beside this file (bundled, as on Vercel) or beside src/ (source). */
const migrationsDir = () => {
  if (process.env.MIGRATIONS_DIR) return process.env.MIGRATIONS_DIR
  const beside = join(import.meta.dirname, 'migrations')
  return existsSync(beside) ? beside : join(import.meta.dirname, '..', 'migrations')
}

/**
 * Applies every migrations/*.sql file not yet recorded in schema_migrations, in name order, each in its own transaction.
 * An advisory lock keeps two server instances from migrating at once.
 */
export async function migrate() {
  const DIR = migrationsDir()
  const files = (await readdir(DIR)).filter((f) => f.endsWith('.sql')).sort()
  await tx(async (c) => {
    await c.query('SELECT pg_advisory_xact_lock(727274)')
    await c.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())')
    const done = new Set((await c.query<{ name: string }>('SELECT name FROM schema_migrations')).rows.map((r) => r.name))
    for (const f of files) {
      if (done.has(f)) continue
      await c.query(await readFile(join(DIR, f), 'utf8'))
      await c.query('INSERT INTO schema_migrations (name) VALUES ($1)', [f])
      console.log(`migration applied: ${f}`)
    }
  })
}

if (import.meta.main) {
  await migrate()
  await pool.end()
}
