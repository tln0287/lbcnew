import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export type LightboxItem = { src: string; alt: string; caption?: string; text?: string; link?: { label: string; to: string } }

/** Full-screen photo viewer: 3D turn between photos, counter, ←/→/Esc, focus trap. */
export function Lightbox({ items, index, onChange }: { items: LightboxItem[]; index: number | null; onChange: (i: number | null) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  const reduce = useReducedMotion()
  const [dir, setDir] = useState(1)
  const open = index !== null

  const step = (d: number) => {
    setDir(d)
    onChange((((index ?? 0) + d) % items.length + items.length) % items.length)
  }

  useEffect(() => {
    if (!open) return
    lastFocus.current = document.activeElement as HTMLElement
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      lastFocus.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onChange(null)
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
      else if (e.key === 'Tab' && ref.current) {
        const f = Array.from(ref.current.querySelectorAll<HTMLElement>('button,a[href]'))
        if (!f.length) return
        if (e.shiftKey && document.activeElement === f[0]) {
          e.preventDefault()
          f[f.length - 1].focus()
        } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
          e.preventDefault()
          f[0].focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const item = index !== null ? items[index] : null
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex flex-col bg-navy/95 backdrop-blur-md"
          onClick={() => onChange(null)}
        >
          <div className="flex items-center justify-between p-4 text-white" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-semibold text-white/75" aria-live="polite">
              {(index ?? 0) + 1} of {items.length}
            </p>
            <button ref={closeRef} type="button" onClick={() => onChange(null)} aria-label="Close photo viewer" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4" style={{ perspective: 1600 }} onClick={(e) => e.stopPropagation()}>
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.img
                key={item.src}
                src={item.src}
                alt={item.alt}
                custom={dir}
                variants={{
                  enter: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, rotateY: d * 35, x: d * 60, scale: 0.94 }),
                  center: { opacity: 1, rotateY: 0, x: 0, scale: 1 },
                  exit: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, rotateY: d * -35, x: d * -60, scale: 0.94 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
              />
            </AnimatePresence>
            {items.length > 1 && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-3 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next photo" className="absolute right-3 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
          {(item.caption || item.text || item.link) && (
            <div className="mx-auto w-full max-w-3xl px-6 pb-6 text-center" onClick={(e) => e.stopPropagation()}>
              {item.caption && <p className="display text-xl text-white">{item.caption}</p>}
              {item.text && <p className="mt-2 max-h-28 overflow-y-auto text-sm leading-relaxed text-white/75">{item.text}</p>}
              {item.link && (
                <Link to={item.link.to} onClick={() => onChange(null)} className="btn-gold mt-4 !py-2.5">
                  {item.link.label} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
