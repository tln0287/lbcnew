import { useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { RiseText, Spotlight } from '../components/Effects'
import { Fade } from '../components/Motion'
import { alumniJoinUrl, alumniProgrammes, alumniSteps, FOUNDED } from '../content/home'

const years = Array.from({ length: new Date().getFullYear() - FOUNDED + 1 }, (_, i) => FOUNDED + i)

function Column({ list, duration, reverse }: { list: number[]; duration: number; reverse?: boolean }) {
  const reduce = useReducedMotion()
  return (
    <div className="h-full overflow-hidden">
      <div style={reduce ? undefined : { animation: `marquee-y ${duration}s linear infinite`, animationDirection: reverse ? 'reverse' : 'normal' }}>
        {[...list, ...list].map((y, i) => (
          <p key={i} className="display py-2 text-center text-3xl text-white/30" aria-hidden="true">
            {y}
          </p>
        ))}
      </div>
    </div>
  )
}

export function Alumni() {
  const thirds = [0, 1, 2].map((k) => years.filter((_, i) => i % 3 === k))
  return (
    <section className="section-y bg-mist">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <div>
          <RiseText text="Once a student, always part of LBC" className="h-section" />
          <p className="lede mt-5">Former students of the Degree and PG colleges can register with the Alumni Association through the college's alumni form and stay connected with LBC.</p>
          <ul className="mt-7 flex flex-wrap gap-2" aria-label="Programmes">
            {alumniProgrammes.map((p) => (
              <li key={p} className="rounded-full border border-navy/12 bg-white px-3.5 py-1.5 text-sm text-navy">
                {p}
              </li>
            ))}
          </ul>
          <a href={alumniJoinUrl} target="_blank" rel="noopener noreferrer" className="btn-gold mt-9">
            Join the Alumni Association <ArrowUpRight className="h-4 w-4" />
            <span className="sr-only">(opens the official form in a new tab)</span>
          </a>
        </div>

        <Spotlight as="div" className="navy-flat raised h-[440px] overflow-hidden rounded-[28px]" aria-label={`Joining years from ${FOUNDED} to ${years[years.length - 1]}`}>
          <div className="relative grid h-full grid-cols-3 gap-2 px-4 [mask-image:linear-gradient(180deg,transparent,#000_18%,#000_82%,transparent)]">
            <Column list={thirds[0]} duration={70} />
            <Column list={thirds[1]} duration={90} reverse />
            <Column list={thirds[2]} duration={80} />
          </div>
          <div className="absolute inset-x-0 top-1/2 flex h-16 -translate-y-1/2 items-center justify-center border-y border-gold/60 bg-gold/15 backdrop-blur-[2px]">
            <p className="display text-2xl text-gold-2">Your year</p>
          </div>
        </Spotlight>
      </div>

      <div className="container-x mt-16">
        <ol className="relative grid gap-6 md:grid-cols-3">
          <span aria-hidden="true" className="absolute top-9 right-[16%] left-[16%] hidden h-px bg-gold md:block" />
          {alumniSteps.map((s, i) => (
            <li key={s.title} className="card relative h-full p-7">
              <Fade delay={i * 0.1}>
                <span className="display relative grid h-12 w-12 place-items-center rounded-full bg-navy text-xl text-gold-2">{i + 1}</span>
                <h3 className="display mt-5 text-2xl">{s.title}</h3>
                <p className="mt-2 leading-[1.6] text-slate">{s.text}</p>
              </Fade>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
