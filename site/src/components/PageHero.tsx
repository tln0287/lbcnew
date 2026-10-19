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
      <Spotlight className="navy-drift relative overflow-hidden pt-44 pb-20 text-white sm:pt-52 sm:pb-24">
        {/* drifting gold glow behind the seal */}
        <motion.div
          aria-hidden="true"
          style={{ y: glowY }}
          className="pointer-events-none absolute top-1/2 right-[8%] h-[560px] w-[560px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(214_173_96/0.22),transparent_65%)]"
          animate={reduce ? undefined : { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* seal: turns into place, keeps its slow rotation, drifts with scroll */}
        <motion.div
          aria-hidden="true"
          style={{ y: sealY }}
          className="pointer-events-none absolute top-1/2 -right-28 -mt-[260px] h-[520px] w-[520px] sm:-right-16"
          initial={reduce ? false : { opacity: 0, scale: 0.82, rotate: -40 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.6, ease: EASE }}
        >
          <Seal className="h-full w-full" opacity={0.85} />
        </motion.div>

        {/* one band of warm light sweeping across on load */}
        {!reduce && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 w-1/3"
              style={{ background: 'linear-gradient(90deg, transparent, rgb(255 222 160 / 0.10), transparent)', animation: 'sweep 3.2s ease-in-out 0.4s both' }}
            />
          </div>
        )}

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
                <motion.p variants={rise} className="text-base font-semibold text-gold-2">
                  {eyebrow}
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
