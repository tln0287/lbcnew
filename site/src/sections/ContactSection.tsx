import { ArrowUpRight, HeadphonesIcon, Mail, MapPin, Navigation, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RiseText } from '../components/Effects'
import { Fade } from '../components/Motion'
import { college, off } from '../content/site'

export function ContactSection() {
  const { lat, lng } = college.geo
  return (
    <section className="section-y bg-white">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <RiseText text="How do I reach the college?" className="h-section" />
          <ul className="mt-10 grid gap-6">
            <li className="flex gap-4">
              <MapPin className="mt-1 h-6 w-6 shrink-0 text-gold" aria-hidden="true" />
              <address className="leading-[1.65] text-navy not-italic">
                {college.name}
                <br />
                {college.address.join(', ')}
              </address>
            </li>
            <li className="flex items-center gap-4">
              <Phone className="h-6 w-6 shrink-0 text-gold" aria-hidden="true" />
              <a href={`tel:${college.phone.replace(/-/g, '')}`} className="font-semibold text-navy hover:text-royal">
                {college.phone}
              </a>
            </li>
            <li className="flex items-center gap-4">
              <Mail className="h-6 w-6 shrink-0 text-gold" aria-hidden="true" />
              <a href={`mailto:${college.email}`} className="font-semibold text-navy hover:text-royal">
                {college.email}
              </a>
            </li>
          </ul>
          <Fade className="card mt-10 bg-mist p-7">
            <p className="display flex items-center gap-2 text-2xl text-navy">
              <HeadphonesIcon className="h-6 w-6 text-gold" aria-hidden="true" /> Need help?
            </p>
            <ul className="mt-4 grid gap-1 text-[15px]">
              <li>
                <a href={off('/ugcollege/support')} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 font-semibold text-royal">
                  Raise a support request <ArrowUpRight className="h-4 w-4" />
                </a>
              </li>
              <li>
                <a href={`mailto:${college.grievanceEmail}`} className="inline-flex min-h-11 items-center font-semibold text-royal">
                  Grievances: {college.grievanceEmail}
                </a>
              </li>
              <li>
                <a href={`tel:${college.womenHelpline}`} className="inline-flex min-h-11 items-center font-semibold text-royal">
                  Women Helpline: {college.womenHelpline}
                </a>
              </li>
              <li>
                <Link to="/contact" className="inline-flex min-h-11 items-center font-semibold text-royal">
                  All contact options →
                </Link>
              </li>
            </ul>
          </Fade>
        </div>
        <Fade delay={0.1} className="relative overflow-hidden rounded-[28px] raised">
          <iframe
            title="Map showing Dr. Lankapalli Bullayya College"
            className="h-full min-h-[460px] w-full"
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.005}%2C${lng + 0.008}%2C${lat + 0.005}&layer=mapnik&marker=${lat}%2C${lng}`}
          />
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} target="_blank" rel="noopener noreferrer" className="btn-gold absolute right-5 bottom-5">
            <Navigation className="h-4 w-4" aria-hidden="true" /> Get directions
            <span className="sr-only">(opens in new tab)</span>
          </a>
        </Fade>
      </div>
    </section>
  )
}
