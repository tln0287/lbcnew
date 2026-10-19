import { useReducedMotion } from 'framer-motion'
import { Fragment, useState } from 'react'
import { ribbonFacts } from '../content/home'

function Star() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true">
      <path fill="currentColor" d="M8 0c.6 4.6 2.8 6.9 8 8-5.2 1.1-7.4 3.4-8 8-.6-4.6-2.8-6.9-8-8 5.2-1.1 7.4-3.4 8-8Z" />
    </svg>
  )
}

/** Navy band of short verifiable facts, scrolling slowly (60s per loop); pauses on hover. */
export function Ribbon() {
  const reduce = useReducedMotion()
  const [hover, setHover] = useState(false)
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={hidden || undefined}>
      {ribbonFacts.map((f) => (
        <Fragment key={f}>
          <span className="display text-xl whitespace-nowrap text-white sm:text-2xl">{f}</span>
          <Star />
        </Fragment>
      ))}
    </div>
  )
  return (
    <section aria-label="LBC at a glance" className="navy-flat overflow-hidden py-6" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {reduce ? (
        <div className="container-x flex flex-wrap items-center justify-center gap-x-6 gap-y-2">{row(false)}</div>
      ) : (
        <div className="fade-x">
          <div className="flex w-max" style={{ animation: 'marquee 60s linear infinite', animationPlayState: hover ? 'paused' : 'running' }}>
            {row(false)}
            {row(true)}
          </div>
        </div>
      )}
    </section>
  )
}
