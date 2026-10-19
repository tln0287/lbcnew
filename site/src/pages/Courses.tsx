import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { Reveal, SectionHeading } from '../components/Reveal'
import { TiltCard } from '../components/TiltCard'
import { pgIntake, ugStrength } from '../content/departments'
import { aictePrograms } from '../content/site'
import { facts, pgProgrammes, ugProgrammes } from '../lib/data'

export default function Courses() {
  const ug = ugProgrammes.filter((p) => p.blocks.length > 0)
  const pg = pgProgrammes.filter((p) => !['placements', 'library-science', 'chemistry-research'].includes(p.slug))
  return (
    <>
      <PageHero
        eyebrow="Courses"
        title="Programmes at LBC"
        text="Four-year Honours undergraduate programmes following Andhra University's semester pattern, and two-year postgraduate programmes affiliated to Andhra University."
        image="/img/media/jrcollege/news/facilities4.webp"
      />

      <section id="ug" className="scroll-mt-24 bg-white py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Degree College" title="Undergraduate programmes" text="Admissions are conducted through the Online Admissions Module for Degree Colleges (OAMDC) under the Andhra Pradesh State Council of Higher Education (APSCHE)." />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {ug.map((p, i) => {
              const f = facts(p.blocks)
              return (
                <Reveal key={p.slug} delay={(i % 2) * 0.08}>
                  <TiltCard max={4} className="h-full">
                    <Link to={`/courses/ug/${p.slug}`} className="group card flex h-full flex-col p-8 transition hover:border-royal/30">
                      <p className="eyebrow">Undergraduate</p>
                      <h3 className="mt-3 text-3xl text-navy group-hover:text-royal">{p.title}</h3>
                      <dl className="mt-5 grid grid-cols-2 gap-3">
                        {f.slice(0, 4).map((x) => (
                          <div key={x.key} className="rounded-2xl bg-mist p-3">
                            <dt className="text-[11px] font-bold text-slate/50">{x.key}</dt>
                            <dd className="mt-0.5 text-sm font-bold text-navy">{x.value}</dd>
                          </div>
                        ))}
                      </dl>
                      <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-bold text-royal">
                        Programme details <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </TiltCard>
                </Reveal>
              )
            })}
          </div>

          <Reveal className="mt-16">
            <h3 className="text-xl text-navy">Sanctioned strength 2023-24</h3>
            <div className="mt-5 overflow-x-auto rounded-3xl border border-navy/10">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-navy text-white">
                  <tr>
                    <th className="px-5 py-3">Course</th>
                    <th className="px-5 py-3">Subjects</th>
                    <th className="px-5 py-3 text-right">Sanctioned strength</th>
                  </tr>
                </thead>
                <tbody>
                  {ugStrength.map((c) =>
                    c.subjects.length ? (
                      c.subjects.map(([s, n], si) => (
                        <tr key={c.course + s} className="border-t border-navy/8">
                          {si === 0 && (
                            <th rowSpan={c.subjects.length} className="bg-mist/60 px-5 py-2.5 align-top font-extrabold text-navy">
                              <Link to={`/courses/ug/${c.slug}`} className="hover:text-royal">
                                {c.course}
                              </Link>
                            </th>
                          )}
                          <td className="px-5 py-2.5">{s}</td>
                          <td className="px-5 py-2.5 text-right font-bold">{n}</td>
                        </tr>
                      ))
                    ) : (
                      <tr key={c.course} className="border-t border-navy/8">
                        <th className="bg-mist/60 px-5 py-2.5 font-extrabold text-navy">
                          <Link to={`/courses/ug/${c.slug}`} className="hover:text-royal">
                            {c.course}
                          </Link>
                        </th>
                        <td className="px-5 py-2.5 text-slate/50">—</td>
                        <td className="px-5 py-2.5 text-right font-bold">{c.total}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate/50">Source: Degree College profile, lbc.edu.in/ugcollege/profile.</p>
          </Reveal>
        </div>
      </section>

      <section id="pg" className="noise scroll-mt-24 bg-navy py-20 text-white">
        <div className="container-x">
          <SectionHeading light eyebrow="PG College" title="Postgraduate programmes" text="Any science graduate who has secured a qualifying rank in APPGCET is eligible; graduates from Arts and Commerce streams are eligible for English and Commerce respectively. MBA admission is through APICET." />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pg.map((p, i) => {
              const f = facts(p.blocks)
              const est = f.find((x) => /establish/i.test(x.key))
              return (
                <Reveal key={p.slug} delay={(i % 3) * 0.06}>
                  <Link to={`/courses/pg/${p.slug}`} className="group flex h-full flex-col rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/10">
                    <p className="text-xs font-bold text-gold">{est ? `Est. ${est.value}` : 'Postgraduate'}</p>
                    <h3 className="mt-2 text-2xl">{p.name}</h3>
                    {f.find((x) => /intake/i.test(x.key)) && <p className="mt-2 text-sm text-white/65">Intake: {f.find((x) => /intake/i.test(x.key))!.value}</p>}
                    <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-bold text-gold">
                      View department <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </div>

          <Reveal className="mt-16 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="overflow-x-auto rounded-3xl bg-white text-slate">
              <table className="w-full min-w-[480px] text-left text-sm">
                <caption className="px-5 pt-5 text-left text-lg font-extrabold text-navy">Departments in PG College — intake</caption>
                <thead>
                  <tr className="text-xs text-slate/50">
                    <th className="px-5 py-3">Course</th>
                    <th className="px-5 py-3 text-right">Convener</th>
                    <th className="px-5 py-3 text-right">Management</th>
                  </tr>
                </thead>
                <tbody>
                  {pgIntake.map((r) => (
                    <tr key={r.course} className="border-t border-navy/8">
                      <td className="px-5 py-2.5 font-semibold">
                        <Link to={`/courses/pg/${r.slug}`} className="text-navy hover:text-royal">
                          {r.course}
                        </Link>
                      </td>
                      <td className="px-5 py-2.5 text-right">{r.convener}</td>
                      <td className="px-5 py-2.5 text-right">{r.management}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-5 pb-4 text-xs text-slate/50">Source: PG College profile, lbc.edu.in/pgcollege/profile.</p>
            </div>
            <div className="rounded-3xl bg-gold p-7 text-navy">
              <p className="text-xs font-extrabold">AICTE programmes</p>
              <ul className="mt-4 grid gap-3">
                {aictePrograms.map(([name, n]) => (
                  <li key={name} className="flex items-center justify-between gap-4 border-b border-navy/15 pb-3 font-bold">
                    {name}
                    <span className="rounded-full bg-navy px-3 py-1 text-sm text-gold">{n}</span>
                  </li>
                ))}
              </ul>
              <Link to="/aicte" className="mt-6 inline-flex items-center gap-1 text-sm font-extrabold">
                Approvals & disclosures <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
