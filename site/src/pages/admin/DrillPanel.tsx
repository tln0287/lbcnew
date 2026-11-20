import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Download, ExternalLink, Inbox, Loader2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { STATUS_LABEL, type Status } from '../../lib/application'
import { fmt, STATUS_COLOR } from './charts'
import { useAdminApi } from './session'

export type Drill = { title: string; params: Record<string, string> }

type Row = { appNo: string; name: string; course: string; phone: string; category: string; local: string; status: Status; rankExam: string; rank: string; submittedAt: string }
type ListResponse = { items: Row[]; total: number; page: number; pageSize: number }

const when = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' })
const PAGE = 20

/** Slide-over listing the applications behind a number or chart mark in the reports. */
export function DrillPanel({ drill, onClose }: { drill: Drill | null; onClose: () => void }) {
  const reduce = useReducedMotion()
  return (
    <AnimatePresence>
      {drill && (
        <motion.div className="fixed inset-0 z-50 print:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.2 }}>
          <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 h-full w-full cursor-default bg-navy/40 backdrop-blur-[2px]" />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="drill-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-3xl flex-col bg-mist shadow-[-20px_0_60px_-20px_rgb(16_42_67/0.5)]"
            initial={{ x: reduce ? 0 : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: reduce ? 0 : '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          >
            <Body key={new URLSearchParams(drill.params).toString()} drill={drill} onClose={onClose} />
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Body({ drill, onClose }: { drill: Drill; onClose: () => void }) {
  const call = useAdminApi()
  const reduce = useReducedMotion()
  const [page, setPage] = useState(1)
  const [data, setData] = useState<ListResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const query = new URLSearchParams(drill.params).toString()

  useEffect(() => {
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  useEffect(() => {
    let live = true
    setLoading(true)
    call<ListResponse>(`/applications?${query}&sort=newest&page=${page}&pageSize=${PAGE}`)
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
  }, [call, query, page])

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <>
      <header className="flex items-start justify-between gap-4 bg-navy px-5 py-5 text-white sm:px-7">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-gold-2 uppercase">Applications</p>
          <h2 id="drill-title" className="display mt-1 text-2xl sm:text-3xl">
            {drill.title}
          </h2>
          <p className="mt-1 text-sm text-white/70" aria-live="polite">
            {data ? `${fmt(data.total)} application${data.total === 1 ? '' : 's'}` : 'Loading…'}
          </p>
        </div>
        <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close panel" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/25 hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-gold/50 focus-visible:outline-none">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-navy/10 bg-white px-5 py-3 sm:px-7">
        <Link to={`/admin?${query}`} className="btn-outline !min-h-10 !px-4 text-sm">
          <ExternalLink className="h-4 w-4" aria-hidden="true" /> Open in Applications list
        </Link>
        <a href={`/api/admin/applications.csv?${query}`} className="btn-outline !min-h-10 !px-4 text-sm" download>
          <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
        </a>
      </div>

      <div className="relative flex-1 overflow-y-auto px-3 py-4 sm:px-7">
        {loading && <div className="absolute inset-x-0 top-0 h-1 animate-pulse bg-gold" aria-hidden="true" />}
        {error && (
          <p role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-4 font-semibold text-red-800">
            {error}
          </p>
        )}
        {!data && !error && (
          <div className="grid place-items-center py-20" role="status" aria-label="Loading">
            <Loader2 className="h-7 w-7 animate-spin text-navy" />
          </div>
        )}
        {data && data.items.length === 0 && (
          <div className="grid place-items-center gap-2 py-20 text-center text-slate">
            <Inbox className="h-8 w-8" aria-hidden="true" />
            <p className="font-semibold text-navy">No applications here.</p>
          </div>
        )}
        {data && data.items.length > 0 && (
          <ul className="grid gap-2">
            {data.items.map((r, i) => (
              <motion.li key={`${page}-${r.appNo}`} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : Math.min(i * 0.025, 0.4), duration: 0.3 }}>
                <Link
                  to={`/admin/applications/${r.appNo}`}
                  className="grid gap-x-4 gap-y-1 rounded-2xl border border-navy/10 bg-white px-4 py-3 transition hover:border-navy/30 hover:shadow-md focus-visible:ring-4 focus-visible:ring-gold/40 focus-visible:outline-none sm:grid-cols-[10.5rem_1fr_auto]"
                >
                  <span className="font-semibold text-royal">{r.appNo}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-navy">{r.name}</span>
                    <span className="block truncate text-xs text-slate">
                      {r.course} · {r.rankExam} {r.rank} · {r.category} · {r.local}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy">
                      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: STATUS_COLOR[r.status] }} aria-hidden="true" />
                      {STATUS_LABEL[r.status]}
                    </span>
                    <span className="text-xs text-slate">{when(r.submittedAt)}</span>
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      {data && data.total > PAGE && (
        <footer className="flex items-center justify-between gap-3 border-t border-navy/10 bg-white px-5 py-3 text-sm text-slate sm:px-7">
          <span>
            {fmt((page - 1) * PAGE + 1)}–{fmt(Math.min(data.total, page * PAGE))} of {fmt(data.total)}
          </span>
          <span className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page" className="btn-outline !min-h-10 !px-3 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="tabular-nums">
              {page} / {pages}
            </span>
            <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} aria-label="Next page" className="btn-outline !min-h-10 !px-3 disabled:opacity-40">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </span>
        </footer>
      )}
    </>
  )
}
