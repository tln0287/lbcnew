import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { heroSlides } from '../content/site'

const INTERVAL = 5000
const EASE = [0.16, 1, 0.3, 1] as const
const SHADOW = { textShadow: '0 2px 24px rgb(16 42 67 / 0.55)' }

export function HeroCarousel() {
  const reduce = !!useReducedMotion()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false) // user toggle
  const [hold, setHold] = useState(false) // hover / focus
  const touchX = useRef<number | null>(null)
  const slide = heroSlides[index]
  const playing = !paused && !hold && !reduce

  const go = useCallback((to: number) => setIndex((to + heroSlides.length) % heroSlides.length), [])
  const next = useCallback(() => go(index + 1), [go, index])
  const prev = useCallback(() => go(index - 1), [go, index])

  useEffect(() => {
    if (!playing) return
    const t = window.setTimeout(next, INTERVAL)
    return () => window.clearTimeout(t)
  }, [playing, next, index])

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Highlights of Dr. Lankapalli Bullayya College"
      className="relative h-[90svh] max-h-[1000px] min-h-[620px] overflow-hidden bg-navy text-white"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHold(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)()
        touchX.current = null
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') next()
        if (e.key === 'ArrowLeft') prev()
      }}
    >
      {/* Photos: 1s crossfade, slow zoom 1 → 1.06 */}
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${heroSlides.length}: ${slide.title}`}
        >
          <img
            src={slide.image}
            alt={slide.alt}
            className="h-full w-full object-cover"
            style={reduce ? undefined : { animation: `hero-zoom ${INTERVAL + 1500}ms ease-out forwards` }}
            fetchPriority={index === 0 ? 'high' : 'auto'}
          />
          {/* one band of warm light sweeping across */}
          {!reduce && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 w-1/3"
                style={{ background: 'linear-gradient(90deg, transparent, rgb(255 222 160 / 0.16), transparent)', animation: 'sweep 3.2s ease-in-out 0.6s both' }}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Light veils only */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy/55 via-navy/20 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy/65 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-navy/45 to-transparent" />

      {/* Copy */}
      <div className="container-x relative z-10 flex h-full flex-col justify-center pt-24 pb-36">
        <AnimatePresence mode="wait">
          <motion.div key={index} exit={{ opacity: 0, transition: { duration: 0.35 } }} className="max-w-4xl" aria-live={playing ? 'off' : 'polite'}>
            <motion.span
              aria-hidden="true"
              className="block h-[3px] w-20 origin-left rounded-full bg-gold"
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, ease: EASE }}
            />
            <p className="mt-5 text-base font-semibold text-gold-2" style={SHADOW}>
              {slide.eyebrow}
            </p>
            <motion.h1
              className="h-hero mt-3 !text-white"
              style={SHADOW}
              initial={reduce ? false : { clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: 1, delay: 0.25, ease: EASE }}
            >
              {slide.title}
            </motion.h1>
            <motion.p
              className="mt-6 max-w-xl text-lg leading-[1.65] text-white/95 sm:text-xl"
              style={SHADOW}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.95, ease: EASE }}
            >
              {slide.text}
            </motion.p>
            <motion.div
              className="mt-9 flex flex-wrap gap-3"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.13, ease: EASE }}
            >
              <Link to={slide.actions[0].to} className="btn-gold">
                {slide.actions[0].label} <ChevronRight className="h-4 w-4" />
              </Link>
              <Link to={slide.actions[1].to} className="btn-ghost backdrop-blur-sm">
                {slide.actions[1].label}
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="container-x flex items-end justify-between gap-6 pb-8">
          <div className="flex flex-1 gap-3" role="tablist" aria-label="Choose slide">
            {heroSlides.map((s, i) => (
              <button key={s.title} type="button" role="tab" aria-selected={i === index} aria-label={`Slide ${i + 1}: ${s.title}`} onClick={() => go(i)} className="group min-h-11 max-w-48 flex-1 text-left">
                <span className="block h-[3px] overflow-hidden rounded-full bg-white/25">
                  <span
                    key={`${index}-${i}`}
                    className="block h-full origin-left rounded-full bg-gold"
                    style={
                      i === index
                        ? reduce
                          ? { transform: 'scaleX(1)' }
                          : { animation: `progress ${INTERVAL}ms linear forwards`, animationPlayState: playing ? 'running' : 'paused' }
                        : { transform: i < index ? 'scaleX(1)' : 'scaleX(0)' }
                    }
                  />
                </span>
                <span className={`mt-2 hidden text-xs font-semibold transition sm:block ${i === index ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`} style={SHADOW}>
                  {s.eyebrow.split('·')[0].trim()}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPaused(!paused)} aria-label={paused || reduce ? 'Play slideshow' : 'Pause slideshow'} className="glass grid h-11 w-11 place-items-center rounded-full hover:bg-white/20">
              {paused || reduce ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <button type="button" onClick={prev} aria-label="Previous slide" className="glass grid h-11 w-11 place-items-center rounded-full hover:bg-white/20">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={next} aria-label="Next slide" className="grid h-11 w-11 place-items-center rounded-full bg-gold text-navy hover:bg-gold-2">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
