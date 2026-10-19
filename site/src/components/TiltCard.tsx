import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import type { ReactNode } from 'react'

/** Tilts up to `max`° toward the pointer with a soft glare (mouse only; flat for touch and reduced motion). */
export function TiltCard({ children, className = '', max = 7, glare = true }: { children: ReactNode; className?: string; max?: number; glare?: boolean }) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)
  const o = useMotionValue(0)
  const rx = useSpring(useTransform(y, [0, 1], [max, -max]), { stiffness: 200, damping: 20 })
  const ry = useSpring(useTransform(x, [0, 1], [-max, max]), { stiffness: 200, damping: 20 })
  const gx = useTransform(x, (v) => `${v * 100}%`)
  const gy = useTransform(y, (v) => `${v * 100}%`)
  const bg = useMotionTemplate`radial-gradient(420px circle at ${gx} ${gy}, rgb(255 255 255 / 0.22), transparent 55%)`
  const go = useSpring(o, { stiffness: 200, damping: 30 })

  if (reduce) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900, transformStyle: 'preserve-3d' }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left) / r.width)
        y.set((e.clientY - r.top) / r.height)
        o.set(1)
      }}
      onPointerLeave={() => {
        x.set(0.5)
        y.set(0.5)
        o.set(0)
      }}
    >
      {children}
      {glare && <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]" style={{ background: bg, opacity: go }} />}
    </motion.div>
  )
}
