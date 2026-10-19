import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ContentBlocks } from '../components/ContentBlocks'
import { PageHero } from '../components/PageHero'
import { Reveal, SectionHeading } from '../components/Reveal'
import { about, aicteDocs, news, off } from '../content/site'
import { pages, pgProgrammes } from '../lib/data'

export default function PGCollege() {
  const depts = pgProgrammes
  const pgNews = news.filter((n) => n.category === 'PG College')
  const research = [
    { dept: 'MBA', text: 'Recognised by Andhra University in 2014 as a research centre for M.Phil. and Ph.D. in Management Studies.', to: '/courses/pg/mba' },
    { dept: 'Microbiology', text: 'Research centre sanctioned by Andhra University in 2007; faculty eligible to supervise Ph.D. and M.Phil.', to: '/courses/pg/microbiology' },
    { dept: 'Chemistry — Research', text: 'Chemical research led by the Professor & Head, Chemical Research.', to: '/courses/pg/chemistry-research' },
  ]
  return (
    <>
      <PageHero eyebrow="Est. 1994 · Recognised by AICTE" title="PG College" text={about.pgCollege} image="/img/media/jrcollege/news/facilities1.webp">
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link to="/courses#pg" className="btn-gold">
            PG programmes
          </Link>
          <a href={off('/pghome')} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            Official PG site <ArrowUpRight className="h-4 w-4" />
          </a>
          <img src="/img/static/images/pgcollege_ice.webp" alt="ICET code: DLBC" className="h-14 w-auto rounded-full bg-white p-1" />
        </div>
      </PageHero>

      <section className="bg-white py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1fr]">
          <Reveal className="card p-8">
            <ContentBlocks blocks={pages.pgProfile.blocks} />
          </Reveal>
          <div>
            <SectionHeading eyebrow="Departments" title="10 departments, 12 courses" />
            <ul className="mt-8 grid gap-2 sm:grid-cols-2">
              {depts.map((d) => (
                <li key={d.slug}>
                  <Link to={`/courses/pg/${d.slug}`} className="group flex items-center justify-between rounded-2xl bg-mist px-5 py-4 font-bold text-navy transition hover:bg-navy hover:text-white">
                    {d.name}
                    <ArrowRight className="h-4 w-4 text-gold transition group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="noise bg-navy py-20 text-white">
        <div className="container-x">
          <SectionHeading light eyebrow="Research" title="Research centres" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {research.map((r, i) => (
              <Reveal key={r.dept} delay={i * 0.08}>
                <Link to={r.to} className="block h-full rounded-3xl bg-white/5 p-7 ring-1 ring-white/10 transition hover:bg-white/10">
                  <p className="text-xl font-extrabold text-gold">{r.dept}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/75">{r.text}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-mist py-20">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="AICTE" title="Approvals & disclosures" />
            <ul className="mt-8 grid gap-2">
              {aicteDocs.slice(0, 4).map((d) => (
                <li key={d.href}>
                  <a href={d.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 font-bold text-navy hover:text-royal">
                    {d.label} <ArrowUpRight className="h-4 w-4 text-gold" />
                  </a>
                </li>
              ))}
            </ul>
            <Link to="/aicte" className="btn-navy mt-6">
              AICTE, IIC & grievances
            </Link>
          </div>
          <div>
            <SectionHeading eyebrow="Seminars & events" title="News from the PG College" />
            {pgNews.map((n) => (
              <Reveal key={n.title} className="card mt-8 overflow-hidden">
                <img src={n.image} alt="" className="h-56 w-full object-cover object-top" loading="lazy" />
                <div className="p-6">
                  <p className="text-xs font-bold text-royal">{'date' in n ? n.date : ''}</p>
                  <p className="mt-1 text-lg font-extrabold text-navy">{n.title}</p>
                  <p className="mt-2 text-sm text-slate/70">{n.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
