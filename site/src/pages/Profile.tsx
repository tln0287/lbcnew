import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { RiseText, Seal, Spotlight } from '../components/Effects'
import { ContentBlocks } from '../components/ContentBlocks'
import { PageHero } from '../components/PageHero'
import { Reveal, SectionHeading } from '../components/Reveal'
import { about, leadership, milestones } from '../content/site'
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

      <LeadershipMessages />
    </>
  )
}

/** Leadership messages: portrait tabs choose whose message is shown in the reader. */
function LeadershipMessages() {
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion()
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const l = leadership[active]
  const [lead, ...rest] = l.message

  const onKey = (e: KeyboardEvent) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const next = (active + d + leadership.length) % leadership.length
    setActive(next)
    tabs.current[next]?.focus()
  }

  return (
    <Spotlight id="leadership" className="navy-drift scroll-mt-24 overflow-hidden py-24 text-white lg:py-32">
      <Seal className="absolute -bottom-40 -left-40 h-[520px] w-[520px]" opacity={0.08} />
      <div className="container-x relative">
        <RiseText text="Messages from our leadership" className="h-section !text-white" />

        <div className="mt-14 grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
          {/* portrait tabs */}
          <div role="tablist" aria-label="Choose a message" aria-orientation="vertical" onKeyDown={onKey} className="grid grid-cols-3 content-start gap-3 lg:sticky lg:top-36 lg:grid-cols-1 lg:gap-3 lg:self-start">
            {leadership.map((p, i) => {
              const on = i === active
              return (
                <button
                  key={i}
                  ref={(el) => {
                    tabs.current[i] = el
                  }}
                  type="button"
                  role="tab"
                  id={`lead-tab-${i}`}
                  aria-selected={on}
                  aria-controls="lead-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={`group relative flex flex-col items-start gap-3 rounded-[22px] p-2 text-left transition duration-500 lg:flex-row lg:items-center lg:gap-4 lg:p-3 ${
                    on ? 'bg-white text-navy shadow-[var(--shadow-raised)]' : 'bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="relative block aspect-[4/5] w-full overflow-hidden rounded-[16px] lg:w-20 lg:shrink-0">
                    <img src={p.image} alt="" className={`h-full w-full scale-[1.32] object-cover transition duration-700 ${on ? '' : 'grayscale-[40%] group-hover:grayscale-0'}`} loading="lazy" />
                  </span>
                  <span className="min-w-0 px-1 pb-1 lg:p-0">
                    <span className={`block text-xs font-semibold ${on ? 'text-royal' : 'text-gold-2'}`}>{p.role}</span>
                    <span className="display mt-0.5 block text-base leading-snug sm:text-lg">{p.name ?? 'Message to students'}</span>
                  </span>
                  {on && <motion.span layoutId="lead-marker" className="absolute top-1/2 -right-2 hidden h-10 w-1 -translate-y-1/2 rounded-full bg-gold lg:block" />}
                </button>
              )
            })}
          </div>

          {/* message reader */}
          <div id="lead-panel" role="tabpanel" aria-labelledby={`lead-tab-${active}`} className="relative min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.article
                key={active}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <span aria-hidden="true" className="display block text-8xl leading-[0.6] text-gold">
                  “
                </span>
                <p className="display mt-4 max-w-[38ch] text-2xl leading-snug text-white lg:text-[1.75rem]">{lead}</p>
                {rest.map((m) => (
                  <p key={m} className="mt-6 max-w-[62ch] text-lg leading-[1.75] text-white/75">
                    {m}
                  </p>
                ))}
                <footer className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-4">
                    <span className="block h-14 w-12 overflow-hidden rounded-xl">
                      <img src={l.image} alt="" className="h-full w-full scale-[1.32] object-cover" />
                    </span>
                    <div>
                      <p className="display text-xl">{l.name ?? l.role}</p>
                      <p className="text-sm text-white/65">{l.name ? `${l.role}, Dr. Lankapalli Bullayya College` : 'Dr. Lankapalli Bullayya College'}</p>
                    </div>
                  </div>
                  <Link to={`/leadership/${active + 1}`} className="btn-ghost">
                    Open as a page <ArrowRight className="h-4 w-4" />
                  </Link>
                </footer>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Spotlight>
  )
}
