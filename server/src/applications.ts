import { Router, type Request, type Response } from 'express'
import type pg from 'pg'
import { sanitise, STATUSES, validate, type ApplicationForm, type Status } from '../../site/src/lib/application.ts'
import { createSession, endSession, limiter, newToken, requireAdmin, sha256, verifyPassword } from './auth.ts'
import { pool, tx } from './db.ts'

/* ----------------------------------------------------------------- helpers */

const ip = (req: Request) => req.ip ?? 'unknown'
const APP_NO = /^LBCPG-\d{4}-\d{5,}$/

/** Splits the form into the stored row: listed columns, the JSON document, and the photo bytes. */
function toRow(f: ApplicationForm) {
  const { photo, ...data } = f
  data.aadhaar = data.aadhaar.replace(/\s/g, '')
  return {
    course: f.course,
    name: f.name.trim(),
    email: f.email.trim(),
    phone: f.phone.trim(),
    category: f.category,
    local: f.local,
    data,
    photo: photo ? Buffer.from(photo.slice(photo.indexOf(',') + 1), 'base64') : null,
  }
}

function readForm(req: Request, res: Response) {
  const f = sanitise(req.body)
  if (!f) {
    res.status(400).json({ error: 'The application could not be read. Please reload the page and try again.' })
    return null
  }
  const errors = validate(f)
  if (Object.keys(errors).length) {
    res.status(422).json({ error: 'Some fields need attention.', errors })
    return null
  }
  return f
}

const bearer = (req: Request) => /^Bearer (\S+)$/.exec(req.headers.authorization ?? '')?.[1]

type Receipt = { app_no: string; status: Status; submitted_at: Date; updated_at: Date; revision: number }
const receipt = (r: Receipt) => ({ appNo: r.app_no, status: r.status, submittedAt: r.submitted_at, updatedAt: r.updated_at, revision: r.revision })

/* ------------------------------------------------------------ public API */

export const publicApi = Router()
const submitLimit = limiter(10, 60 * 60 * 1000) // new applications per IP per hour
const updateLimit = limiter(60, 60 * 60 * 1000)

/** Submit a new application: assigns the next application number for the year. */
publicApi.post('/applications', async (req, res) => {
  if (!submitLimit(ip(req))) return res.status(429).json({ error: 'Too many applications from this connection. Please try again later.' })
  const f = readForm(req, res)
  if (!f) return
  const row = toRow(f)
  const token = newToken()
  const saved = await tx(async (c) => {
    const { rows } = await c.query<{ year: number; last: number }>(
      `INSERT INTO application_counters (year, last)
       VALUES (extract(year FROM now() AT TIME ZONE 'Asia/Kolkata')::int, 1)
       ON CONFLICT (year) DO UPDATE SET last = application_counters.last + 1
       RETURNING year, last`,
    )
    const appNo = `LBCPG-${rows[0].year}-${String(rows[0].last).padStart(5, '0')}`
    const ins = await c.query<Receipt>(
      `INSERT INTO applications (app_no, edit_token_hash, course, name, email, phone, category, local_status, data, photo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING app_no, status, submitted_at, updated_at, revision`,
      [appNo, sha256(token), row.course, row.name, row.email, row.phone, row.category, row.local, row.data, row.photo],
    )
    return ins.rows[0]
  })
  res.status(201).json({ ...receipt(saved), token })
})

/** Update one's own application (same number) while the college has not started reviewing it. */
publicApi.put('/applications/:appNo', async (req, res) => {
  if (!updateLimit(ip(req))) return res.status(429).json({ error: 'Too many updates. Please try again later.' })
  const token = bearer(req)
  const appNo = req.params.appNo
  if (!token || !APP_NO.test(appNo)) return res.status(403).json({ error: 'This application cannot be updated from this browser.' })
  const f = readForm(req, res)
  if (!f) return
  const row = toRow(f)
  const { rows } = await pool.query<Receipt & { locked: boolean }>(
    `WITH target AS (SELECT id, status FROM applications WHERE app_no = $1 AND edit_token_hash = $2),
     upd AS (
       UPDATE applications a
          SET course = $3, name = $4, email = $5, phone = $6, category = $7, local_status = $8, data = $9, photo = $10,
              revision = a.revision + 1, updated_at = now()
         FROM target t WHERE a.id = t.id AND t.status = 'submitted'
       RETURNING a.app_no, a.status, a.submitted_at, a.updated_at, a.revision)
     SELECT upd.*, false AS locked FROM upd
     UNION ALL
     SELECT a.app_no, a.status, a.submitted_at, a.updated_at, a.revision, true FROM applications a JOIN target t ON a.id = t.id
      WHERE NOT EXISTS (SELECT 1 FROM upd)`,
    [appNo, sha256(token), row.course, row.name, row.email, row.phone, row.category, row.local, row.data, row.photo],
  )
  if (!rows[0]) return res.status(403).json({ error: 'This application cannot be updated from this browser.' })
  if (rows[0].locked) return res.status(409).json({ error: 'The college has started reviewing this application, so it can no longer be changed online. Please contact the office.', ...receipt(rows[0]) })
  res.json(receipt(rows[0]))
})

