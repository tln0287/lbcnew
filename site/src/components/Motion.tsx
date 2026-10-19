import { animate, motion, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'

const EASE = [0.16, 1, 0.3, 1] as const

/** Photo unclips from a narrow band while scaling 1.18 → 1, once on scroll into view. */
export function ImageReveal({ src, alt, className = '', imgClassName = '' }: { src: string; alt: string; className?: string; imgClassName?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      initial={reduce ? false : { clipPath: 'inset(38% 0% 38% 0%)' }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1.1, ease: EASE }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        className={`h-full w-full object-cover ${imgClassName}`}
        initial={reduce ? false : { scale: 1.18 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.4, ease: EASE }}
      />
    </motion.div>
  )
}

/** Number that counts up once when it scrolls into view. */
export function Counter({ to, suffix = '', className = '' }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()
  const [v, setV] = useState(reduce ? to : 0)
  useEffect(() => {
    if (!inView || reduce) return
    const c = animate(0, to, { duration: 1.6, ease: EASE, onUpdate: (x) => setV(Math.round(x)) })
    return () => c.stop()
  }, [inView, to, reduce])
  return (
    <span ref={ref} className={className}>
      {v.toLocaleString('en-IN')}
      {suffix}
    </span>
  )
}

/** Outlined text that fills with navy from left to right when active. */
export function WipeText({ text, active, className = '', fill = 'var(--color-navy)', stroke = 'rgb(16 42 67 / 0.45)' }: { text: string; active: boolean; className?: string; fill?: string; stroke?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span aria-hidden="true" style={{ color: 'transparent', WebkitTextStroke: `1px ${stroke}` }}>
        {text}
      </span>
      <span
        className="absolute inset-0 transition-[clip-path] duration-700 ease-out-expo"
        style={{ color: fill, clipPath: active ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
      >
        {text}
      </span>
    </span>
  )
}

/** Line icon whose strokes draw themselves on scroll into view. */
export function DrawIcon({ paths, className = '' }: { paths: string[]; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  )
}

export function Fade({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
