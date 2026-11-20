import express, { type ErrorRequestHandler } from 'express'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { adminApi, publicApi } from './applications.ts'
import { hashPassword, MIN_PASSWORD } from './auth.ts'
import { pool } from './db.ts'
import { migrate } from './migrate.ts'

/** Brings the database up to date and creates the first administrator if needed. Safe to run on every start. */
export async function prepare() {
  await migrate()
  await bootstrapAdmin()
}

/** The Express app: /api routes, plus the built site when SITE_DIR is set. Used by the Node server and the Vercel function. */
export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 0))

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('X-Frame-Options', 'SAMEORIGIN')
    next()
  })

  const api = express.Router()
  api.use(express.json({ limit: '1mb' }))
  api.use((req, res, next) => {
    // state-changing calls must be JSON: a cross-site form cannot send that without a CORS preflight
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !req.is('application/json')) {
      return res.status(415).json({ error: 'Send JSON.' })
    }
    res.setHeader('Cache-Control', 'no-store')
    next()
  })
  api.get('/health', async (_req, res) => {
    await pool.query('SELECT 1')
    res.json({ ok: true })
  })
  api.use('/', publicApi)
  api.use('/admin', adminApi)
  api.use((_req, res) => {
    res.status(404).json({ error: 'Not found.' })
  })
  app.use('/api', api)

  // Docker / plain Node production: serve the built site, with index.html for every client-side route.
  const siteDir = process.env.SITE_DIR ? resolve(process.env.SITE_DIR) : ''
  if (siteDir && existsSync(siteDir)) {
    app.use(express.static(siteDir, { index: false, maxAge: '1h' }))
    app.get(/.*/, (req, res) => {
      if (req.path.startsWith('/admin')) res.setHeader('X-Robots-Tag', 'noindex, nofollow')
      res.sendFile(resolve(siteDir, 'index.html'))
    })
    console.log(`serving site from ${siteDir}`)
  }

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'The application is too large. Try a smaller photo.' })
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'The request could not be read.' })
    console.error(err)
    res.status(500).json({ error: 'Something went wrong on our side. Please try again in a minute.' })
  }
  app.use(onError)
  return app
}

/** Creates the first administrator from ADMIN_USERNAME / ADMIN_PASSWORD when there is none yet. */
async function bootstrapAdmin() {
  const { rows } = await pool.query<{ n: string }>('SELECT count(*) AS n FROM admins')
  if (Number(rows[0].n) > 0) return
  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (!username || !password) {
    console.warn('No administrator exists yet. Set ADMIN_USERNAME and ADMIN_PASSWORD, or run: npm run admin -- add <username>')
    return
  }
  if (password.length < MIN_PASSWORD) {
    console.warn(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD} characters; no administrator created.`)
    return
  }
  await pool.query('INSERT INTO admins (username, password_hash) VALUES ($1, $2) ON CONFLICT DO NOTHING', [username, await hashPassword(password)])
  console.log(`created administrator "${username}"`)
}