/** Status of one's own application. */
publicApi.get('/applications/:appNo', async (req, res) => {
  const token = bearer(req)
  if (!token || !APP_NO.test(req.params.appNo)) return res.status(404).json({ error: 'Not found.' })
  const { rows } = await pool.query<Receipt>('SELECT app_no, status, submitted_at, updated_at, revision FROM applications WHERE app_no = $1 AND edit_token_hash = $2', [req.params.appNo, sha256(token)])
  if (!rows[0]) return res.status(404).json({ error: 'Not found.' })
  res.json(receipt(rows[0]))
})

/* ------------------------------------------------------------- admin API */

export const adminApi = Router()
/* Only failed sign-ins count: 10 failures from one address lock it out for 15 minutes. */
const LOGIN_FAILS = 10
const LOGIN_WINDOW = 15 * 60 * 1000
const loginFails = new Map<string, { n: number; reset: number }>()
const loginBlocked = (key: string) => {
  const f = loginFails.get(key)
  if (f && f.reset < Date.now()) loginFails.delete(key)
  return (loginFails.get(key)?.n ?? 0) >= LOGIN_FAILS
}
const loginFailed = (key: string) => {
  const now = Date.now()
  if (loginFails.size > 10_000) for (const [k, v] of loginFails) if (v.reset < now) loginFails.delete(k)
  const f = loginFails.get(key)
  if (!f || f.reset < now) loginFails.set(key, { n: 1, reset: now + LOGIN_WINDOW })
  else f.n++
}

