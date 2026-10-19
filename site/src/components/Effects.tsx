import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

/** 3px gold bar across the top of the window. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 })
  return <motion.div aria-hidden="true" style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gold" />
}

/** Round navy button with a gold progress ring; appears after the first screen. */
export function BackToTop() {
  const [p, setP] = useState(0)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setP(max > 0 ? window.scrollY / max : 0)
      setShow(window.scrollY > window.innerHeight)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])
  const C = 2 * Math.PI * 22
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed right-5 bottom-5 z-40 grid h-[52px] w-[52px] place-items-center rounded-full bg-navy text-white shadow-[var(--shadow-raised)] transition duration-500 hover:-translate-y-0.5 sm:right-8 sm:bottom-8 ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
      tabIndex={show ? 0 : -1}
    >
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 52 52" aria-hidden="true">
        <circle cx="26" cy="26" r="22" fill="none" stroke="rgb(255 255 255 / 0.15)" strokeWidth="2.5" />
        <circle cx="26" cy="26" r="22" fill="none" stroke="var(--color-gold)" strokeWidth="2.5" strokeDasharray={C} strokeDashoffset={C * (1 - p)} strokeLinecap="round" />
      </svg>
      <ArrowUp className="relative h-5 w-5" />
    </button>
  )
}

/** Faint gold light that follows the pointer across a navy section (mouse only). */
export function Spotlight({ children, className = '', as: Tag = 'section', ...rest }: { children: ReactNode; className?: string; as?: ElementType } & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  return (
    <Tag
      ref={ref}
      className={`relative ${className}`}
      onPointerMove={(e: React.PointerEvent<HTMLElement>) => {
        if (reduce || e.pointerType !== 'mouse' || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        ref.current.style.setProperty('--sx', `${e.clientX - r.left}px`)
        ref.current.style.setProperty('--sy', `${e.clientY - r.top}px`)
        ref.current.style.setProperty('--so', '1')
      }}
      onPointerLeave={() => ref.current?.style.setProperty('--so', '0')}
      {...rest}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
        style={{
          opacity: 'var(--so, 0)',
          background: 'radial-gradient(520px circle at var(--sx, 50%) var(--sy, 50%), rgb(214 173 96 / 0.10), transparent 60%)',
        }}
      />
      {children}
    </Tag>
  )
}

/** The college seal in white at low opacity; one turn per 120s unless static. */
export function Seal({ className = '', opacity = 0.4, still = false }: { className?: string; opacity?: number; still?: boolean }) {
  const reduce = useReducedMotion()
  return (
    <img
      src="/brand/seal-white.png"
      alt=""
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity, filter: 'drop-shadow(0 0 1px rgb(255 255 255 / 0.6))', animation: still || reduce ? undefined : 'spin-slow 120s linear infinite' }}
    />
  )
}

/** Heading whose words rise into place (55ms stagger), once on scroll into view. */
export function RiseText({ text, as: Tag = 'h2', className = '' }: { text: string; as?: ElementType; className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return <Tag className={className}>{text}</Tag>
  const words = text.split(' ')
  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        aria-hidden="true"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        transition={{ staggerChildren: 0.055 }}
        className="inline"
      >
        {words.map((w, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span
              className="inline-block"
              variants={{ hidden: { y: '105%' }, show: { y: '0%', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
            >
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}
