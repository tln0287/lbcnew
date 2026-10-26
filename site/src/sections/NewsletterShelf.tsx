import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { RiseText, Spotlight } from '../components/Effects'
import { TiltCard } from '../components/TiltCard'
import { newsletters, thumbSrc } from '../lib/newsletters'

const EASE = [0.16, 1, 0.3, 1] as const

/** Newsletters: featured latest LBC Times issue beside a scrollable rail of Campus Glimpses. */
export function NewsletterShelf() {
  const reduce = useReducedMotion()
  const rail = useRef<HTMLDivElement>(null)
  const times = newsletters.find((n) => n.kind === 'The LBC Times') ?? newsletters[0]
  const glimpses = newsletters.filter((n) => n !== times)
  const scroll = (d: number) => rail.current?.scrollBy({ left: d * (rail.current.clientWidth * 0.8), behavior: reduce ? 'auto' : 'smooth' })

  return (
    <Spotlight className="navy-drift relative overflow-hidden py-24 text-white lg:py-32">
      {/* soft light behind the featured issue */}
      <div aria-hidden="true" className="pointer-events-none absolute top-1/3 -left-40 h-[520px] w-[520px] rounded-full bg-gold/15 blur-[120px]" />

      <div className="container-x relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <RiseText text="What’s been happening?" className="h-section !text-white" />
            <p className="mt-5 max-w-[60ch] text-lg leading-[1.65] text-white/75">The college newsletter and every monthly issue of Campus Glimpses, readable page by page.</p>
          </div>
          <Link to="/newsletters" className="btn-ghost">
            All {newsletters.length} issues <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          {/* featured issue */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: EASE }}
            className="grid gap-8 sm:grid-cols-[220px_1fr] sm:items-center lg:grid-cols-1 xl:grid-cols-[240px_1fr]"
          >
            <Link to={`/newsletters/${times.slug}`} className="group mx-auto block w-[220px] sm:mx-0 xl:w-[240px]" aria-label={`Read ${times.kind}, ${times.month} ${times.year}`}>
              <TiltCard className="rounded-[12px]">
                <div className="relative overflow-hidden rounded-[12px] bg-white shadow-[0_40px_70px_-25px_rgb(0_0_0/0.7)] ring-1 ring-white/20" style={{ aspectRatio: `${times.ratio}` }}>
                  <img src={`/newsletters/${times.slug}/p001.webp`} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
                  {/* page edge highlight */}
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/20 to-transparent" />
                </div>
              </TiltCard>
            </Link>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gold px-3 py-1 text-xs font-bold text-navy">Latest issue</span>
              <h3 className="display mt-4 text-4xl !text-white italic">{times.kind}</h3>
              <p className="mt-2 text-white/70">
                {times.month}
                {/\d/.test(times.month) ? ',' : ''} {times.year} · {times.pages} pages
              </p>
              <ul className="mt-6 flex gap-2" aria-hidden="true">
                {[2, 3, 4].filter((n) => n <= times.pages).map((n) => (
                  <li key={n} className="w-14 overflow-hidden rounded-md bg-white/90 ring-1 ring-white/20" style={{ aspectRatio: `${times.ratio}` }}>
                    <img src={thumbSrc(times.slug, n)} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to={`/newsletters/${times.slug}`} className="btn-gold">
                  <BookOpen className="h-4 w-4" aria-hidden="true" /> Read now
                </Link>
                <a href={times.pdf} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  PDF <ArrowUpRight className="h-4 w-4" />
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Campus Glimpses rail */}
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-4">
              <p className="display text-2xl text-gold-2">Campus Glimpses</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => scroll(-1)} aria-label="Scroll back" className="grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white transition hover:bg-white hover:text-navy">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => scroll(1)} aria-label="Scroll forward" className="grid h-11 w-11 place-items-center rounded-full bg-gold text-navy transition hover:bg-gold-2">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div ref={rail} className="scrollbar-none -mx-2 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-2 pt-2 pb-4">
              {glimpses.map((n, i) => (
                <motion.div
                  key={n.slug}
                  className="w-[170px] shrink-0 snap-start sm:w-[190px]"
                  initial={reduce ? false : { opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: Math.min(i * 0.06, 0.4), ease: EASE }}
                >
                  <Link to={`/newsletters/${n.slug}`} className="group block" aria-label={`Campus Glimpses, ${n.title} — ${n.pages} pages`}>
                    <div className="relative overflow-hidden rounded-[10px] bg-white shadow-[0_24px_40px_-20px_rgb(0_0_0/0.7)] ring-1 ring-white/15 transition duration-500 group-hover:-translate-y-2 group-focus-visible:-translate-y-2 group-focus-visible:ring-2 group-focus-visible:ring-gold" style={{ aspectRatio: `${n.ratio}` }}>
                      <img src={thumbSrc(n.slug, 1)} srcSet={`${thumbSrc(n.slug, 1)} 180w, /newsletters/${n.slug}/p001.webp 1100w`} sizes="190px" alt="" className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" loading="lazy" />
                      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/30 opacity-0 transition group-hover:opacity-100" />
                    </div>
                    <p className="mt-4 flex items-baseline gap-2">
                      <span className="display text-xl text-white">{n.month}</span>
                      {n.year && <span className="text-sm text-gold-2">{n.year}</span>}
                    </p>
                    <p className="text-sm text-white/60">{n.pages} pages</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Spotlight>
  )
}
