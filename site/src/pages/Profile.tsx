import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { ContentBlocks } from '../components/ContentBlocks'
import { PageHero } from '../components/PageHero'
import { Reveal, SectionHeading } from '../components/Reveal'
import { about, leadership, milestones, off } from '../content/site'
import { pages } from '../lib/data'

export default function Profile() {
  const [college, setCollege] = useState<'ug' | 'pg'>('ug')
  const page = college === 'ug' ? pages.ugProfile : pages.pgProfile
  return (
    <>
      <PageHero
        eyebrow="About · Est. 1973"
        title="Profile"
        text="Founded by the Society for Collegiate Education and named in honour of Dr. Lankapalli Bullayya, then Vice Chancellor of Andhra University."
        image="/img/static/upload/about-bg-2.webp"
      />

      <section className="bg-white py-20">
        <div className="container-x grid gap-12 lg:grid-cols-3">
          {[
            { title: 'Our Vision', body: [about.vision] },
            { title: 'Our Mission', body: about.mission },
            { title: 'Our Objectives', body: about.objectives },
          ].map((b, i) => (
            <Reveal key={b.title} delay={i * 0.08} className="card relative overflow-hidden p-8">
              <span className="absolute -top-4 -right-2 text-8xl font-extrabold text-navy/[0.04]">0{i + 1}</span>
              <h2 className="text-2xl text-navy">{b.title}</h2>
              <div className="mt-4 h-1 w-12 rounded bg-gold" />
              {b.body.map((t) => (
                <p key={t} className="mt-4 leading-relaxed text-slate/75">
                  {t}
                </p>
              ))}
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-mist py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start min-[1360px]:top-36">
            <p className="eyebrow">College profile</p>
            <div role="tablist" aria-label="Choose college" className="mt-5 grid gap-2">
              {(
                [
                  ['ug', 'Degree College', '/ugcollege/profile'],
                  ['pg', 'PG College', '/pgcollege/profile'],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  role="tab"
                  type="button"
                  aria-selected={college === k}
                  onClick={() => setCollege(k)}
                  className={`rounded-2xl px-5 py-4 text-left font-extrabold transition ${college === k ? 'bg-navy text-white shadow-xl' : 'bg-white text-navy hover:bg-white/70'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <a href={off(college === 'ug' ? '/ugcollege/profile' : '/pgcollege/profile')} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-royal">
              Official profile page <ArrowUpRight className="h-4 w-4" />
            </a>
          </aside>
          <motion.article key={college} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 sm:p-10" role="tabpanel">
            <ContentBlocks blocks={page.blocks} />
          </motion.article>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Milestones" title="Over five decades of growth" />
          <div className="scrollbar-none mt-12 flex snap-x gap-4 overflow-x-auto pb-4">
            {milestones.map((m, i) => (
              <Reveal key={m.year + i} delay={i * 0.05} className="w-64 shrink-0 snap-start">
                <div className="h-full rounded-3xl border-t-4 border-gold bg-mist p-6">
                  <p className="text-3xl font-extrabold text-royal">{m.year}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate/75">{m.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="leadership" className="noise scroll-mt-24 bg-navy py-20 text-white">
        <div className="container-x">
          <SectionHeading light eyebrow="Leadership" title="Messages from our leadership" />
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {leadership.map((l, i) => (
              <Reveal key={i} delay={i * 0.1} className="overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10">
                <img src={l.image} alt={`${l.role}${l.name ? `, ${l.name}` : ''}`} className="aspect-[10/7] w-full object-cover" loading="lazy" />
                <div className="p-7">
                  <p className="text-xs font-extrabold text-gold">{l.role}</p>
                  {l.name && <p className="mt-1 text-xl font-extrabold">{l.name}</p>}
                  {l.message.map((m) => (
                    <p key={m} className="mt-4 text-sm leading-relaxed text-white/75">
                      {m}
                    </p>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
