import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FileText, Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Counter } from '../components/Motion'
import { PageHero } from '../components/PageHero'
import { faculty, initials, type FacultyMember } from '../lib/data'

/* UG faculty are published per programme page (B.A., B.Sc. …) with department tables inside. */
const UG_PROGRAMMES = ['B.A.', 'B.Com.', 'B.Sc.', 'BBA', 'BCA', 'Library Science']

/** Short role badge from a published designation, e.g. "Associate Professor & HOD" → "HOD". */
function roleBadge(d: string) {
  if (/vice[\s-]*principal/i.test(d)) return 'Vice Principal'
  if (/principal/i.test(d)) return 'Principal'
  if (/hod|head of/i.test(d)) return 'HOD'
  if (/assistant dean/i.test(d)) return 'Assistant Dean'
  if (/dean/i.test(d)) return 'Dean'
  if (/director/i.test(d)) return 'Director'
  if (/co-?ordinator/i.test(d)) return 'Coordinator'
  return null
}

type Filter = { college: 'all' | 'UG' | 'PG'; programme: string; dept: string; q: string }

const tidy = (s: string) => s.replace(/\s+/g, ' ').trim()
const groupLabel = (f: FacultyMember) => (f.college === 'PG' ? f.programme : tidy(f.group).replace(/^ENVIRONMENTAL SCIENCES$/, 'Environmental Sciences'))
const quals = (q: string) =>
  q
    .split(/,(?![^(]*\))/)
    .map((s) => s.trim())
    .filter(Boolean)

function useFilter(): [Filter, (patch: Partial<Filter>) => void] {
  const [params, setParams] = useSearchParams()
  const dept0 = params.get('dept') ?? 'all'
  const programme = params.get('programme') ?? (dept0 !== 'all' ? (faculty.find((x) => x.group === dept0)?.programme ?? 'all') : 'all')
  const college = (params.get('college') as Filter['college']) ?? (programme !== 'all' && UG_PROGRAMMES.includes(programme) ? 'UG' : 'all')
  const f: Filter = { college, programme, dept: params.get('dept') ?? 'all', q: params.get('q') ?? '' }
  const set = (patch: Partial<Filter>) => {
    const next = { ...f, ...patch }
    const p = new URLSearchParams()
    if (next.college !== 'all') p.set('college', next.college)
    if (next.programme !== 'all') p.set('programme', next.programme)
    if (next.dept !== 'all') p.set('dept', next.dept)
    if (next.q) p.set('q', next.q)
    setParams(p, { replace: true })
  }
  return [f, set]
}

const fileType = (u: string) => (u.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Word')
const EASE = [0.16, 1, 0.3, 1] as const

/** Round portrait, or initials on warm paper when no photo is published. */
function Avatar({ f, size }: { f: FacultyMember; size: 'lg' | 'sm' }) {
  const box = size === 'lg' ? 'h-full w-full rounded-[18px]' : 'h-16 w-16 rounded-full'
  if (f.photo) return <img src={f.photo} alt="" className={`${box} shrink-0 bg-track object-cover object-top`} loading="lazy" />
  return (
    <span aria-hidden="true" className={`${box} display grid shrink-0 place-items-center bg-gold-soft text-navy ${size === 'lg' ? 'text-5xl' : 'text-xl'}`}>
      {initials(f.name)}
    </span>
  )
}

function Quals({ f, max }: { f: FacultyMember; max: number }) {
  const q = quals(f.qualification)
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Qualifications">
      {q.slice(0, max).map((x) => (
        <li key={x} className="rounded-full bg-mist px-2.5 py-0.5 text-xs text-slate">
          {x}
        </li>
      ))}
      {q.length > max && (
        <li className="rounded-full px-1.5 py-0.5 text-xs text-slate" title={q.slice(max).join(', ')}>
          +{q.length - max} more
        </li>
      )}
    </ul>
  )
}

