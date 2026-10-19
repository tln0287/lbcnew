import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RiseText } from '../components/Effects'
import { Fade, ImageReveal, WipeText } from '../components/Motion'
import { TiltCard } from '../components/TiltCard'
import { FOUNDED } from '../content/home'
import { about, milestones } from '../content/site'

function Introduction() {
  return (
    <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.05fr]">
      <div className="relative mx-auto w-full max-w-xl lg:mx-0">
        <div aria-hidden="true" className="absolute -right-4 -bottom-4 h-full w-full rounded-[28px] border-2 border-gold/70 sm:-right-6 sm:-bottom-6" />
        <TiltCard className="rounded-[28px]">
          <ImageReveal src="/img/static/skill/b1.webp" alt="LBC campus buildings with students assembled on the college ground" className="raised aspect-[4/5] rounded-[28px]" />
        </TiltCard>
        <div className="navy-flat raised absolute -bottom-8 left-5 flex items-center gap-4 rounded-[22px] px-5 py-4 text-white sm:left-8">
          <img src="/brand/a-grade.png" alt="" className="h-12 w-auto" />
          <div>
            <p className="display text-lg">Accredited by NAAC</p>
            <p className="text-sm text-white/70">Affiliated to Andhra University</p>
          </div>
        </div>
      </div>
      <div>
        <RiseText text="Serving higher education in north coastal Andhra since 1973" className="h-section" />
        <Fade delay={0.1}>
          <p className="lede mt-6">{about.intro}</p>
          <p className="mt-4 max-w-[60ch] leading-[1.65] text-slate">{about.affiliation}</p>
          <blockquote className="mt-8 border-l-2 border-gold pl-6">
            <p className="display text-xl leading-snug text-navy italic sm:text-2xl">“{about.vision}”</p>
            <footer className="mt-2 text-sm font-semibold text-slate">Our vision</footer>
          </blockquote>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/profile" className="btn-navy">
              Read the college profile <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/pg-college" className="btn-outline">
              Visit the PG College
            </Link>
          </div>
        </Fade>
      </div>
    </div>
  )
}

/** A gold line draws itself as the visitor scrolls; milestones light up as it reaches them. */
function Timeline() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const n = milestones.length
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const [reached, setReached] = useState(reduce ? n - 1 : -1)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!reduce) setReached(Math.floor(v * (n - 1) + 0.05))
  })
  const years = new Date().getFullYear() - FOUNDED

  return (
    <div className="mt-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <RiseText text="Five decades, one campus" className="h-section" />
        <p className="display text-2xl text-navy">
          <span className="text-gold">{years}</span> years since {FOUNDED}
        </p>
      </div>

      <div ref={ref} className="relative mt-14">
        {/* Desktop: horizontal zig-zag */}
        <div className="relative hidden h-[420px] lg:block">
          <div className="absolute inset-x-0 top-1/2 h-px bg-track" />
          <motion.div className="absolute inset-x-0 top-1/2 h-[2px] origin-left bg-gold" style={{ scaleX: reduce ? 1 : progress }} />
          <ol className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {milestones.map((m, i) => {
              const on = i <= reached
              const up = i % 2 === 0
              return (
                <li key={m.year + i} className="relative">
                  <span
                    className={`absolute top-1/2 left-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-500 ${on ? 'border-gold bg-gold' : 'border-track bg-white'}`}
                    style={on && !reduce ? { animation: 'pulse-once 0.9s ease-out' } : undefined}
                  />
                  <div className={`absolute left-1/2 w-[170%] max-w-[210px] -translate-x-1/2 text-center transition-opacity duration-700 ${up ? 'bottom-[calc(50%+22px)]' : 'top-[calc(50%+22px)]'} ${on ? 'opacity-100' : 'opacity-45'}`}>
                    <WipeText text={m.year} active={on} className="display text-3xl" />
                    <p className={`mt-1 text-sm leading-snug text-slate transition duration-700 ${on ? 'translate-y-0' : 'translate-y-2'}`}>{m.text}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Phones: vertical line on the left */}
        <div className="relative lg:hidden">
          <div className="absolute top-0 bottom-0 left-[7px] w-px bg-track" />
          <motion.div className="absolute top-0 bottom-0 left-[6px] w-[2px] origin-top bg-gold" style={{ scaleY: reduce ? 1 : progress }} />
          <ol className="grid gap-8 pl-10">
            {milestones.map((m, i) => {
              const on = i <= reached
              return (
                <li key={m.year + i} className={`relative transition-opacity duration-700 ${on ? 'opacity-100' : 'opacity-45'}`}>
                  <span className={`absolute top-2.5 -left-10 h-3.5 w-3.5 rounded-full border-2 transition-colors duration-500 ${on ? 'border-gold bg-gold' : 'border-track bg-white'}`} />
                  <WipeText text={m.year} active={on} className="display text-2xl" />
                  <p className="mt-1 text-[15px] leading-snug text-slate">{m.text}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}

function Objectives() {
  return (
    <Fade className="card raised mt-24 grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_2fr]">
      <h3 className="display text-3xl leading-tight">What we set out to do</h3>
      <ol className="grid gap-8 sm:grid-cols-3">
        {about.objectives.map((o) => (
          <li key={o}>
            <span className="block h-0.5 w-10 bg-gold" aria-hidden="true" />
            <p className="mt-4 leading-[1.65] text-navy">{o}</p>
          </li>
        ))}
      </ol>
    </Fade>
  )
}

export function Intro() {
  return (
    <section className="section-y bg-mist">
      <div className="container-x">
        <Introduction />
        <Timeline />
        <Objectives />
      </div>
    </section>
  )
}
