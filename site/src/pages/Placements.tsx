import { ArrowRight, ArrowUpRight, Briefcase, Handshake, Lightbulb, Presentation } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DocList, type DocItem } from '../components/DocList'
import { PageHero } from '../components/PageHero'
import { Reveal, SectionHeading } from '../components/Reveal'
import { off } from '../content/site'
import { faculty, pgProgrammes } from '../lib/data'
import { naac } from '../lib/naac'

export default function Placements() {
  const cell = pgProgrammes.find((p) => p.slug === 'placements')
  const paras = (cell?.blocks ?? []).filter((b) => b.t === 'p').map((b) => (b.t === 'p' ? b.text : ''))
  const team = faculty.filter((f) => f.college === 'PG' && f.programme === 'Placements')
  const ssr5 = naac.ug.ssr['5'] ?? []
  const docs: DocItem[] = ssr5
    .filter((r) => /^5\.(2\.1|1\.3\(B\))/.test(r.cells[0]))
    .map((r) => ({
      title: r.cells[3] || r.cells[2],
      meta: `NAAC ${r.cells[2]}`,
      group: r.cells[0].startsWith('5.2') ? 'NAAC metrics 5.2.1 & 5.2.2 — supporting documents' : 'Career counselling',
      href: r.href,
      unavailable: r.unavailable,
    }))

  return (
    <>
      <PageHero eyebrow="Careers" title="Placements" text="A dedicated Placement Cell, in collaboration with the Skill Development Centre, assists students with career guidance and placements." image="/img/static/skill/sd1.webp" />

      <section className="bg-white py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <Reveal className="prose-lbc">
            <h2 className="!mt-0 text-3xl text-navy">Career Guidance & Placement Cell (CG &amp; PC)</h2>
            {paras.map((p) => (
              <p key={p}>{p.replace(/ Below is the year-wise track record of placements:$/, '')}</p>
            ))}
            <p>
              The Degree College Placement Cell organises placement drives over the academic year inviting companies and various industries, and provides essential skill development training for on-campus recruitments.
            </p>
          </Reveal>
          <div className="grid content-start gap-4">
            {team.map((t) => (
              <Reveal key={t.name} className="card flex items-center gap-4 p-5">
                {t.photo ? (
                  <img src={t.photo} alt="" className="h-16 w-16 rounded-2xl object-cover object-top" />
                ) : (
                  <span className="grid h-16 w-16 place-items-center rounded-2xl bg-navy text-gold" aria-hidden="true">
                    <Briefcase className="h-6 w-6" />
                  </span>
                )}
                <div>
                  <p className="font-extrabold text-navy">{t.name}</p>
                  <p className="text-sm text-royal">{t.designation}</p>
                  <p className="text-xs text-slate/55">{t.qualification}</p>
                </div>
              </Reveal>
            ))}
            <Reveal className="rounded-3xl bg-gold-soft p-6">
              <p className="text-sm font-bold text-navy">Placement Coordinator</p>
              <p className="text-sm text-slate/70">Mrs. K. Rekha Rani — as listed in the IQAC composition.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="noise bg-navy py-20 text-white">
        <div className="container-x">
          <SectionHeading light eyebrow="How we prepare you" title="From classroom to career" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Lightbulb, title: 'Skill development', text: 'Personality development, communication skills, group discussions and kinesics through the SDC.' },
              { icon: Handshake, title: 'Industry MoUs', text: 'MoUs with WNS and NASSCOM to enhance students’ knowledge in their domains.' },
              { icon: Presentation, title: 'Institute–industry interaction', text: 'Guest lectures, workshops and seminars on technology and management.' },
              { icon: Briefcase, title: 'Placement drives', text: 'Drives organised over the academic year with essential training for on-campus recruitment.' },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08} className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
                <c.icon className="h-8 w-8 text-gold" aria-hidden="true" />
                <p className="mt-4 text-lg font-extrabold">{c.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{c.text}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/academics/skill-development" className="btn-gold">
              Skill Development Centre <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/academics/projects" className="btn-ghost">
              Projects & internships
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-mist py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Reports & documents" title="Placement and progression records" />
          <div className="mt-10">
            <DocList docs={docs} columns={3} />
          </div>
          <div className="flex flex-wrap gap-5 text-sm font-bold text-royal">
            <a href={off('/lbc/placements')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
              Placements on the official site <ArrowUpRight className="h-4 w-4" />
            </a>
            <a href={off('/pgcollege/department/12')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
              PG placement cell page <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