function ProfileLink({ f, label }: { f: FacultyMember; label?: boolean }) {
  if (!f.profile) return null
  return (
    <a
      href={f.profile}
      target="_blank"
      rel="noopener noreferrer"
      className={label ? 'btn-outline !min-h-10 !px-4 !py-2' : 'grid h-10 w-10 shrink-0 place-items-center rounded-full border border-navy/12 text-navy transition hover:border-navy hover:bg-navy hover:text-white'}
      title={`Profile (${fileType(f.profile)})`}
    >
      <FileText className="h-4 w-4" aria-hidden="true" />
      {label ? <>Profile ({fileType(f.profile)})</> : null}
      <span className="sr-only">
        {label ? '' : `Profile of ${f.name} (${fileType(f.profile)})`}, opens in a new tab
      </span>
    </a>
  )
}

/** Department head (or principal): portrait-led feature card. */
function FeaturedCard({ f }: { f: FacultyMember }) {
  const reduce = useReducedMotion()
  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="navy-flat grid overflow-hidden rounded-[24px] text-white sm:grid-cols-[180px_1fr]"
    >
      <div className="aspect-[4/5] p-3 sm:aspect-auto">
        <Avatar f={f} size="lg" />
      </div>
      <div className="flex flex-col p-6 sm:py-7 sm:pr-8 sm:pl-3">
        <span className="w-fit rounded-full bg-gold px-3 py-1 text-xs font-bold text-navy">{roleBadge(f.designation) ?? 'Head of department'}</span>
        <h3 className="display mt-4 text-3xl leading-tight">{f.name}</h3>
        <p className="mt-1 text-white/80">{f.designation}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Qualifications">
          {quals(f.qualification).map((q) => (
            <li key={q} className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs text-white/85">
              {q}
            </li>
          ))}
        </ul>
        {f.profile && (
          <a href={f.profile} target="_blank" rel="noopener noreferrer" className="btn-gold mt-auto w-fit !min-h-10 !py-2 sm:mt-6">
            <FileText className="h-4 w-4" aria-hidden="true" /> Profile ({fileType(f.profile)})
            <span className="sr-only">, opens in a new tab</span>
          </a>
        )}
      </div>
    </motion.article>
  )
}

/** Everyone else: compact directory row. */
function PersonRow({ f, i }: { f: FacultyMember; i: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.li
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, delay: Math.min(i * 0.025, 0.25), ease: EASE }}
      className="flex items-start gap-4 rounded-[20px] border border-navy/8 bg-white p-4 transition duration-300 hover:border-navy/20 hover:shadow-[0_18px_40px_-28px_rgb(16_42_67/0.6)]"
    >
      <Avatar f={f} size="sm" />
      <div className="min-w-0 flex-1">
        <h3 className="display text-lg leading-snug">{f.name}</h3>
        <p className="text-sm text-royal">{f.designation}</p>
        <Quals f={f} max={3} />
      </div>
      <ProfileLink f={f} />
    </motion.li>
  )
}

/** One head per section is featured: Principal first, then HOD / Head of the Department. */
function pickHead(people: FacultyMember[]) {
  return people.find((p) => /principal/i.test(p.designation) && !/vice/i.test(p.designation)) ?? people.find((p) => /hod|head of/i.test(p.designation))
}

