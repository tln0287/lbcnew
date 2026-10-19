import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RiseText, Spotlight } from '../components/Effects'
import { Counter, DrawIcon, Fade, WipeText } from '../components/Motion'
import { admissionSteps, explorer, totalSeats, type ExplorerItem } from '../content/home'
import { faculty } from '../lib/data'

const STEP_VH = 55

function useDesktop() {
  const q = '(min-width: 1024px)'
  const [d, setD] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const on = () => setD(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return d
}

/** Muted hue per chip so each subject gets its own tint. */
const tint = (i: number) => ({ background: `hsl(${(i * 47 + 205) % 360} 38% 92%)`, color: `hsl(${(i * 47 + 205) % 360} 40% 30%)` })
const mark = (s: string) =>
  s
    .replace(/[^A-Za-z ]/g, '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
    .padEnd(2, s.replace(/[^a-z]/g, '')[0] ?? '')

function ProgrammeCard({ item, peek = false }: { item: ExplorerItem; peek?: boolean }) {
  const share = item.seats / totalSeats
  return (
    <article className="overflow-hidden rounded-[28px] bg-white raised">
      <div className={`navy-flat relative overflow-hidden px-8 pt-7 pb-6 text-white [&>*]:transition-opacity [&>*]:duration-500 ${peek ? '[&>*]:opacity-0' : ''}`}>
        <span aria-hidden="true" className="display pointer-events-none absolute -top-6 -right-2 text-[9rem] leading-none text-white/[0.06] select-none">
          {item.code}
        </span>
        <p className="display text-6xl leading-none text-gold-2">{item.code}</p>
        <p className="mt-3 text-sm text-white/75">{item.sub}</p>
      </div>
      <div className={`p-8 transition-opacity duration-500 ${peek ? 'opacity-0' : ''}`}>
        <h3 className="display text-2xl">{item.name}</h3>
        <p className="mt-2 leading-[1.6] text-slate">{item.description}</p>
        <p className="mt-5 text-sm font-semibold text-navy">{item.chipsLabel}</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {item.chips.map((c, i) => (
            <li key={c} className="inline-flex items-center gap-2 rounded-full border border-navy/8 bg-mist py-1 pr-3 pl-1 text-sm text-navy">
              <span className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold" style={tint(i)} aria-hidden="true">
                {mark(c)}
              </span>
              {c}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-navy">{item.seats.toLocaleString('en-IN')} seats</span>
            <span className="text-slate">{Math.round(share * 100)}% of {totalSeats.toLocaleString('en-IN')}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-track">
            <motion.div className="h-full origin-left rounded-full bg-gold" initial={{ scaleX: 0 }} whileInView={{ scaleX: share }} viewport={{ once: false }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} />
          </div>
        </div>
        <Link to={item.to} className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-royal hover:text-navy">
          Programme details <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}

function Stack({ active }: { active: number }) {
  const n = explorer.length
  return (
    <div className="grid pt-24">
      {explorer.map((item, i) => {
        const d = (i - active + n) % n
        const visible = d <= 2
        return (
          <motion.div
            key={item.code}
            className="[grid-area:1/1]"
            style={{ zIndex: n - d, transformOrigin: 'top center' }}
            animate={{
              y: d === 0 ? 0 : d === 1 ? -42 : -82,
              scale: d === 0 ? 1 : d === 1 ? 0.95 : 0.9,
              rotate: d === 0 ? 0 : d === 1 ? 1.5 : -1.5,
              opacity: visible ? (d === 0 ? 1 : 0.9) : 0,
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            aria-hidden={d !== 0}
            inert={d !== 0 ? true : undefined}
          >
            <ProgrammeCard item={item} peek={d !== 0} />
          </motion.div>
        )
      })}
    </div>
  )
}

function Explorer() {
  const desktop = useDesktop()
  const reduce = useReducedMotion()
  const pinned = desktop && !reduce
  const wrap = useRef<HTMLDivElement>(null)
  const n = explorer.length
  const [pos, setPos] = useState(0) // 0 … n-1, continuous
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => pinned && setPos(v * (n - 1)))
  const [clicked, setClicked] = useState(0)
  const active = pinned ? Math.min(n - 1, Math.round(pos)) : clicked

  const goTo = (i: number) => {
    const target = Math.max(0, Math.min(n - 1, i))
    if (!pinned || !wrap.current) return setClicked(target)
    const top = wrap.current.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + (target * STEP_VH * window.innerHeight) / 100 + 2, behavior: 'smooth' })
  }

  const left = (
    <div>
      <RiseText text="What can I study here?" className="h-section" />
      <p className="lede mt-5">Four-year Honours degrees under Andhra University's semester pattern, and two-year master's programmes in the PG College.</p>
      <ol className="mt-10 grid gap-4">
        {explorer.map((it, i) => {
          const fill = pinned ? Math.max(0, Math.min(1, pos - i + 0.5)) : i === active ? 1 : 0
          return (
            <li key={it.code}>
              <button type="button" onClick={() => goTo(i)} aria-current={i === active ? 'true' : undefined} className="group block w-full text-left">
                <span className="flex items-baseline justify-between gap-4">
                  <WipeText text={it.name} active={i === active} className="display text-[clamp(1.6rem,2.6vw,2.4rem)] leading-tight" />
                  <span className="shrink-0 text-sm text-slate">{it.seats.toLocaleString('en-IN')} seats</span>
                </span>
                <span className="mt-2 block h-[2px] overflow-hidden rounded-full bg-track">
                  <span className="block h-full origin-left bg-gold transition-transform duration-200" style={{ transform: `scaleX(${fill})` }} />
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      <div className="mt-8 flex items-center gap-3">
        <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous programme" className="grid h-11 w-11 place-items-center rounded-full border border-navy/20 text-navy hover:bg-navy hover:text-white">
          <ChevronUp className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => goTo(active + 1)} aria-label="Next programme" className="grid h-11 w-11 place-items-center rounded-full border border-navy/20 text-navy hover:bg-navy hover:text-white">
          <ChevronDown className="h-5 w-5" />
        </button>
        {pinned && active < n - 1 && <p className="text-sm text-slate">Keep scrolling for the next one</p>}
      </div>
    </div>
  )

  if (!desktop) {
    return (
      <div>
        {left}
        <div className="mt-10 grid gap-6">
          {explorer.map((it) => (
            <Fade key={it.code}>
              <ProgrammeCard item={it} />
            </Fade>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={wrap} style={{ height: pinned ? `calc(100vh + ${(n - 1) * STEP_VH}vh)` : undefined }}>
      <div className={pinned ? 'sticky top-0 flex h-screen items-center pt-[76px] min-[1360px]:pt-[116px]' : ''}>
        <div className="grid w-full items-center gap-16 lg:grid-cols-[1fr_1fr]">
          {left}
          <Stack active={active} />
        </div>
      </div>
    </div>
  )
}

const ICONS: Record<string, string[]> = {
  form: ['M14 6h16l8 8v28H14z', 'M30 6v8h8', 'M19 22h14', 'M19 28h14', 'M19 34h9'],
  cap: ['M4 18 24 9l20 9-20 9z', 'M12 22v9c0 3 6 6 12 6s12-3 12-6v-9', 'M44 18v11'],
  briefcase: ['M8 16h32v24H8z', 'M18 16v-5h12v5', 'M8 26h32', 'M22 26v4h4v-4'],
}

export function Programmes() {
  const seatsFigure = totalSeats
  return (
    <section className="relative bg-white" style={{ overflow: 'clip' }}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(rgb(16 42 67 / 0.05) 1px, transparent 1px), linear-gradient(90deg, rgb(16 42 67 / 0.05) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'linear-gradient(180deg, transparent, #000 15%, #000 85%, transparent)' }} />
      <div className="container-x relative py-24 lg:py-16">
        <Explorer />

        <div className="mt-24 grid gap-6 md:grid-cols-3">
          {admissionSteps.map((s, i) => (
            <Fade key={s.title} delay={i * 0.1} className="card p-8">
              <DrawIcon paths={ICONS[s.icon]} className="h-12 w-12 text-gold" />
              <h3 className="display mt-5 text-2xl">{s.title}</h3>
              <p className="mt-3 leading-[1.6] text-slate">{s.text}</p>
            </Fade>
          ))}
        </div>

        <Spotlight as="div" className="navy-drift mt-10 overflow-hidden rounded-[28px] px-8 py-10 text-white">
          <dl className="relative grid grid-cols-2 gap-8 lg:grid-cols-4">
            {[
              { n: seatsFigure, l: 'UG sanctioned seats and PG intake' },
              { n: 87, l: 'Classrooms (56 UG · 31 PG)' },
              { n: 33, l: 'Laboratories (16 UG · 17 PG)' },
              { n: faculty.length, l: 'Faculty in the directory' },
            ].map((f) => (
              <div key={f.l}>
                <dt className="order-2 mt-1 text-sm text-white/70">{f.l}</dt>
                <dd className="display order-1 text-5xl text-gold-2">
                  <Counter to={f.n} />
                </dd>
              </div>
            ))}
          </dl>
        </Spotlight>
      </div>
    </section>
  )
}