adminApi.post('/login', async (req, res) => {
  if (loginBlocked(ip(req))) return res.status(429).json({ error: 'Too many failed sign-in attempts. Please wait 15 minutes and try again.' })
  const { username, password } = (req.body ?? {}) as { username?: unknown; password?: unknown }
  if (typeof username !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Enter your username and password.' })
  const { rows } = await pool.query<{ id: number; username: string; password_hash: string }>('SELECT id, username, password_hash FROM admins WHERE username = $1', [username.trim().toLowerCase()])
  const ok = rows[0] ? await verifyPassword(password, rows[0].password_hash) : await verifyPassword(password, DUMMY_HASH)
  if (!rows[0] || !ok) {
    loginFailed(ip(req))
    return res.status(401).json({ error: 'Incorrect username or password.' })
  }
  loginFails.delete(ip(req)) // a successful sign-in clears earlier mistakes
  await createSession(res, rows[0].id)
  res.json({ username: rows[0].username })
})
// compared against when the username does not exist, so both failures take the same time
const DUMMY_HASH = 'scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$' + Buffer.alloc(64).toString('base64')

adminApi.post('/logout', async (req, res) => {
  await endSession(req, res)
  res.status(204).end()
})

adminApi.use(requireAdmin)

adminApi.get('/me', (req, res) => {
  res.json({ username: req.admin!.username })
})

/** WHERE clause for the list and CSV export, from ?q=&status=&course= */
function filters(req: Request) {
  const where: string[] = []
  const args: unknown[] = []
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : ''
  if (q) {
    args.push(`%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`)
    const n = `$${args.length}`
    where.push(`(app_no ILIKE ${n} OR name ILIKE ${n} OR email ILIKE ${n} OR phone ILIKE ${n} OR data->>'hallTicket' ILIKE ${n})`)
  }
  const str = (k: string) => (typeof req.query[k] === 'string' ? (req.query[k] as string).trim() : '')
  const add = (cond: (n: string) => string, value: unknown) => {
    args.push(value)
    where.push(cond(`$${args.length}`))
  }
  // status: one or several, comma-separated
  const statuses = str('status').split(',').filter((s) => (STATUSES as readonly string[]).includes(s))
  if (statuses.length) add((n) => `status = ANY(${n}::text[])`, statuses)
  if (str('course')) add((n) => `course = ${n}`, str('course'))
  if (str('category')) add((n) => `category = ${n}`, str('category'))
  if (str('local')) add((n) => `local_status = ${n}`, str('local'))
  if (str('exam')) add((n) => `data->>'rankExam' = ${n}`, str('exam'))
  if (/^\d{4}$/.test(str('year'))) add((n) => `${IST_YEAR} = ${n}`, Number(str('year')))
  // submission dates (India time), inclusive
  if (/^\d{4}-\d{2}-\d{2}$/.test(str('from'))) add((n) => `(submitted_at AT TIME ZONE 'Asia/Kolkata')::date >= ${n}::date`, str('from'))
  if (/^\d{4}-\d{2}-\d{2}$/.test(str('to'))) add((n) => `(submitted_at AT TIME ZONE 'Asia/Kolkata')::date <= ${n}::date`, str('to'))
  if (/^\d+$/.test(str('rankMin'))) add((n) => `${RANK} >= ${n}::bigint`, str('rankMin'))
  if (/^\d+$/.test(str('rankMax'))) add((n) => `${RANK} <= ${n}::bigint`, str('rankMax'))
  return { sql: where.length ? `WHERE ${where.join(' AND ')}` : '', args }
}

const SORTS: Record<string, string> = {
  newest: 'submitted_at DESC, id DESC',
  oldest: 'submitted_at ASC, id ASC',
  name: 'lower(name) ASC, id ASC',
  rank: "NULLIF(regexp_replace(data->>'rank', '\\D', '', 'g'), '')::bigint ASC NULLS LAST, id ASC",
}

adminApi.get('/applications', async (req, res) => {
  const { sql, args } = filters(req)
  const pageSize = Math.min(100, Math.max(5, Number(req.query.pageSize) || 25))
  const page = Math.max(1, Number(req.query.page) || 1)
  const order = SORTS[String(req.query.sort)] ?? SORTS.newest
  const [list, total, counts, courses] = await Promise.all([
    pool.query(
      `SELECT app_no AS "appNo", name, course, email, phone, category, local_status AS "local", status,
              data->>'rankExam' AS "rankExam", data->>'rank' AS rank, photo IS NOT NULL AS "hasPhoto",
              submitted_at AS "submittedAt", updated_at AS "updatedAt", revision
         FROM applications ${sql} ORDER BY ${order} LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`,
      args,
    ),
    pool.query<{ n: string }>(`SELECT count(*) AS n FROM applications ${sql}`, args),
    pool.query<{ status: Status; n: string }>('SELECT status, count(*) AS n FROM applications GROUP BY status'),
    pool.query<{ course: string; n: string }>('SELECT course, count(*) AS n FROM applications GROUP BY course ORDER BY course'),
  ])
  res.json({
    items: list.rows,
    total: Number(total.rows[0].n),
    page,
    pageSize,
    counts: Object.fromEntries(STATUSES.map((s) => [s, Number(counts.rows.find((r) => r.status === s)?.n ?? 0)])),
    courses: courses.rows.map((r) => ({ course: r.course, count: Number(r.n) })),
  })
})

/* ------------------------------------------------------------------ stats */

const IST_YEAR = "extract(year FROM submitted_at AT TIME ZONE 'Asia/Kolkata')::int"
const RANK = "NULLIF(regexp_replace(data->>'rank', '\\D', '', 'g'), '')::bigint"
/** Rank bands for the distribution chart: [label, upper bound]. */
const RANK_BANDS: [string, number][] = [
  ['1–1,000', 1000],
  ['1,001–5,000', 5000],
  ['5,001–10,000', 10000],
  ['10,001–25,000', 25000],
  ['25,001–50,000', 50000],
  ['50,000+', Number.MAX_SAFE_INTEGER],
]

/** Admission statistics for one application year (default: latest), optionally one course. */
adminApi.get('/stats', async (req, res) => {
  const years = (await pool.query<{ year: number; n: string }>(`SELECT ${IST_YEAR} AS year, count(*) AS n FROM applications GROUP BY 1 ORDER BY 1 DESC`)).rows.map((r) => ({ year: r.year, count: Number(r.n) }))
  const thisYear = Number(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric' }).format(new Date()))
  const year = Number(req.query.year) || years[0]?.year || thisYear
  const args: unknown[] = [year]
  let where = `WHERE ${IST_YEAR} = $1`
  if (typeof req.query.course === 'string' && req.query.course) {
    args.push(req.query.course)
    where += ` AND course = $2`
  }
  const bandCase = `CASE ${RANK_BANDS.map(([, max], i) => `WHEN ${RANK} <= ${max} THEN ${i}`).join(' ')} END`

  const [status, byCourse, byCategory, byLocal, byExam, daily, ranks, timing] = await Promise.all([
    pool.query<{ status: Status; n: string }>(`SELECT status, count(*) AS n FROM applications ${where} GROUP BY status`, args),
    pool.query<{ course: string; status: Status; n: string }>(`SELECT course, status, count(*) AS n FROM applications ${where} GROUP BY course, status`, args),
    pool.query<{ category: string; n: string; admitted: string }>(
      `SELECT category, count(*) AS n, count(*) FILTER (WHERE status = 'admitted') AS admitted FROM applications ${where} GROUP BY category`,
      args,
    ),
    pool.query<{ k: string; n: string }>(`SELECT local_status AS k, count(*) AS n FROM applications ${where} GROUP BY 1`, args),
    pool.query<{ k: string; n: string }>(`SELECT data->>'rankExam' AS k, count(*) AS n FROM applications ${where} GROUP BY 1`, args),
    pool.query<{ day: string; n: string }>(
      `SELECT to_char(submitted_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') AS day, count(*) AS n FROM applications ${where} GROUP BY 1 ORDER BY 1`,
      args,
    ),
    pool.query<{ exam: string; band: number; n: string; best: string | null; median: string | null }>(
      `SELECT data->>'rankExam' AS exam, ${bandCase} AS band, count(*) AS n, NULL AS best, NULL AS median
         FROM applications ${where} AND ${RANK} IS NOT NULL GROUP BY 1, 2
       UNION ALL
       SELECT data->>'rankExam', -1, count(*), min(${RANK})::text, percentile_disc(0.5) WITHIN GROUP (ORDER BY ${RANK})::text
         FROM applications ${where} AND ${RANK} IS NOT NULL GROUP BY 1`,
      args,
    ),
    pool.query<{ hours: string | null; photo: string; edited: string }>(
      `SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY extract(epoch FROM status_changed_at - submitted_at) / 3600)
                FILTER (WHERE status_changed_at IS NOT NULL) AS hours,
              count(*) FILTER (WHERE photo IS NOT NULL) AS photo,
              count(*) FILTER (WHERE revision > 1) AS edited
         FROM applications ${where}`,
      args,
    ),
  ])

  const counts = Object.fromEntries(STATUSES.map((s) => [s, Number(status.rows.find((r) => r.status === s)?.n ?? 0)])) as Record<Status, number>
  const courses = new Map<string, Record<Status, number>>()
  for (const r of byCourse.rows) {
    const c = courses.get(r.course) ?? (Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<Status, number>)
    c[r.status] = Number(r.n)
    courses.set(r.course, c)
  }
  const exams = [...new Set(ranks.rows.map((r) => r.exam))].sort()
  res.json({
    year,
    years: years.length ? years : [{ year: thisYear, count: 0 }],
    total: Object.values(counts).reduce((a, b) => a + b, 0),
    counts,
    byCourse: [...courses].map(([course, c]) => ({ course, ...c, total: STATUSES.reduce((a, s) => a + c[s], 0) })).sort((a, b) => b.total - a.total || a.course.localeCompare(b.course)),
    byCategory: byCategory.rows.map((r) => ({ category: r.category, count: Number(r.n), admitted: Number(r.admitted) })),
    byLocal: byLocal.rows.map((r) => ({ key: r.k, count: Number(r.n) })),
    byExam: byExam.rows.map((r) => ({ key: r.k, count: Number(r.n) })),
    daily: daily.rows.map((r) => ({ day: r.day, count: Number(r.n) })),
    rankBands: RANK_BANDS.map(([label]) => label),
    ranks: exams.map((exam) => {
      const rows = ranks.rows.filter((r) => r.exam === exam)
      const summary = rows.find((r) => r.band === -1)
      return {
        exam,
        bands: RANK_BANDS.map((_, i) => Number(rows.find((r) => r.band === i)?.n ?? 0)),
        best: summary?.best ? Number(summary.best) : null,
        median: summary?.median ? Number(summary.median) : null,
      }
    }),
    medianHoursToDecision: timing.rows[0].hours == null ? null : Number(timing.rows[0].hours),
    withPhoto: Number(timing.rows[0].photo),
    edited: Number(timing.rows[0].edited),
  })
})

/* CSV export of the filtered list (Aadhaar left out; it is shown on each application). */
const csvCell = (v: unknown) => {
  let s = v == null ? '' : v instanceof Date ? v.toISOString() : String(v)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}` // keep spreadsheets from running cell text as formulas
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
adminApi.get('/applications.csv', async (req, res) => {
  const { sql, args } = filters(req)
  const { rows } = await pool.query<{ app_no: string; status: string; submitted_at: Date; updated_at: Date; data: Omit<ApplicationForm, 'photo'>; admin_notes: string }>(
    `SELECT app_no, status, submitted_at, updated_at, data, admin_notes FROM applications ${sql} ORDER BY submitted_at ASC, id ASC`,
    args,
  )
  const head = ['Application No', 'Status', 'Submitted', 'Updated', 'Course', 'Name', "Father's name", "Mother's name", 'Caste', 'Email', 'Phone', 'Address', 'Entrance test', 'Rank', 'Category', 'Local / Non-Local', 'Hall ticket', 'CET rank', 'Admission given into', 'SSC result', 'Intermediate result', 'Degree result', 'Notes']
  const lines = rows.map(({ data: d, ...r }) =>
    [r.app_no, r.status, r.submitted_at, r.updated_at, d.course, d.name, d.father, d.mother, d.caste, d.email, d.phone, d.address, d.rankExam, d.rank, d.category, d.local, d.hallTicket, d.cetRank, d.cetCourse, d.quals?.[0]?.result, d.quals?.[1]?.result, d.quals?.[2]?.result, r.admin_notes]
      .map(csvCell)
      .join(','),
  )
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="lbc-pg-applications-${new Date().toISOString().slice(0, 10)}.csv"`)
  res.send('﻿' + [head.join(','), ...lines].join('\r\n'))
})