function Sidebar({ f, set, counts }: { f: Filter; set: (p: Partial<Filter>) => void; counts: Map<string, number> }) {
  const ugGroups = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const p of faculty.filter((x) => x.college === 'UG')) {
      const list = m.get(p.programme) ?? []
      if (!list.includes(p.group)) list.push(p.group)
      m.set(p.programme, list)
    }
    return m
  }, [])
  const pgDepts = useMemo(() => [...new Set(faculty.filter((x) => x.college === 'PG').map((x) => x.programme))], [])
  const item = (active: boolean) => `flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${active ? 'bg-navy font-semibold text-white' : 'text-navy hover:bg-mist'}`
  const count = (k: string, active: boolean) => <span className={`text-xs ${active ? 'text-gold-2' : 'text-slate'}`}>{counts.get(k) ?? 0}</span>

  return (
    <nav aria-label="Filter faculty by department" className="grid gap-6">
      <div role="group" aria-label="College" className="grid grid-cols-3 rounded-full bg-mist p-1">
        {(['all', 'UG', 'PG'] as const).map((c) => (
          <button key={c} type="button" aria-pressed={f.college === c} onClick={() => set({ college: c, programme: 'all', dept: 'all' })} className={`relative min-h-10 rounded-full text-sm font-semibold ${f.college === c ? 'text-white' : 'text-navy'}`}>
            {f.college === c && <motion.span layoutId="fac-college" className="absolute inset-0 rounded-full bg-navy" transition={{ type: 'spring', stiffness: 260, damping: 28 }} />}
            <span className="relative">{c === 'all' ? 'All' : c === 'UG' ? 'Degree' : 'PG'}</span>
          </button>
        ))}
      </div>

      {f.college !== 'PG' && (
        <div>
          <p className="px-3 text-sm font-semibold text-royal">Degree College</p>
          <ul className="mt-2 grid gap-0.5">
            {UG_PROGRAMMES.map((prog) => {
              const groups = ugGroups.get(prog) ?? []
              const progActive = f.programme === prog && f.dept === 'all'
              return (
                <li key={prog}>
                  <button type="button" className={item(progActive)} aria-pressed={progActive} onClick={() => set({ college: 'UG', programme: prog, dept: 'all' })}>
                    <span className="font-semibold">{prog}</span>
                    {count(`UG|${prog}`, progActive)}
                  </button>
                  {groups.length > 1 && f.programme === prog && (
                    <ul className="mt-0.5 ml-3 grid gap-0.5 border-l border-gold/40 pl-2">
                      {groups.map((g) => {
                        const a = f.dept === g
                        return (
                          <li key={g}>
                            <button type="button" className={item(a)} aria-pressed={a} onClick={() => set({ college: 'UG', programme: prog, dept: g })}>
                              <span>{tidy(g).replace(/^ENVIRONMENTAL SCIENCES$/, 'Environmental Sciences')}</span>
                              {count(`G|${g}`, a)}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {f.college !== 'UG' && (
        <div>
          <p className="px-3 text-sm font-semibold text-royal">PG College</p>
          <ul className="mt-2 grid gap-0.5">
            {pgDepts.map((d) => {
              const a = f.college === 'PG' && f.programme === d
              return (
                <li key={d}>
                  <button type="button" className={item(a)} aria-pressed={a} onClick={() => set({ college: 'PG', programme: d, dept: 'all' })}>
                    <span>{d}</span>
                    {count(`PG|${d}`, a)}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </nav>
  )
}

export default function Faculty() {
  const [f, set] = useFilter()
  const [drawer, setDrawer] = useState(false)

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    const inc = (k: string) => m.set(k, (m.get(k) ?? 0) + 1)
    for (const p of faculty) {
      inc(`${p.college}|${p.programme}`)
      if (p.college === 'UG') inc(`G|${p.group}`)
    }
    return m
  }, [])

  const list = useMemo(() => {
    const s = f.q.trim().toLowerCase()
    return faculty.filter(
      (p) =>
        (f.college === 'all' || p.college === f.college) &&
        (f.programme === 'all' || p.programme === f.programme) &&
        (f.dept === 'all' || p.group === f.dept) &&
        (!s || `${p.name} ${p.designation} ${p.qualification} ${p.group} ${p.programme}`.toLowerCase().includes(s)),
    )
  }, [f.college, f.programme, f.dept, f.q])

  const sections = useMemo(() => {
    const m = new Map<string, { college: string; people: FacultyMember[] }>()
    for (const p of list) {
      const key = `${p.college}|${groupLabel(p)}`
      m.set(key, { college: p.college, people: [...(m.get(key)?.people ?? []), p] })
    }
    return [...m.entries()].map(([k, v]) => ({ title: k.split('|')[1], ...v }))
  }, [list])

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawer])

  const scope =
    f.dept !== 'all' ? tidy(f.dept) : f.programme !== 'all' ? f.programme : f.college === 'UG' ? 'the Degree College' : f.college === 'PG' ? 'the PG College' : 'all departments'

  return (
    <>
      <PageHero
        eyebrow="Faculty directory"
        title="Meet our faculty"
        text="Teachers of the Degree and PG colleges, with designations, qualifications and profiles as published by the college."
      >
        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
          {[
            [faculty.length, 'faculty listed'],
            [faculty.filter((x) => x.college === 'UG').length, 'Degree College'],
            [faculty.filter((x) => x.college === 'PG').length, 'PG College'],
          ].map(([n, l]) => (
            <div key={l}>
              <dd className="display text-4xl text-gold-2">
                <Counter to={n as number} />
              </dd>
              <dt className="text-sm text-white/70">{l}</dt>
            </div>
          ))}
        </dl>
      </PageHero>

      <section className="bg-mist py-14 lg:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] min-[1360px]:top-36 min-[1360px]:max-h-[calc(100vh-10rem)] overflow-y-auto rounded-[22px] border border-navy/8 bg-white p-4">
              <Sidebar f={f} set={set} counts={counts} />
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Search faculty</span>
                <Search className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-slate" aria-hidden="true" />
                <input
                  type="search"
                  value={f.q}
                  onChange={(e) => set({ q: e.target.value })}
                  placeholder="Search by name, subject or qualification"
                  className="min-h-14 w-full rounded-full border border-navy/10 bg-white pr-5 pl-14 text-base text-navy shadow-sm outline-none focus:border-navy/30 focus:ring-4 focus:ring-gold/30"
                />
              </label>
              <button type="button" onClick={() => setDrawer(true)} className="btn-outline bg-white lg:hidden">
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Departments
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3" aria-live="polite">
              <p className="text-slate">
                <span className="font-semibold text-navy">{list.length}</span> {list.length === 1 ? 'person' : 'people'} in {scope}
                {f.q && (
                  <>
                    {' '}
                    matching “<span className="text-navy">{f.q}</span>”
                  </>
                )}
              </p>
              {(f.college !== 'all' || f.programme !== 'all' || f.dept !== 'all' || f.q) && (
                <button type="button" onClick={() => set({ college: 'all', programme: 'all', dept: 'all', q: '' })} className="inline-flex min-h-9 items-center gap-1 rounded-full border border-navy/15 bg-white px-3 text-sm font-semibold text-navy hover:bg-navy hover:text-white">
                  <X className="h-3.5 w-3.5" aria-hidden="true" /> Clear filters
                </button>
              )}
            </div>

            {sections.map((s) => (
              <section key={s.college + s.title} className="mt-12 first-of-type:mt-8" aria-labelledby={`fac-${s.college}-${s.title}`}>
                <div className="flex items-baseline justify-between gap-4 border-b border-navy/10 pb-3">
                  <h2 id={`fac-${s.college}-${s.title}`} className="display text-3xl">
                    {s.title}
                  </h2>
                  <p className="shrink-0 text-sm text-slate">
                    {s.college === 'UG' ? 'Degree College' : 'PG College'} · {s.people.length}
                  </p>
                </div>
                {(() => {
                  const head = pickHead(s.people)
                  const rest = s.people.filter((p) => p !== head)
                  return (
                    <>
                      {head && (
                        <div className="mt-6">
                          <FeaturedCard f={head} />
                        </div>
                      )}
                      {rest.length > 0 && (
                        <ul className="mt-4 grid gap-3 md:grid-cols-2">
                          <AnimatePresence initial={false}>
                            {rest.map((p, i) => (
                              <PersonRow key={p.college + p.programme + p.name} f={p} i={i} />
                            ))}
                          </AnimatePresence>
                        </ul>
                      )}
                    </>
                  )
                })()}
              </section>
            ))}

            {list.length === 0 && (
              <div className="mt-10 rounded-[22px] border border-dashed border-navy/15 bg-white p-10 text-center">
                <p className="display text-2xl text-navy">No one matches that search</p>
                <p className="mt-2 text-slate">Try a surname, a subject such as “Chemistry”, or a qualification such as “Ph.D.”.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} className="fixed inset-0 z-[60] bg-navy/40 backdrop-blur-sm lg:hidden" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filter faculty by department"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-[61] w-[86%] max-w-sm overflow-y-auto bg-white p-5 lg:hidden"
              onClick={(e) => (e.target as HTMLElement).closest('button[aria-pressed]') && window.setTimeout(() => setDrawer(false), 150)}
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="display text-2xl text-navy">Departments</p>
                <button type="button" onClick={() => setDrawer(false)} aria-label="Close filters" className="grid h-11 w-11 place-items-center rounded-full bg-mist text-navy">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Sidebar f={f} set={set} counts={counts} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
