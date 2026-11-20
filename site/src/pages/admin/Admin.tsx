import { motion, useReducedMotion } from 'framer-motion'
import { AlertCircle, ArrowLeft, BarChart3, ChevronLeft, ChevronRight, Download, Eye, EyeOff, FileDown, Globe, Inbox, List, Loader2, Lock, LogIn, LogOut, Mail, Phone, Printer, Save, Search, ShieldCheck, UserRound, X } from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ApplicationSheet, downloadPdf, PrintRoot, SheetPreview } from '../../components/ApplicationSheet'
import { api } from '../../lib/api'
import { AuthCtx, useAdminApi } from './session'

const Reports = lazy(() => import('./Reports'))
import { COURSES, STATUS_LABEL, STATUSES, type ApplicationForm, type Status } from '../../lib/application'

/* ------------------------------------------------------------------ types */

type Row = {
  appNo: string
  name: string
  course: string
  email: string
  phone: string
  category: string
  local: string
  status: Status
  rankExam: string
  rank: string
  hasPhoto: boolean
  submittedAt: string
  updatedAt: string
  revision: number
}
type ListResponse = { items: Row[]; total: number; page: number; pageSize: number; counts: Record<Status, number>; courses: { course: string; count: number }[] }
type Detail = {
  appNo: string
  status: Status
  submittedAt: string
  updatedAt: string
  revision: number
  form: ApplicationForm
  notes: string
  statusChangedAt: string | null
  statusChangedBy: string | null
  others: { appNo: string; course: string; status: Status }[]
}

/* ------------------------------------------------------------ formatting */

const dateTime = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
const dateOnly = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })

