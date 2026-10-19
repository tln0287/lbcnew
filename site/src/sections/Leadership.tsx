import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RiseText } from '../components/Effects'
import { Fade } from '../components/Motion'
import { TiltCard } from '../components/TiltCard'
import { leadership } from '../content/site'

export function Leadership() {
  const principal = leadership[0]
  return (
    <section className="section-y bg-white">
      <div className="container-x">
        <RiseText text="Who leads the college?" className="h-section" />
        <div className="mt-12 grid gap-14 lg:grid-cols-[1.5fr_1fr]">
          <ul className="grid gap-6 sm:grid-cols-3">
            {leadership.map((l, i) => (
              <li key={i}>
                <Fade delay={i * 0.1}>
                  <Link to={`/leadership/${i + 1}`} className="group block">
                    <TiltCard className="overflow-hidden rounded-[24px]">
                      <div className="raised aspect-[4/5] overflow-hidden rounded-[24px]">
                        <img src={l.image} alt={`${l.role}${l.name ? `, ${l.name}` : ''}`} className="h-full w-full scale-[1.32] object-cover" loading="lazy" />
                      </div>
                    </TiltCard>
                    <p className="display mt-4 text-xl text-navy group-hover:text-royal">{l.name ?? l.role}</p>
                    <p className="text-sm text-slate">{l.name ? l.role : 'Message to students'}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-royal">
                      Read the message <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Fade>
              </li>
            ))}
          </ul>
          <Fade delay={0.2} className="flex flex-col justify-center">
            <span className="display block text-7xl leading-none text-gold" aria-hidden="true">
              “
            </span>
            <blockquote>
              <p className="display -mt-6 text-2xl leading-snug text-navy italic sm:text-3xl">{principal.message[2]}</p>
              <footer className="mt-4 text-sm text-slate">
                {principal.name}, {principal.role}
              </footer>
            </blockquote>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/leadership/1" className="btn-navy">
                Read the Principal's message
              </Link>
              <Link to="/faculty" className="btn-outline">
                Meet the faculty
              </Link>
            </div>
          </Fade>
        </div>
      </div>
    </section>
  )
}
