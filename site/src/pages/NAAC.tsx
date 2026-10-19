import { ArrowUpRight, FileText, Search } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { off } from '../content/site'
import { type NaacRow } from '../lib/data'
import { naac } from '../lib/naac'

const CRITERIA: Record<string, string> = {
  '1': 'Curricular Aspects',
  '2': 'Teaching-Learning and Evaluation',
  '3': 'Research, Innovations and Extension',
  '4': 'Infrastructure and Learning Resources',
  '5': 'Student Support and Progression',
  '6': 'Governance, Leadership and Management',
  '7': 'Institutional Values and Best Practices',
}

const VIEWS = [
  ['ssr', 'Self Study Report'],
  ['dvv', 'DVV clarifications'],
  ['quality', 'Quality metrics'],
  ['extended', 'Extended profile'],
] as const

export default function NAAC() {
  const [params, setParams] = useSearchParams()
  const view = (params.get('view') ?? 'ssr') as (typeof VIEWS)[number][0]
  const c = params.get('c') ?? '1'
  const college = (params.get('college') ?? 'ug') as 'ug' | 'pg'
  const q = params.get('q') ?? ''
  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) next.delete(k)
      else next.set(k, v)
    }
    setParams(next, { replace: true })
  }

  const data = naac[college]
  const rows: NaacRow[] = useMemo(() => (view === 'ssr' || view === 'dvv' ? (data[view][c] ?? []) : data[view]), [data, view, c])
  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim()
    return s ? rows.filter((r) => `${r.cells.join(' ')} ${r.label}`.toLowerCase().includes(s)) : rows
  }, [rows, q])

  // group by metric
  const groups = useMemo(() => {
    const m = new Map<string, NaacRow[]>()
    for (const r of filtered) m.set(r.cells[0] || '—', [...(m.get(r.cells[0] || '—') ?? []), r])
    return [...m.entries()]
  }, [filtered])

  const officialPath = `/${college === 'ug' ? 'ugcollege' : 'pgcollege'}/${view === 'ssr' ? `criteria${c}` : view === 'dvv' ? `dvvcriteria${c}` : view}`

  return (
    <>
      <PageHero eyebrow="Accreditation" title="NAAC" text="Self Study Report, Data Validation & Verification (DVV) responses, quality metrics and extended profile — every supporting document preserved from the official website.">
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <img src="/brand/a-grade.png" alt="Accredited with Grade A by NAAC" className="h-20 w-auto rounded-xl bg-white p-1" />
          <a href={off('/static/images/rar-2015.pdf')} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            RAR-2015 <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </PageHero>
      <section className="bg-mist py-12">
        <div className="container-x">
          <div className="card grid gap-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <div role="group" aria-label="College" className="inline-flex rounded-full bg-mist p-1">
                {(['ug', 'pg'] as const).map((k) => (
                  <button key={k} type="button" aria-pressed={college === k} onClick={() => set({ college: k === 'ug' ? null : k })} className={`rounded-full px-4 py-2 text-sm font-bold ${college === k ? 'bg-navy text-white' : 'text-navy'}`}>
                    {k === 'ug' ? 'Degree College' : 'PG College'}
                  </button>
                ))}
              </div>
              <div role="group" aria-label="Section" className="flex flex-wrap gap-2">
                {VIEWS.map(([k, l]) => (
                  <button key={k} type="button" aria-pressed={view === k} onClick={() => set({ view: k })} className={`rounded-full px-4 py-2 text-sm font-bold ${view === k ? 'bg-royal text-white' : 'bg-white text-navy ring-1 ring-navy/10'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {(view === 'ssr' || view === 'dvv') && (
              <div role="group" aria-label="Criterion" className="scrollbar-none flex gap-2 overflow-x-auto">
                {Object.entries(CRITERIA).map(([n, name]) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={c === n}
                    onClick={() => set({ c: n })}
                    className={`shrink-0 rounded-2xl px-4 py-3 text-left transition ${c === n ? 'bg-navy text-white' : 'bg-mist text-navy hover:bg-white hover:ring-1 hover:ring-royal'}`}
                  >
                    <span className="block text-[10px] font-extrabold text-gold">Criterion {n}</span>
                    <span className="block text-sm font-bold">{name}</span>
                  </button>
                ))}
              </div>
            )}
            <label className="relative max-w-md">
              <span className="sr-only">Search documents</span>
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate/40" aria-hidden="true" />
              <input
                type="search"
                value={q}
                onChange={(e) => set({ q: e.target.value || null })}
                placeholder="Search metric, year or description"
                className="w-full rounded-full border border-navy/12 py-3 pr-4 pl-11 text-sm outline-none focus:border-royal focus:ring-4 focus:ring-royal/10"
              />
            </label>
          </div>

          <p className="mt-6 text-sm font-semibold text-slate/60" aria-live="polite">
            {filtered.length} documents
          </p>
          <div className="mt-4 grid gap-5">
            {groups.map(([metric, items]) => {
              const title = items[0].cells.length >= 4 ? items[0].cells[1] : ''
              const isQuery = view === 'dvv' && title.length > 90
              return (
                <article key={metric} className="card overflow-hidden">
                  <header className="flex flex-wrap items-baseline gap-3 border-b border-navy/8 bg-white px-6 py-4">
                    <span className="rounded-lg bg-navy px-2.5 py-1 text-sm font-extrabold text-gold">{metric}</span>
                    {title && !isQuery && <h2 className=" text-navy">{title}</h2>}
                  </header>
                  {isQuery && (
                    <details className="border-b border-navy/8 bg-gold-soft/40 px-6 py-3 text-sm">
                      <summary className="cursor-pointer font-bold text-navy">DVV query from NAAC</summary>
                      <p className="mt-2 leading-relaxed text-slate/75">{title}</p>
                    </details>
                  )}
                  <ul className="divide-y divide-navy/6">
                    {items.map((r, i) => {
                      const fileNo = r.cells.length >= 4 ? r.cells[2] : r.cells[1]
                      const desc = (r.cells.length >= 4 ? r.cells[3] : r.cells[2]) || r.label || 'Supporting document'
                      return (
                        <li key={r.href + i}>
                          {r.unavailable ? (
                            <div className="flex items-center gap-4 px-6 py-3.5 text-slate/45">
                              <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
                              <span className="w-24 shrink-0 text-xs font-bold">{fileNo}</span>
                              <span className="flex-1 text-sm">{desc} — not currently returned by the official server</span>
                            </div>
                          ) : (
                            <a href={r.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 px-6 py-3.5 transition hover:bg-mist">
                              <FileText className="h-4 w-4 shrink-0 text-royal" aria-hidden="true" />
                              <span className="w-24 shrink-0 text-xs font-bold text-slate/55">{fileNo}</span>
                              <span className="flex-1 text-sm font-semibold text-navy group-hover:text-royal">{desc}</span>
                              <ArrowUpRight className="h-4 w-4 text-slate/30 group-hover:text-royal" aria-hidden="true" />
                            </a>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </article>
              )
            })}
            {groups.length === 0 && <p className="rounded-2xl bg-white p-8 text-center text-slate/60">No documents match.</p>}
          </div>
          <a href={off(officialPath)} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-1 text-sm font-bold text-royal">
            View this section on the official site <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  )
}