const STATUS_STYLE: Record<Status, string> = {
  submitted: 'bg-sky-100 text-sky-900 ring-sky-300',
  under_review: 'bg-amber-100 text-amber-900 ring-amber-300',
  admitted: 'bg-emerald-100 text-emerald-900 ring-emerald-300',
  rejected: 'bg-rose-100 text-rose-900 ring-rose-300',
}
function StatusChip({ s }: { s: Status }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ${STATUS_STYLE[s]}`}>{STATUS_LABEL[s]}</span>
}

const field = 'w-full rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-[15px] text-navy outline-none transition focus:border-navy/40 focus:ring-4 focus:ring-gold/30'

/* ------------------------------------------------------------------ auth */

function Login({ onIn }: { onIn: (u: string) => void }) {
  const reduce = useReducedMotion()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const r = await api<{ username: string }>('/admin/login', { body: { username, password } })
      onIn(r.username)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.')
    } finally {
      setBusy(false)
    }
  }
  const rise = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay: reduce ? 0 : 0.08 * i, ease: [0.16, 1, 0.3, 1] as const },
  })
  const fieldCls =
    'w-full rounded-xl border border-navy/15 bg-white py-3 pr-4 pl-11 text-[15px] text-navy outline-none transition placeholder:text-slate/60 focus:border-navy/40 focus:ring-4 focus:ring-gold/30'

  return (
    <div className="grid min-h-screen bg-mist lg:grid-cols-[1.1fr_1fr]">
      {/* ---- campus side */}
      <aside className="relative isolate flex min-h-[260px] flex-col justify-between overflow-hidden bg-navy p-6 text-white sm:p-10 lg:min-h-screen lg:p-14">
        <motion.img
          src="/img/static/skill/b1.webp"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          initial={reduce ? false : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,rgb(16_42_67/0.92)_0%,rgb(16_42_67/0.78)_45%,rgb(16_42_67/0.55)_100%)]" />
        <img src="/brand/seal-white.png" alt="" className="pointer-events-none absolute -right-24 -bottom-24 -z-10 hidden w-[460px] opacity-[0.07] lg:block" />

        <motion.div {...rise(0)} className="flex items-center justify-between gap-4">
          <img src="/brand/logo-white.png" alt="Dr. Lankapalli Bullayya College" className="h-8 w-auto sm:h-10" />
          <Link to="/" className="hidden items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/10 sm:inline-flex">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to website
          </Link>
        </motion.div>

        <div className="mt-10 max-w-lg lg:mt-0">
          <motion.p {...rise(1)} className="text-sm font-semibold tracking-[0.18em] text-gold-2 uppercase">
            PG College · Admissions office
          </motion.p>
          <motion.h1 {...rise(2)} className="display mt-3 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
            Every application, in one place.
          </motion.h1>
          <motion.p {...rise(3)} className="mt-4 hidden text-lg text-white/75 sm:block">
            Review applications, update their status, and follow admissions with live reports.
          </motion.p>
          <motion.ul {...rise(4)} className="mt-8 hidden gap-3 text-sm text-white/85 lg:grid">
            {[
              [Inbox, 'Applications with photo, form and office notes'],
              [BarChart3, 'Reports by course, category, rank and day'],
              [ShieldCheck, 'Staff-only access; sessions end after 12 hours'],
            ].map(([Icon, text]) => {
              const I = Icon as typeof Inbox
              return (
                <li key={text as string} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
                    <I className="h-4 w-4 text-gold-2" aria-hidden="true" />
                  </span>
                  {text as string}
                </li>
              )
            })}
          </motion.ul>
        </div>

        <motion.p {...rise(5)} className="mt-8 hidden text-xs text-white/50 lg:block">
          Dr. Lankapalli Bullayya College · Visakhapatnam · Since 1973
        </motion.p>
      </aside>

      {/* ---- form side */}
      <main className="flex items-center justify-center px-5 py-10 sm:px-10 lg:py-16">
        <motion.form onSubmit={submit} className="w-full max-w-md" {...rise(2)}>
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy text-gold shadow-lg shadow-navy/20">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="display mt-6 text-4xl text-navy">Staff sign in</h2>
          <p className="mt-2 text-slate">Use the admissions dashboard account given to you by the college office.</p>

          {error && (
            <motion.p
              role="alert"
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {error}
            </motion.p>
          )}

          <label htmlFor="u" className="mt-7 block text-sm font-semibold text-navy">
            Username
          </label>
          <div className="relative mt-1.5">
            <UserRound className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate" aria-hidden="true" />
            <input id="u" autoComplete="username" autoFocus value={username} onChange={(e) => setUsername(e.target.value)} className={fieldCls} placeholder="e.g. admin" required />
          </div>

          <label htmlFor="p" className="mt-5 block text-sm font-semibold text-navy">
            Password
          </label>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate" aria-hidden="true" />
            <input id="p" type={showPw ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${fieldCls} !pr-12`} required />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              aria-pressed={showPw}
              className="absolute top-1/2 right-2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate transition hover:bg-navy/5 hover:text-navy"
            >
              {showPw ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>

          <button type="submit" disabled={busy} className="btn-gold mt-7 w-full disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />} {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="my-6 flex items-center gap-3 text-xs font-semibold tracking-wide text-slate uppercase">
            <span className="h-px flex-1 bg-navy/10" /> or <span className="h-px flex-1 bg-navy/10" />
          </div>
          <Link to="/" className="btn-outline w-full">
            <Globe className="h-4 w-4" aria-hidden="true" /> View website
          </Link>

          <p className="mt-8 text-center text-xs text-slate">Forgot your password? Ask the dashboard administrator to reset it.</p>
        </motion.form>
      </main>
    </div>
  )
}

/* ------------------------------------------------------------------ shell */