type FullRow = Receipt & { data: Omit<ApplicationForm, 'photo'>; photo: Buffer | null; admin_notes: string; status_changed_at: Date | null; status_changed_by: string | null }
const detail = (r: FullRow) => ({
  ...receipt(r),
  form: { ...r.data, photo: r.photo ? `data:image/jpeg;base64,${r.photo.toString('base64')}` : '' } satisfies ApplicationForm,
  notes: r.admin_notes,
  statusChangedAt: r.status_changed_at,
  statusChangedBy: r.status_changed_by,
})
const DETAIL_COLS = 'app_no, status, submitted_at, updated_at, revision, data, photo, admin_notes, status_changed_at, status_changed_by'

async function sameApplicant(c: pg.Pool, appNo: string, aadhaar: string) {
  const { rows } = await c.query<{ app_no: string; course: string; status: Status }>(
    `SELECT app_no, course, status FROM applications WHERE data->>'aadhaar' = $1 AND app_no <> $2 ORDER BY submitted_at`,
    [aadhaar, appNo],
  )
  return rows.map((r) => ({ appNo: r.app_no, course: r.course, status: r.status }))
}

adminApi.get('/applications/:appNo', async (req, res) => {
  const { rows } = await pool.query<FullRow>(`SELECT ${DETAIL_COLS} FROM applications WHERE app_no = $1`, [req.params.appNo])
  if (!rows[0]) return res.status(404).json({ error: 'No application with that number.' })
  res.json({ ...detail(rows[0]), others: await sameApplicant(pool, rows[0].app_no, rows[0].data.aadhaar) })
})

