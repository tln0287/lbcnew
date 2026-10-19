import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, FileText, FlaskConical, GraduationCap, Search, Users } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { categories, ugDepartments } from '../content/departments'
import { faculty, pgProgrammes, sectionAfter } from '../lib/data'

const pgCategory = { id: 'pg', name: 'PG Departments' }

export default function Departments() {
  const [params, setParams] = useSearchParams()
  const cat = params.get('category') ?? 'all'
  const q = params.get('q') ?? ''
  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    if (!v || v === 'all') next.delete(k)
    else next.set(k, v)
    setParams(next, { replace: true })
  }

  const facultyCount = useMemo(() => {
    const m = new Map<string, number>()
    for (const f of faculty) m.set(f.group, (m.get(f.group) ?? 0) + 1)
    return m
  }, [])

  const ug = useMemo(() => {
    const s = q.toLowerCase()
    return ugDepartments.filter(
      (d) => (cat === 'all' || d.category === cat) && (!s || `${d.name} ${d.honours ?? ''}`.toLowerCase().includes(s)),
    )
  }, [cat, q])
  const pg = useMemo(() => {
    const s = q.toLowerCase()
    return pgProgrammes.filter((p) => (cat === 'all' || cat === 'pg') && (!s || `${p.name} ${p.title}`.toLowerCase().includes(s)))
  }, [cat, q])

  const current = categories.find((c) => c.id === cat)

  return (
    <>
      <PageHero
        eyebrow="Department explorer"
        title="Departments"
        text="Departments as listed in the official directory, with the courses offered under the revised APSCHE syllabus (2023-24), faculty, outcomes and laboratories."
        image={current?.image ?? '/img/media/jrcollege/news/chemistry_lab-2-block-1.webp'}
      />
      <section className="bg-mist py-14">
        <div className="container-x">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filter by category">
              {[{ id: 'all', name: 'All programmes' }, ...categories, pgCategory].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={cat === c.id}
                  onClick={() => set('category', c.id)}
                  className={`relative shrink-0 rounded-full px-4 py-2.5 text-sm font-bold transition ${cat === c.id ? 'text-white' : 'bg-white text-navy ring-1 ring-navy/10 hover:ring-royal'}`}
                >
                  {cat === c.id && <motion.span layoutId="dept-cat" className="absolute inset-0 rounded-full bg-navy" />}
                  <span className="relative">{c.name}</span>
                </button>
              ))}
            </div>
            <label className="relative w-full lg:w-80">
              <span className="sr-only">Search departments</span>
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate/40" aria-hidden="true" />
              <input
                type="search"
                value={q}
                onChange={(e) => set('q', e.target.value)}
                placeholder="Search departments"
                className="w-full rounded-full border border-navy/12 bg-white py-3 pr-4 pl-11 text-sm outline-none focus:border-royal focus:ring-4 focus:ring-royal/10"
              />
            </label>
          </div>

          <AnimatePresence mode="wait">
            {current && (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-10 grid overflow-hidden rounded-[2rem] bg-navy text-white lg:grid-cols-[1fr_1.4fr]"
              >
                <img src={current.image} alt="" className="h-56 w-full object-cover lg:h-full" />
                <div className="p-8">
                  <p className="eyebrow !text-gold">Degree College</p>
                  <h2 className="mt-3 text-3xl">{current.name}</h2>
                  {current.combinations.length > 0 && (
                    <>
                      <p className="mt-5 text-xs font-bold text-white/50">Subject combinations offered earlier</p>
                      <ul className="mt-2 grid gap-1 text-sm text-white/80">
                        {current.combinations.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {current.programme && (
                      <Link to={current.programme} className="btn-gold !py-2.5">
                        Programme details
                      </Link>
                    )}
                    <a href={current.official} target="_blank" rel="noopener noreferrer" className="btn-ghost !py-2.5">
                      Official page <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {ug.length > 0 && (
            <>
              <h2 className="mt-14 text-sm text-royal">Degree College departments · {ug.length}</h2>
              <motion.ul layout className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {ug.map((d) => {
                    const c = categories.find((x) => x.id === d.category)!
                    const n = d.facultyGroup ? facultyCount.get(d.facultyGroup) : undefined
                    return (
                      <motion.li
                        layout
                        key={d.name}
                        initial={{ opacity: 0, y: 20, rotateX: -10 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.35 }}
                        style={{ transformPerspective: 800 }}
                        className="card flex flex-col p-6"
                      >
                        <p className="text-[11px] font-extrabold text-royal">{c.name}</p>
                        <h3 className="mt-2 text-xl text-navy">{d.name}</h3>
                        <p className="mt-2 text-sm text-slate/70">{d.honours ?? 'Listed in the official department directory'}</p>
                        <ul className="mt-4 grid gap-1.5 text-sm">
                          {d.lab && (
                            <li className="flex items-center gap-2 text-slate/70">
                              <FlaskConical className="h-4 w-4 text-gold" aria-hidden="true" /> {d.lab}
                            </li>
                          )}
                          {d.facultyGroup && n && (
                            <li>
                              <Link to={`/faculty?college=UG&dept=${encodeURIComponent(d.facultyGroup)}`} className="flex items-center gap-2 font-semibold text-royal hover:underline">
                                <Users className="h-4 w-4" aria-hidden="true" /> Faculty ({d.facultyGroup}) · {n}
                              </Link>
                            </li>
                          )}
                          {d.outcomes && (
                            <li>
                              <a href={d.outcomes} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-semibold text-royal hover:underline">
                                <FileText className="h-4 w-4" aria-hidden="true" /> Programme & course outcomes (PDF)
                              </a>
                            </li>
                          )}
                        </ul>
                        <div className="mt-auto flex flex-wrap gap-2 pt-5">
                          {c.programme && (
                            <Link to={c.programme} className="btn-navy !px-4 !py-2 !text-xs">
                              Programme
                            </Link>
                          )}
                          <a href={c.official} target="_blank" rel="noopener noreferrer" className="btn-outline !px-4 !py-2 !text-xs">
                            Official <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </motion.li>
                    )
                  })}
                </AnimatePresence>
              </motion.ul>
            </>
          )}

          {pg.length > 0 && (
            <>
              <h2 className="mt-16 text-sm text-royal">PG College departments · {pg.length}</h2>
              <motion.ul layout className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {pg.map((p) => {
                  const est = p.blocks.find((b) => b.t !== 'table' && /Year of Establishment/i.test(b.text))
                  const year = est && est.t !== 'table' ? est.text.match(/\d{4}/)?.[0] : undefined
                  const vision = sectionAfter(p.blocks, /^Vision/i)
                  const n = faculty.filter((f) => f.college === 'PG' && f.programme === p.name).length
                  return (
                    <motion.li layout key={p.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group card relative flex flex-col overflow-hidden p-6">
                      <GraduationCap className="absolute -top-3 -right-3 h-24 w-24 text-navy/[0.04]" aria-hidden="true" />
                      <p className="text-[11px] font-extrabold text-royal">PG College{year ? ` · Est. ${year}` : ''}</p>
                      <h3 className="mt-2 text-xl text-navy">{p.name}</h3>
                      {vision && <p className="mt-2 line-clamp-3 text-sm text-slate/65">Vision: {vision}</p>}
                      {n > 0 && (
                        <Link to={`/faculty?college=PG&programme=${encodeURIComponent(p.name ?? '')}`} className="mt-3 flex items-center gap-2 text-sm font-semibold text-royal hover:underline">
                          <Users className="h-4 w-4" aria-hidden="true" /> {n} faculty
                        </Link>
                      )}
                      <div className="mt-auto flex flex-wrap gap-2 pt-5">
                        <Link to={`/courses/pg/${p.slug}`} className="btn-navy !px-4 !py-2 !text-xs">
                          Department page
                        </Link>
                        <a href={p.official} target="_blank" rel="noopener noreferrer" className="btn-outline !px-4 !py-2 !text-xs">
                          Official <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </motion.li>
                  )
                })}
              </motion.ul>
            </>
          )}
          {ug.length + pg.length === 0 && <p className="mt-12 rounded-2xl bg-white p-8 text-center text-slate/60">No departments match your search.</p>}
        </div>
      </section>
    </>
  )
}