export default function Admin() {
  const [user, setUser] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    const title = document.title
    document.title = 'Admissions dashboard · LBC'
    api<{ username: string }>('/admin/me')
      .then((r) => setUser(r.username))
      .catch(() => setUser(null))
    return () => {
      meta.remove()
      document.title = title
    }
  }, [])

  const signedOut = useCallback(() => setUser(null), [])
  const ctx = useMemo(() => ({ username: user ?? '', signedOut }), [user, signedOut])

  if (user === undefined)
    return (
      <div className="grid min-h-screen place-items-center bg-navy" role="status" aria-label="Loading">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    )
  if (user === null) return <Login onIn={setUser} />

  const logout = async () => {
    await api('/admin/logout', { body: {} }).catch(() => {})
    setUser(null)
  }

  return (
    <AuthCtx.Provider value={ctx}>
      <div className="min-h-screen bg-mist">
        <header className="sticky top-0 z-30 bg-navy text-white shadow-lg print:hidden">
          <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:px-10">
            <Link to="/admin" className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-gold" aria-hidden="true" />
              <span>
                <span className="display block text-lg leading-tight">Admissions dashboard</span>
                <span className="block text-xs text-white/60">PG College · Dr. L. Bullayya College</span>
              </span>
            </Link>
            <nav aria-label="Dashboard" className="order-last flex w-full gap-1 sm:order-none sm:w-auto">
              {[
                { to: '/admin', label: 'Applications', icon: List, end: true },
                { to: '/admin/reports', label: 'Reports', icon: BarChart3, end: false },
              ].map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  end={t.end}
                  className={({ isActive }) =>
                    `inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition ${isActive ? 'bg-white text-navy' : 'text-white/80 hover:bg-white/10 hover:text-white'}`
                  }
                >
                  <t.icon className="h-4 w-4" aria-hidden="true" /> {t.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-2 text-sm">
              <a href="/" target="_blank" rel="noopener" className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 font-semibold text-white/80 hover:bg-white/10 hover:text-white">
                <Globe className="h-4 w-4" aria-hidden="true" /> <span className="hidden sm:inline">View website</span>
              </a>
              <span className="hidden items-center gap-1.5 text-white/80 lg:flex">
                <UserRound className="h-4 w-4" aria-hidden="true" /> {user}
              </span>
              <button type="button" onClick={logout} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/25 px-4 font-semibold hover:bg-white/10">
                <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
              </button>
            </div>
          </div>
        </header>
        <main className="w-full px-4 py-8 sm:px-6 lg:px-10">
          <Routes>
            <Route index element={<ApplicationList />} />
            <Route path="applications/:appNo" element={<ApplicationDetail />} />
            <Route
              path="reports"
              element={
                <Suspense fallback={<Loader2 className="mx-auto mt-24 h-8 w-8 animate-spin text-navy" />}>
                  <Reports />
                </Suspense>
              }
            />
            <Route path="*" element={<ApplicationList />} />
          </Routes>
        </main>
      </div>
    </AuthCtx.Provider>
  )
}

/* ------------------------------------------------------------------- list */

const EXTRA_FILTERS = [
  { key: 'year', label: 'Year' },
  { key: 'category', label: 'Category' },
  { key: 'local', label: 'Local / Non-Local' },
  { key: 'exam', label: 'Entrance test' },
  { key: 'from', label: 'From' },
  { key: 'to', label: 'To' },
  { key: 'rankMin', label: 'Rank from' },
  { key: 'rankMax', label: 'Rank to' },
]

function ApplicationList() {
  const call = useAdminApi()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const status = params.get('status') ?? ''
  const course = params.get('course') ?? ''
  const sort = params.get('sort') ?? 'newest'
  const page = Math.max(1, Number(params.get('page')) || 1)

  const [search, setSearch] = useState(q)
  const [data, setData] = useState<ListResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const update = useCallback(
    (patch: Record<string, string>) => {
      setParams(
        (p) => {
          const n = new URLSearchParams(p)
          for (const [k, v] of Object.entries(patch)) {
            if (v) n.set(k, v)
            else n.delete(k)
          }
          if (!('page' in patch)) n.delete('page')
          return n
        },
        { replace: true },
      )
    },
    [setParams],
  )

  // search as you type, after a short pause
  useEffect(() => {
    if (search === q) return
    const t = window.setTimeout(() => update({ q: search.trim() }), 300)
    return () => window.clearTimeout(t)
  }, [search, q, update])

  // filters that arrive from Reports (no control of their own here; shown as removable chips)
  const extras = EXTRA_FILTERS.filter((f) => params.get(f.key)).map((f) => ({ ...f, value: params.get(f.key) as string }))
  const extrasKey = extras.map((e) => `${e.key}=${e.value}`).join('&')
  const multiStatus = status.includes(',')

  const query = useMemo(() => {
    const p = new URLSearchParams(extrasKey)
    if (q) p.set('q', q)
    if (status) p.set('status', status)
    if (course) p.set('course', course)
    return p
  }, [q, status, course, extrasKey])

  useEffect(() => {
    let live = true
    setLoading(true)
    const p = new URLSearchParams(query)
    p.set('sort', sort)
    p.set('page', String(page))
    call<ListResponse>(`/applications?${p}`)
      .then((r) => {
        if (!live) return
        setData(r)
        setError('')
      })
      .catch((e) => live && setError(e instanceof Error ? e.message : 'Could not load applications.'))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [call, query, sort, page])

  const total = data ? Object.values(data.counts).reduce((a, b) => a + b, 0) : 0
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1
  const courseOptions = useMemo(() => {
    const seen = new Set(COURSES)
    return [...COURSES, ...(data?.courses.map((c) => c.course).filter((c) => !seen.has(c)) ?? [])]
  }, [data])
  const courseCount = (c: string) => data?.courses.find((x) => x.course === c)?.count ?? 0

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl text-navy sm:text-4xl">Applications</h1>
          <p className="mt-1 text-slate">PG admission applications submitted through the website.</p>
        </div>
        <a href={`/api/admin/applications.csv?${query}`} className="btn-outline" download>
          <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
        </a>
      </div>

      {/* status tiles double as filters */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {(['', ...STATUSES] as const).map((s) => {
          const active = status === s
          const n = s ? (data?.counts[s] ?? 0) : total
          return (
            <button
              key={s || 'all'}
              type="button"
              onClick={() => update({ status: s })}
              aria-pressed={active}
              className={`rounded-2xl border p-4 text-left transition ${active ? 'border-navy bg-navy text-white shadow-lg' : 'border-navy/10 bg-white text-navy hover:border-navy/30'}`}
            >
              <span className={`block text-sm font-semibold ${active ? 'text-white/75' : 'text-slate'}`}>{s ? STATUS_LABEL[s] : 'All applications'}</span>
              <span className="display mt-1 block text-3xl tabular-nums">{data ? n : '–'}</span>
            </button>
          )
        })}
      </div>

      {/* filters */}
      <div className="mt-6 grid gap-3 rounded-2xl border border-navy/10 bg-white p-4 md:grid-cols-[1fr_auto_auto]">
        <label className="relative block">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate" aria-hidden="true" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search number, name, phone, email, hall ticket" className={`${field} pl-9`} />
        </label>
        <label className="block">
          <span className="sr-only">Course</span>
          <select value={course} onChange={(e) => update({ course: e.target.value })} className={field}>
            <option value="">All courses</option>
            {courseOptions.map((c) => (
              <option key={c} value={c}>
                {c} ({courseCount(c)})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">Sort</span>
          <select value={sort} onChange={(e) => update({ sort: e.target.value })} className={field}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
            <option value="rank">Best rank first</option>
          </select>
        </label>
      </div>

      {(extras.length > 0 || multiStatus) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate">Also filtered by:</span>
          {multiStatus && (
            <FilterChip label="Status" value={status.split(',').map((x) => STATUS_LABEL[x as Status] ?? x).join(' or ')} onRemove={() => update({ status: '' })} />
          )}
          {extras.map((e) => (
            <FilterChip key={e.key} label={e.label} value={e.value} onRemove={() => update({ [e.key]: '' })} />
          ))}
          <button type="button" onClick={() => update({ status: multiStatus ? '' : status, ...Object.fromEntries(extras.map((e) => [e.key, ''])) })} className="font-semibold text-royal hover:underline">
            Clear these
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4 font-semibold text-red-800">
          {error}
        </p>
      )}

      {/* table */}
      <div className="relative mt-4 overflow-hidden rounded-2xl border border-navy/10 bg-white">
        {loading && <div className="absolute inset-x-0 top-0 h-1 animate-pulse bg-gold" aria-hidden="true" />}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-navy/10 bg-mist/70 text-xs font-semibold tracking-wide text-slate uppercase">
              <tr>
                <th className="px-4 py-3">Application No.</th>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {data?.items.map((r) => (
                <tr key={r.appNo} className="group relative hover:bg-gold/10">
                  <td className="px-4 py-3 font-semibold whitespace-nowrap text-royal">
                    <Link to={`/admin/applications/${r.appNo}`} className="after:absolute after:inset-0 group-hover:underline">
                      {r.appNo}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block font-semibold text-navy">{r.name}</span>
                    <span className="block text-xs text-slate">{r.phone}</span>
                  </td>
                  <td className="px-4 py-3 text-navy">{r.course}</td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {r.rank} <span className="text-xs text-slate">{r.rankExam}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.category} <span className="text-xs text-slate">· {r.local}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate">{dateTime(r.submittedAt)}</td>
                  <td className="px-4 py-3">
                    <StatusChip s={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data && data.items.length === 0 && (
          <div className="grid place-items-center gap-2 px-4 py-16 text-center text-slate">
            <Inbox className="h-8 w-8" aria-hidden="true" />
            <p className="font-semibold text-navy">{q || status || course || extras.length ? 'No applications match these filters.' : 'No applications yet.'}</p>
          </div>
        )}
      </div>

      {data && data.total > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate">
          <p>
            Showing {(data.page - 1) * data.pageSize + 1}–{Math.min(data.total, data.page * data.pageSize)} of {data.total}
          </p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })} className="btn-outline !min-h-10 !px-3 disabled:opacity-40" aria-label="Previous page">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="tabular-nums">
              Page {page} of {pages}
            </span>
            <button type="button" disabled={page >= pages} onClick={() => update({ page: String(page + 1) })} className="btn-outline !min-h-10 !px-3 disabled:opacity-40" aria-label="Next page">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ----------------------------------------------------------------- detail */

function ApplicationDetail() {
  const call = useAdminApi()
  const { appNo = '' } = useParams()
  const navigate = useNavigate()
  const [d, setD] = useState<Detail | null>(null)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<Status>('submitted')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState('')
  const [pdfBusy, setPdfBusy] = useState(false)

  const load = useCallback(
    (r: Detail) => {
      setD(r)
      setStatus(r.status)
      setNotes(r.notes)
    },
    [setD],
  )

  useEffect(() => {
    setD(null)
    setError('')
    call<Detail>(`/applications/${encodeURIComponent(appNo)}`)
      .then(load)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load the application.'))
  }, [call, appNo, load])

  const changed = !!d && (status !== d.status || notes !== d.notes)
  const save = async () => {
    if (!d) return
    setSaving(true)
    setSaved('')
    try {
      load(await call<Detail>(`/applications/${encodeURIComponent(d.appNo)}`, { method: 'PATCH', body: { status, notes } }))
      setSaved('Saved.')
    } catch (e) {
      setSaved(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setSaving(false)
    }
  }
  const pdf = async () => {
    if (!d) return
    setPdfBusy(true)
    try {
      await downloadPdf(`${d.appNo}-${d.form.name.trim().replace(/[^\w]+/g, '-')}.pdf`)
    } catch {
      window.print()
    } finally {
      setPdfBusy(false)
    }
  }

  if (error)
    return (
      <div>
        <BackLink />
        <p role="alert" className="mt-6 rounded-2xl border border-red-300 bg-red-50 p-5 font-semibold text-red-800">
          {error}
        </p>
      </div>
    )
  if (!d)
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Loading application">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )

  const f = d.form
  return (
    <div>
      <BackLink />
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-slate uppercase">Application No.</p>
          <h1 className="display text-3xl text-navy sm:text-4xl">{d.appNo}</h1>
          <p className="mt-1 text-lg text-navy">
            {f.name} · <span className="text-slate">{f.course}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={pdf} disabled={pdfBusy} className="btn-gold disabled:opacity-60">
            {pdfBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileDown className="h-4 w-4" aria-hidden="true" />} Download PDF
          </button>
          <button type="button" onClick={() => window.print()} className="btn-navy">
            <Printer className="h-4 w-4" aria-hidden="true" /> Print
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="grid content-start gap-4">
          {/* decision */}
          <section className="rounded-2xl border border-navy/10 bg-white p-5">
            <h2 className="font-semibold text-navy">Status</h2>
            <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Application status">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={status === s}
                  onClick={() => setStatus(s)}
                  className={`min-h-10 rounded-xl border px-3 text-sm font-semibold transition ${status === s ? 'border-navy bg-navy text-white' : 'border-navy/15 bg-white text-navy hover:border-navy/40'}`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
            {d.statusChangedAt && (
              <p className="mt-2 text-xs text-slate">
                Last changed {dateTime(d.statusChangedAt)} by {d.statusChangedBy}
              </p>
            )}
            <p className="mt-2 text-xs text-slate">Once it is no longer “Submitted”, the applicant can’t edit it online.</p>
            <label htmlFor="notes" className="mt-4 block font-semibold text-navy">
              Office notes
            </label>
            <textarea id="notes" rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={5000} className={`${field} mt-1.5`} placeholder="Visible to admins only" />
            <div className="mt-3 flex items-center gap-3">
              <button type="button" onClick={save} disabled={!changed || saving} className="btn-gold disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />} Save
              </button>
              {saved && (
                <span role="status" className="text-sm text-slate">
                  {saved}
                </span>
              )}
            </div>
          </section>

          {/* record */}
          <section className="rounded-2xl border border-navy/10 bg-white p-5 text-sm">
            <h2 className="font-semibold text-navy">Record</h2>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <dt className="text-slate">Submitted</dt>
              <dd className="text-navy">{dateTime(d.submittedAt)}</dd>
              <dt className="text-slate">Last updated</dt>
              <dd className="text-navy">
                {dateTime(d.updatedAt)} {d.revision > 1 && <span className="text-slate">({d.revision - 1} edit{d.revision > 2 ? 's' : ''})</span>}
              </dd>
              <dt className="text-slate">Status</dt>
              <dd>
                <StatusChip s={d.status} />
              </dd>
            </dl>
            <div className="mt-4 grid gap-2">
              <a href={`tel:${f.phone}`} className="flex items-center gap-2 font-semibold text-royal hover:underline">
                <Phone className="h-4 w-4" aria-hidden="true" /> {f.phone}
              </a>
              <a href={`mailto:${f.email}?subject=${encodeURIComponent(`Your application ${d.appNo}`)}`} className="flex items-center gap-2 font-semibold break-all text-royal hover:underline">
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> {f.email}
              </a>
            </div>
          </section>

          {d.others.length > 0 && (
            <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm">
              <h2 className="font-semibold text-amber-900">Same Aadhaar on other applications</h2>
              <ul className="mt-2 grid gap-2">
                {d.others.map((o) => (
                  <li key={o.appNo}>
                    <button type="button" onClick={() => navigate(`/admin/applications/${o.appNo}`)} className="font-semibold text-royal hover:underline">
                      {o.appNo}
                    </button>{' '}
                    <span className="text-amber-900/80">· {o.course}</span> <StatusChip s={o.status} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        <section className="min-w-0 rounded-2xl bg-white p-3 sm:p-6" aria-label="Application form">
          <SheetPreview>
            <ApplicationSheet f={f} date={dateOnly(d.submittedAt)} appNo={d.appNo} />
          </SheetPreview>
        </section>
      </div>
      <PrintRoot>
        <ApplicationSheet f={f} date={dateOnly(d.submittedAt)} appNo={d.appNo} />
      </PrintRoot>
    </div>
  )
}

function FilterChip({ label, value, onRemove }: { label: string; value: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-navy/15 bg-white py-1 pr-1 pl-3 text-navy">
      <span className="text-slate">{label}:</span> <b className="font-semibold">{value}</b>
      <button type="button" onClick={onRemove} aria-label={`Remove ${label} filter`} className="grid h-6 w-6 place-items-center rounded-full hover:bg-navy/10">
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </span>
  )
}

function BackLink(): ReactNode {
  return (
    <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-royal hover:underline">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All applications
    </Link>
  )
}