adminApi.patch('/applications/:appNo', async (req, res) => {
  const { status, notes } = (req.body ?? {}) as { status?: unknown; notes?: unknown }
  if (status !== undefined && !(STATUSES as readonly unknown[]).includes(status)) return res.status(400).json({ error: 'Unknown status.' })
  if (notes !== undefined && (typeof notes !== 'string' || notes.length > 5000)) return res.status(400).json({ error: 'Notes must be text of at most 5000 characters.' })
  const { rows } = await pool.query<FullRow>(
    `UPDATE applications SET
        admin_notes = COALESCE($2, admin_notes),
        status_changed_at = CASE WHEN $3::text IS NOT NULL AND $3 <> status THEN now() ELSE status_changed_at END,
        status_changed_by = CASE WHEN $3::text IS NOT NULL AND $3 <> status THEN $4 ELSE status_changed_by END,
        status = COALESCE($3, status)
      WHERE app_no = $1 RETURNING ${DETAIL_COLS}`,
    [req.params.appNo, notes ?? null, status ?? null, req.admin!.username],
  )
  if (!rows[0]) return res.status(404).json({ error: 'No application with that number.' })
  res.json({ ...detail(rows[0]), others: await sameApplicant(pool, rows[0].app_no, rows[0].data.aadhaar) })
})
