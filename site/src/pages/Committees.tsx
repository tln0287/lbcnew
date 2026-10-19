import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { committees } from '../lib/data'

export default function Committees() {
  const params = useParams()
  const slug = params.slug ?? 'admission'
  const [college, setCollege] = useState<'ug' | 'pg'>('ug')
  const list = committees[college]
  const current = list.find((c) => c.slug === slug) ?? list[0]

  return (
    <>
      <PageHero
        eyebrow="Governance"
        title={params.slug ? current.name : 'Committees'}
        text="Members and roles of the college's statutory, academic and student-welfare committees, as published by the college."
        crumbs={params.slug ? [{ label: 'Committees', to: '/committees' }] : []}
        image="/img/media/jrcollege/news/facilities1.webp"
      />
      <section className="bg-mist py-14">
        <div className="container-x grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start min-[1360px]:top-36">
            <div role="group" aria-label="College" className="mb-4 inline-flex rounded-full bg-white p-1 ring-1 ring-navy/10">
              {(['ug', 'pg'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={college === k}
                  onClick={() => setCollege(k)}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${college === k ? 'bg-navy text-white' : 'text-navy'}`}
                >
                  {k === 'ug' ? 'Degree College' : 'PG College'}
                </button>
              ))}
            </div>
            <nav aria-label="Committees">
              <ul className="scrollbar-none flex gap-2 overflow-x-auto pb-2 lg:grid lg:overflow-visible">
                {list.map((c) => (
                  <li key={c.slug} className="shrink-0">
                    <Link
                      to={`/committees/${c.slug}`}
                      aria-current={c.slug === current.slug ? 'page' : undefined}
                      className={`block rounded-xl px-4 py-2.5 text-sm font-bold transition ${c.slug === current.slug ? 'bg-navy text-white shadow-lg' : 'bg-white text-navy hover:text-royal'}`}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          <AnimatePresence mode="wait">
            <motion.article
              key={college + current.slug}
              initial={{ opacity: 0, y: 16, rotateX: -6 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              style={{ transformPerspective: 1000 }}
              className="card overflow-hidden"
            >
              <div className="bg-gradient-to-r from-navy to-royal p-8 text-white">
                <p className="text-sm font-semibold text-gold-2">{college === 'ug' ? 'Degree College' : 'PG College'}</p>
                <h2 className="mt-2 text-3xl !text-white">{current.name}</h2>
              </div>
              <div className="grid gap-10 p-8 md:grid-cols-2">
                <div>
                  <h3 className="font-sans text-sm font-semibold text-royal">Members of the committee</h3>
                  <ul className="mt-4 grid gap-2">
                    {current.contacts
                      ? current.contacts.map((c) => (
                          <li key={c.name} className="flex gap-3 rounded-xl bg-mist px-4 py-3 text-sm">
                            <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-royal" aria-hidden="true" />
                            <span className="min-w-0">
                              <span className="block font-semibold text-navy">
                                {c.name}
                                {c.status && <span className="ml-2 rounded-full bg-gold-soft px-2 py-0.5 text-xs font-semibold text-navy">{c.status}</span>}
                              </span>
                              {(c.email || c.phone) && (
                                <span className="mt-1 flex flex-wrap gap-x-4 text-slate">
                                  {c.email && (
                                    <a href={`mailto:${c.email}`} className="break-all hover:text-royal">
                                      {c.email}
                                    </a>
                                  )}
                                  {c.phone && (
                                    <a href={`tel:${c.phone}`} className="hover:text-royal">
                                      {c.phone}
                                    </a>
                                  )}
                                </span>
                              )}
                            </span>
                          </li>
                        ))
                      : current.members.map((m) => (
                          <li key={m} className="flex gap-3 rounded-xl bg-mist px-4 py-3 text-sm font-semibold text-navy">
                            <UserRound className="h-4 w-4 shrink-0 text-royal" aria-hidden="true" />
                            {m}
                          </li>
                        ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-sans text-sm font-semibold text-royal">Roles and responsibilities</h3>
                  {current.roles.length === 0 && (
                    <p className="mt-4 rounded-xl border border-dashed border-navy/15 p-4 text-sm text-slate">
                      Roles and responsibilities for this committee have not been published.
                    </p>
                  )}
                  <ul className="mt-4 grid gap-3">
                    {current.roles.map((r) => (
                      <li key={r} className="flex gap-3 text-sm leading-relaxed text-slate/80">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </section>
    </>
  )
}
