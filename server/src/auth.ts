import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { pool } from './db.ts'

const scrypt = (pw: string, salt: Buffer, len: number, opts: ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) => scryptCb(pw, salt, len, opts, (err, key) => (err ? reject(err) : resolve(key))))

const N = 16384
const R = 8
const P = 1
const KEYLEN = 64

/** `scrypt$N$r$p$salt$hash` (base64). */
export async function hashPassword(pw: string) {
  const salt = randomBytes(16)
  const key = await scrypt(pw, salt, KEYLEN, { N, r: R, p: P })
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${key.toString('base64')}`
}

export async function verifyPassword(pw: string, stored: string) {
  const [alg, n, r, p, salt, hash] = stored.split('$')
  if (alg !== 'scrypt' || !salt || !hash) return false
  const expected = Buffer.from(hash, 'base64')
  const key = await scrypt(pw, Buffer.from(salt, 'base64'), expected.length, { N: Number(n), r: Number(r), p: Number(p) })
  return timingSafeEqual(key, expected)
}

export const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')
export const newToken = () => randomBytes(32).toString('base64url')

export const MIN_PASSWORD = 10

/* ------------------------------------------------------------- sessions */

export const COOKIE = 'lbc_admin'
const SESSION_HOURS = 12

export async function createSession(res: Response, adminId: number) {
  const token = newToken()
  await pool.query(`INSERT INTO admin_sessions (token_hash, admin_id, expires_at) VALUES ($1, $2, now() + make_interval(hours => $3))`, [sha256(token), adminId, SESSION_HOURS])
  await pool.query('UPDATE admins SET last_login_at = now() WHERE id = $1', [adminId])
  await pool.query('DELETE FROM admin_sessions WHERE expires_at < now()') // housekeeping
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.COOKIE_SECURE === 'true',
    path: '/api/admin',
    maxAge: SESSION_HOURS * 3600 * 1000,
  })
}

export function readCookie(req: Request, name: string) {
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const i = part.indexOf('=')
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim())
  }
  return undefined
}

export async function endSession(req: Request, res: Response) {
  const token = readCookie(req, COOKIE)
  if (token) await pool.query('DELETE FROM admin_sessions WHERE token_hash = $1', [sha256(token)])
  res.clearCookie(COOKIE, { path: '/api/admin' })
}

export type Admin = { id: number; username: string }
declare module 'express-serve-static-core' {
  interface Request {
    admin?: Admin
  }
}

/** Rejects the request with 401 unless it carries a live admin session. */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = readCookie(req, COOKIE)
  if (token) {
    const { rows } = await pool.query<Admin>(
      `SELECT a.id, a.username FROM admin_sessions s JOIN admins a ON a.id = s.admin_id WHERE s.token_hash = $1 AND s.expires_at > now()`,
      [sha256(token)],
    )
    if (rows[0]) {
      req.admin = rows[0]
      return next()
    }
  }
  res.status(401).json({ error: 'Please sign in.' })
}

/* ---------------------------------------------------------- rate limits */

/** Fixed-window limiter kept in memory: fine for one server process. */
export function limiter(max: number, windowMs: number) {
  const hits = new Map<string, { n: number; reset: number }>()
  return (key: string) => {
    const now = Date.now()
    if (hits.size > 10_000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k)
    const h = hits.get(key)
    if (!h || h.reset < now) {
      hits.set(key, { n: 1, reset: now + windowMs })
      return true
    }
    h.n++
    return h.n <= max
  }
}
