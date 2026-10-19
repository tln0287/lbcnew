import { ArrowRight, ArrowUpRight, CalendarDays, Flag, Heart, Trophy } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DocList, type DocItem } from '../components/DocList'
import { Lightbox } from '../components/Lightbox'
import { PageHero } from '../components/PageHero'
import { Reveal, SectionHeading } from '../components/Reveal'
import { achievers, conference, news, off } from '../content/site'
import { committees, pgProgrammes, sectionAfter, type NaacRow } from '../lib/data'
import { naac } from '../lib/naac'

const ssr = Object.values(naac.ug.ssr).flat()
const docs = (metric: RegExp, group?: string): DocItem[] =>
  ssr
    .filter((r: NaacRow) => metric.test(r.cells[0] ?? ''))
    .map((r) => ({ title: r.cells[3] || r.cells[1] || r.cells[0], meta: `NAAC ${r.cells[2] || r.cells[0]} · ${r.cells[1]}`, href: r.href, group, unavailable: r.unavailable }))

const clubs: { dept: string; slug: string; heading: RegExp; title: string }[] = [
  { dept: 'MBA', slug: 'mba', heading: /^Management Club/i, title: 'Management Club' },
  { dept: 'M.Com.', slug: 'm-com', heading: /^Journal Club/i, title: 'Journal Club' },
  { dept: 'Mathematics', slug: 'mathematics', heading: /^Mathematics Day/i, title: 'Mathematics Day' },
  { dept: 'Computer Science', slug: 'computer-science', heading: /^Promotion of Technology/i, title: 'Promotion of Technology' },
  { dept: 'Biochemistry', slug: 'biochemistry', heading: /^Department Activities/i, title: 'Department activities' },
  { dept: 'Chemistry', slug: 'chemistry', heading: /^Department Activities/i, title: 'Department activities' },
  { dept: 'Microbiology', slug: 'microbiology', heading: /^Departmental Activities/i, title: 'Departmental activities' },
  { dept: 'English', slug: 'english', heading: /^Departmental Activities/i, title: 'Departmental activities' },
  { dept: 'M.Com.', slug: 'm-com', heading: /^Industrial Visits/i, title: 'Industrial visits' },
]

