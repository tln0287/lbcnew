import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RiseText } from '../components/Effects'
import { Icon } from '../components/Icon'
import { activityPanels } from '../content/home'

/** Tall photo panels; the one under the pointer or focus expands (flex-grow 2.6). */
export function ActivitiesPanels() {
  const [active, setActive] = useState(0)
  return (
    <section className="section-y bg-white">
      <div className="container-x">
        <div className="max-w-2xl">
          <RiseText text="What happens beyond class?" className="h-section" />
          <p className="lede mt-5">Sports, scouting and guiding, NCC and NSS, and skills training run alongside the curriculum.</p>
        </div>

        <ul className="mt-14 flex flex-col gap-4 lg:h-[540px] lg:flex-row">
          {activityPanels.map((p, i) => {
            const open = active === i
            return (
              <li
                key={p.title}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="relative min-h-[380px] overflow-hidden rounded-[28px] bg-navy transition-[flex-grow] duration-700 ease-out-expo lg:min-h-0"
                style={{ flexGrow: open ? 2.6 : 1, flexBasis: 0 }}
              >
                {p.image ? (
                  <img src={p.image} alt={p.alt} className={`absolute inset-0 h-full w-full object-cover transition duration-1000 ${open ? 'scale-100' : 'scale-110'}`} loading="lazy" />
                ) : (
                  <div className="navy-flat absolute inset-0 grid place-items-center">
                    <div className="text-center text-white/60">
                      <Icon name={p.icon} className="mx-auto h-14 w-14 text-gold/70" />
                      <p className="mt-3 text-sm">Photographs to be added</p>
                    </div>
                  </div>
                )}
                <div className={`absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent transition-opacity duration-500 ${open ? 'opacity-100' : 'lg:opacity-80'}`} />
                <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-gold text-navy">
                    <Icon name={p.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="display mt-4 text-3xl !text-white">{p.title}</h3>
                  <div className={`grid transition-all duration-700 ease-out-expo ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[1fr] opacity-100 lg:grid-rows-[0fr] lg:opacity-0'}`}>
                    <div className="overflow-hidden">
                      <p className="mt-3 max-w-md leading-[1.6] text-white/85">{p.summary}</p>
                      <Link to={p.to} className="btn-gold mt-5 !py-2.5" tabIndex={open ? 0 : undefined}>
                        Find out more <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
