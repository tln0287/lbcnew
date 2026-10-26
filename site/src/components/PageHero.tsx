import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Seal, Spotlight } from './Effects'

type Crumb = { label: string; to?: string }

const EASE = [0.16, 1, 0.3, 1] as const

export function usePageTitle(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Dr. Lankapalli Bullayya College` : 'Dr. Lankapalli Bullayya College, Visakhapatnam'
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])
}

/** Fade-and-rise child of the hero's staggered entrance. */
const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

/**
 * Inner page header: slow-drifting navy gradient with the college seal.
 * On load: a gold rule draws in; breadcrumb, label, headline (word by word),
 * intro and extras rise in sequence; the seal turns into place; one band of
 * warm light sweeps across. While scrolling, the seal and glow drift (parallax).
 * Everything is static with reduced motion.
 */
export function PageHero({
  title,
  eyebrow,
  text,
  crumbs = [],
  children,
}: {
  title: string
  eyebrow?: string
  text?: string
  /** kept for compatibility; inner headers use the navy gradient, not photos */
  image?: string
  crumbs?: Crumb[]
  children?: ReactNode
}) {
  usePageTitle(title, text)
  const reduce = !!useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const sealY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 140])
  const glowY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -80])
  const copyY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 60])
  const copyO = useTransform(scrollYProgress, [0, 0.8], reduce ? [1, 1] : [1, 0.35])
  const words = title.split(' ')

  return (
    <div ref={ref}>
      <Spotlight className="relative overflow-hidden bg-navy pt-44 pb-28 text-white sm:pt-52 sm:pb-32">
        {/* 1 — aurora: slow-moving blobs of royal, deep blue and gold light */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,#0b2036_0%,#102a43_40%,#16365a_70%,#0f2740_100%)]" />
          <motion.div style={{ y: glowY }} className="absolute -top-40 -left-32 h-[560px] w-[560px] rounded-full bg-royal/35 blur-[110px]" animate={reduce ? undefined : { x: [0, 80, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute -bottom-48 left-1/3 h-[480px] w-[620px] rounded-full bg-[#1d4f7a]/40 blur-[120px]" animate={reduce ? undefined : { x: [0, -90, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute top-10 right-[10%] h-[420px] w-[420px] rounded-full bg-gold/20 blur-[100px]" animate={reduce ? undefined : { scale: [1, 1.18, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
        </div>

        {/* 2 — fine gold grid in perspective, flowing toward the viewer */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] opacity-40"
          style={{
            backgroundImage: 'linear-gradient(rgb(214 173 96 / 0.18) 1px, transparent 1px), linear-gradient(90deg, rgb(214 173 96 / 0.18) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            transform: 'perspective(700px) rotateX(58deg)',
            transformOrigin: 'bottom',
            maskImage: 'linear-gradient(to top, #000 0%, transparent 85%)',
            WebkitMaskImage: 'linear-gradient(to top, #000 0%, transparent 85%)',
            animation: reduce ? undefined : 'grid-flow 6s linear infinite',
          }}
        />

        {/* 3 — giant outlined title watermark */}
        <motion.p
          aria-hidden="true"
          className="display pointer-events-none absolute bottom-4 left-0 hidden whitespace-nowrap text-[12rem] leading-none text-transparent select-none lg:block"
          style={{ WebkitTextStroke: '1px rgb(255 255 255 / 0.07)' }}
          initial={reduce ? false : { opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.8, ease: EASE }}
        >
          {title}
        </motion.p>

        {/* 4 — rising gold particles */}
        {!reduce && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 18 }, (_, i) => (
              <span
                key={i}
                className="absolute -bottom-2 rounded-full bg-gold-2"
                style={{
                  left: `${(i * 53) % 100}%`,
                  width: 2 + (i % 3),
                  height: 2 + (i % 3),
                  boxShadow: '0 0 8px rgb(232 203 138 / 0.9)',
                  animation: `rise-up ${9 + (i % 5) * 2}s linear ${(i * 0.7) % 9}s infinite`,
                }}
              />
            ))}
          </div>
        )}

        {/* 5 — seal inside orbiting rings */}
        <motion.div
          aria-hidden="true"
          style={{ y: sealY }}
          className="pointer-events-none absolute top-[100px] -right-10 h-[160px] w-[160px] sm:top-[150px] sm:right-10 sm:h-[280px] sm:w-[280px] lg:top-[170px] lg:right-[8%] lg:h-[340px] lg:w-[340px]"
          initial={reduce ? false : { opacity: 0, scale: 0.7, rotate: -50 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.8, ease: EASE }}
        >
          <span className="absolute -inset-[16%] rounded-full border border-dashed border-gold/30" style={{ animation: reduce ? undefined : 'spin-slow 60s linear infinite reverse' }}>
            <span className="absolute top-1/2 -left-1.5 h-3 w-3 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_16px_4px_rgb(214_173_96/0.7)]" />
          </span>
          <span className="absolute -inset-[6%] rounded-full border border-white/15" style={{ animation: reduce ? undefined : 'spin-slow 24s linear infinite' }}>
            <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white shadow-[0_0_12px_3px_rgb(255_255_255/0.6)]" />
            <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold-2" />
          </span>
          {!reduce && (
            <span
              className="absolute -inset-[3%] rounded-full opacity-60 blur-md"
              style={{ background: 'conic-gradient(from 0deg, transparent 0 70%, rgb(232 203 138 / 0.55) 85%, transparent 100%)', animation: 'spin-slow 8s linear infinite' }}
            />
          )}
          {!reduce && <span className="absolute inset-[8%] rounded-full bg-gold/25 blur-2xl" style={{ animation: 'pulse-glow 4s ease-in-out infinite' }} />}
          <Seal className="relative h-full w-full opacity-70 sm:opacity-100" opacity={0.9} shine />
          {!reduce &&
            [
              { t: '-4%', l: '14%', d: '0s', s: 16 },
              { t: '80%', l: '-6%', d: '1.4s', s: 11 },
              { t: '12%', l: '96%', d: '2.3s', s: 13 },
              { t: '96%', l: '74%', d: '3.1s', s: 10 },
              { t: '46%', l: '104%', d: '0.8s', s: 8 },
            ].map((p, i) => (
              <svg key={i} viewBox="0 0 16 16" className="absolute text-gold-2" style={{ top: p.t, left: p.l, width: p.s, height: p.s, animation: `twinkle 3.6s ease-in-out ${p.d} infinite` }}>
                <path fill="currentColor" d="M8 0c.6 4.6 2.8 6.9 8 8-5.2 1.1-7.4 3.4-8 8-.6-4.6-2.8-6.9-8-8 5.2-1.1 7.4-3.4 8-8Z" />
              </svg>
            ))}
        </motion.div>

        {/* 6 — light sweep on load */}
        {!reduce && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1/3" style={{ background: 'linear-gradient(90deg, transparent, rgb(255 222 160 / 0.12), transparent)', animation: 'sweep 3.2s ease-in-out 0.4s both' }} />
          </div>
        )}

        {/* 7 — curved bottom edge with a gold rim that draws in */}
        <svg aria-hidden="true" viewBox="0 0 1440 80" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 -bottom-px h-12 w-full sm:h-16">
          <defs>
            <linearGradient id="heroRim" x1="0" x2="1">
              <stop offset="0" stopColor="#d6ad60" stopOpacity="0" />
              <stop offset="0.5" stopColor="#e8cb8a" />
              <stop offset="1" stopColor="#d6ad60" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 80 L0 40 Q720 -20 1440 40 L1440 80 Z" fill="var(--color-mist)" />
          <motion.path d="M0 40 Q720 -20 1440 40" fill="none" stroke="url(#heroRim)" strokeWidth="2" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, delay: 0.6, ease: 'easeInOut' }} />
        </svg>

        <motion.div style={{ y: copyY, opacity: copyO }} className="container-x relative">
          <motion.div initial={reduce ? false : 'hidden'} animate="show" variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}>
            <motion.span
              aria-hidden="true"
              className="mb-6 block h-[3px] w-16 origin-left rounded-full bg-gold"
              variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.8, ease: EASE } } }}
            />
            <motion.nav aria-label="Breadcrumb" variants={rise}>
              <ol className="flex flex-wrap items-center gap-1 text-sm text-white/65">
                <li>
                  <Link to="/" className="hover:text-gold-2">
                    Home
                  </Link>
                </li>
                {crumbs.map((c) => (
                  <li key={c.label} className="flex items-center gap-1">
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    {c.to ? (
                      <Link to={c.to} className="hover:text-gold-2">
                        {c.label}
                      </Link>
                    ) : (
                      <span>{c.label}</span>
                    )}
                  </li>
                ))}
                <li className="flex items-center gap-1 text-white">
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  <span aria-current="page">{title}</span>
                </li>
              </ol>
            </motion.nav>

            <div className="mt-8 max-w-3xl">
              {eyebrow && (
                <motion.p variants={rise} className="inline-flex items-center gap-3 text-base font-semibold">
                  <span className="h-px w-8 bg-gold" aria-hidden="true" />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #d6ad60 0%, #f6e3b4 25%, #d6ad60 50%, #f6e3b4 75%, #d6ad60 100%)',
                      backgroundSize: '200% 100%',
                      animation: reduce ? undefined : 'text-shimmer 4s linear infinite',
                    }}
                  >
                    {eyebrow}
                  </span>
                </motion.p>
              )}
              <motion.h1
                className="h-section mt-3 !text-white"
                aria-label={title}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
              >
                {words.map((w, i) => (
                  <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                    <motion.span
                      className="inline-block"
                      variants={{ hidden: { y: '105%' }, show: { y: '0%', transition: { duration: 0.9, ease: EASE } } }}
                    >
                      {w}
                      {i < words.length - 1 ? ' ' : ''}
                    </motion.span>
                  </span>
                ))}
              </motion.h1>
              {text && (
                <motion.p variants={rise} className="mt-5 max-w-[60ch] text-lg leading-[1.65] text-white/80">
                  {text}
                </motion.p>
              )}
              {children && <motion.div variants={rise}>{children}</motion.div>}
            </div>
          </motion.div>
        </motion.div>
      </Spotlight>
    </div>
  )
}