export default function Activities() {
  const sports = committees.ug.find((c) => c.slug === 'sports')
  const [shown, setShown] = useState<number | null>(null)
  const championship = news[0]
  const clubCards = clubs
    .map((c) => {
      const p = pgProgrammes.find((x) => x.slug === c.slug)
      const text = p ? sectionAfter(p.blocks, c.heading) : undefined
      return text ? { ...c, text } : null
    })
    .filter(Boolean) as (typeof clubs[number] & { text: string })[]

  return (
    <>
      <PageHero
        eyebrow="Activities"
        title="Student life & activities"
        text="Sports coaching for state and national-level competitions, NCC, NSS, Bharat Scouts & Guides, clubs and internal groups that let like-minded students connect and broaden their horizons."
        image="/img/static/skill/b1.webp"
      />

      <nav aria-label="Activities sections" className="sticky top-[76px] z-30 min-[1360px]:top-[116px] border-b border-navy/8 bg-white/90 backdrop-blur-xl">
        <div className="container-x scrollbar-none flex gap-1 overflow-x-auto py-3">
          {[
            ['sports', 'Sports'],
            ['ncc', 'NCC'],
            ['nss', 'NSS'],
            ['scouts', 'Scouts & Guides'],
            ['clubs', 'Clubs'],
            ['conferences', 'Conferences'],
            ['achievements', 'Achievements'],
          ].map(([id, l]) => (
            <a key={id} href={`#${id}`} className="shrink-0 rounded-full px-4 py-2 text-sm font-bold text-navy hover:bg-mist">
              {l}
            </a>
          ))}
        </div>
      </nav>

      <section id="sports" className="scroll-mt-36 bg-white py-20">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Sports" title="Champions on and off the field" text="Sports students receive appropriate coaching and are encouraged to participate in state and national-level competitions. Since its inception, the college has earned numerous accolades, with students winning medals, shields, and trophies." />
            <Reveal className="mt-8 rounded-3xl bg-navy p-7 text-white">
              <Trophy className="h-8 w-8 text-gold" aria-hidden="true" />
              <p className="mt-3 text-xl font-extrabold">{championship.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{championship.text}</p>
            </Reveal>
            {sports && (
              <Reveal className="mt-6 rounded-3xl bg-mist p-7">
                <p className="text-xs font-extrabold text-royal">Sports Committee</p>
                <ul className="mt-3 grid gap-1 text-sm text-slate/80">
                  {sports.members.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
                <Link to="/committees/sports" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-royal">
                  Roles & responsibilities <ArrowRight className="h-4 w-4" />
                </Link>
              </Reveal>
            )}
          </div>
          <div className="grid content-start gap-6">
            <Reveal className="overflow-hidden rounded-3xl shadow-xl">
              <button type="button" onClick={() => setShown(0)} className="block w-full">
                <img src="/img/media/jrcollege/gallery/1521098234_15172259953.webp" alt="LBC team — Eenadu Cricket Tournament Champions, AP & Telangana" className="w-full" loading="lazy" />
              </button>
              <p className="bg-white px-5 py-3 text-sm font-semibold text-slate/70">Eenadu Cricket Tournament Champions, AP & Telangana</p>
            </Reveal>
            <Reveal className="overflow-hidden rounded-3xl shadow-xl">
              <button type="button" onClick={() => setShown(1)} className="block w-full">
                <img src={championship.image} alt={championship.title} className="w-full" loading="lazy" />
              </button>
            </Reveal>
          </div>
        </div>
        <div className="container-x mt-12">
          <DocList docs={[...docs(/^5\.3\.1/, 'Sports medals'), ...docs(/^5\.3\.2/, 'Sports participation')]} columns={3} />
          <a href={off('/lbc/sports')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-royal">
            Sports on the official site <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="noise bg-navy py-20 text-white">
        <div className="container-x grid gap-6 md:grid-cols-2">
          <Reveal id="ncc" className="scroll-mt-36 rounded-[2rem] bg-white/5 p-8 ring-1 ring-white/10">
            <Flag className="h-10 w-10 text-gold" aria-hidden="true" />
            <h2 className="mt-5 text-3xl">NCC</h2>
            <p className="mt-3 leading-relaxed text-white/75">NCC cadets consistently distinguish themselves in various events and competitions.</p>
            <a href={off('/lbc/ncc')} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-gold">
              NCC on the official site <ArrowUpRight className="h-4 w-4" />
            </a>
          </Reveal>
          <Reveal id="nss" delay={0.08} className="scroll-mt-36 rounded-[2rem] bg-white/5 p-8 ring-1 ring-white/10">
            <Heart className="h-10 w-10 text-gold" aria-hidden="true" />
            <h2 className="mt-5 text-3xl">NSS</h2>
            <p className="mt-3 leading-relaxed text-white/75">NSS volunteers actively contribute to community and social work. The NSS Unit Officer, Mr. Shaik Gowsi Babu, serves on the IQAC.</p>
            <a href={off('/lbc/nss')} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-gold">
              NSS on the official site <ArrowUpRight className="h-4 w-4" />
            </a>
          </Reveal>
        </div>
        <div className="container-x mt-10">
          <h3 className="mb-5 text-sm text-gold">Extension & outreach records</h3>
          <div className="rounded-3xl bg-white p-6 text-slate">
            <DocList docs={[...docs(/^3\.4\.3/), ...docs(/^3\.4\.2/)]} columns={3} />
          </div>
        </div>
      </section>

      <section id="scouts" className="scroll-mt-36 bg-white py-20">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="grid grid-cols-2 gap-3">
            <img src="/img/static/skill/b1.webp" alt="Scouts and Guides on the LBC ground" className="col-span-2 h-64 w-full rounded-3xl object-cover" loading="lazy" />
            <img src="/img/static/skill/b3.webp" alt="Bharat Scouts & Guides unit, LBC" className="h-40 w-full rounded-3xl object-cover" loading="lazy" />
            <img src="/img/static/skill/b4.webp" alt="Bharat Scouts & Guides unit, LBC" className="h-40 w-full rounded-3xl object-cover" loading="lazy" />
          </Reveal>
          <div>
            <SectionHeading eyebrow="Bharat Scouts & Guides · Est. 2023" title="Character building for good citizenship" text="Established in 2023, the BS&G unit at Dr. Lankapalli Bullayya College has 110 seats in 5 units." />
            <Link to="/activities/bharat-scouts-guides" className="btn-navy mt-8">
              About the unit <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="clubs" className="scroll-mt-36 bg-mist py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Clubs & department activities" title="Learning by organising" />
          <div className="mt-12 columns-1 gap-5 md:columns-2 lg:columns-3">
            {clubCards.map((c, i) => (
              <Reveal key={c.slug + c.title} delay={(i % 3) * 0.06} className="mb-5 break-inside-avoid">
                <Link to={`/courses/pg/${c.slug}`} className="card block p-7 transition hover:-translate-y-1">
                  <p className="text-xs font-extrabold text-royal">{c.dept}</p>
                  <h3 className="mt-2 text-xl text-navy">{c.title}</h3>
                  <p className="mt-3 line-clamp-6 text-sm leading-relaxed text-slate/70">{c.text}</p>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-6">
            <DocList docs={docs(/^7\.1\.2/).filter((d) => /club/i.test(d.title))} />
          </div>
        </div>
      </section>

      <section id="conferences" className="scroll-mt-36 bg-white py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Conferences, seminars & workshops" title="Seminars and conferences" />
          <Reveal className="mt-10">
            <a href={conference.href} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-navy to-royal p-8 text-white sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <CalendarDays className="h-10 w-10 shrink-0 text-gold" aria-hidden="true" />
                <div>
                  <p className="text-xs font-extrabold text-gold">{conference.date}</p>
                  <p className="text-2xl font-extrabold">{conference.title}</p>
                </div>
              </div>
              <span className="btn-gold shrink-0">
                Registration <ArrowUpRight className="h-4 w-4" />
              </span>
            </a>
          </Reveal>
          <div className="mt-10">
            <DocList docs={[...docs(/^3\.2\.2/, 'Seminars & workshops organised'), ...docs(/^6\.3\.2/, 'Financial support for conferences & workshops')]} columns={3} />
          </div>
        </div>
      </section>

      <section id="achievements" className="scroll-mt-36 bg-mist py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Student achievements" title="Our achievers" />
          <div className="mt-10 grid gap-5">
            {achievers.map((a, i) => (
              <Reveal key={a.image} delay={i * 0.08}>
                <button type="button" onClick={() => setShown(2 + i)} className="block w-full overflow-hidden rounded-3xl shadow-xl">
                  <img src={a.image} alt={a.alt} className="w-full" loading="lazy" />
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <Lightbox
        items={[
          { src: '/img/media/jrcollege/gallery/1521098234_15172259953.webp', alt: 'Eenadu Cricket Tournament Champions, AP & Telangana' },
          { src: championship.image, alt: championship.title },
          ...achievers.map((a) => ({ src: a.image, alt: a.alt })),
        ]}
        index={shown}
        onChange={setShown}
      />
    </>
  )
}
