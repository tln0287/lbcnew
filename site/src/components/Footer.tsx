import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { college, off, PAYMENT_URL, social, type NavLink } from '../content/site'
import { SmartLink } from './SmartLink'

const columns: { title: string; links: NavLink[] }[] = [
  {
    title: 'About LBC',
    links: [
      { label: 'Profile', to: '/profile' },
      { label: 'Faculty', to: '/faculty' },
      { label: 'Facilities', to: '/facilities' },
      { label: 'Departments', to: '/departments' },
      { label: 'Leadership', to: '/leadership/1' },
    ],
  },
  {
    title: 'Academics',
    links: [
      { label: 'Courses', to: '/courses' },
      { label: 'Academics', to: '/academics' },
      { label: 'UG College', to: '/courses#ug' },
      { label: 'PG College', to: '/pg-college' },
      { label: "PO's and CO's", to: '/academics/outcomes' },
    ],
  },
  {
    title: 'Quality and governance',
    links: [
      { label: 'Committees', to: '/committees' },
      { label: 'IQAC', to: '/iqac' },
      { label: 'NAAC', to: '/naac' },
      { label: 'NIRF', to: '/nirf' },
      { label: 'RTI', to: '/rti' },
    ],
  },
  {
    title: 'Campus life',
    links: [
      { label: 'Gallery', to: '/gallery' },
      { label: 'Activities', to: '/activities' },
      { label: 'Newsletters', to: '/newsletters' },
      { label: 'Campus Glimpses', to: '/campus-glimpses' },
      { label: 'Placements', to: '/placements' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Online Payment', href: PAYMENT_URL },
      { label: 'Login', href: off('/ugcollege/login') },
      { label: 'Support', href: off('/ugcollege/support') },
      { label: 'Alumni', href: off('/ugcollege/alumni') },
      { label: 'BGV', to: '/bgv' },
    ],
  },
]

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative overflow-hidden bg-navy text-white">
      <div className="container-x relative pt-20 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <img src="/brand/logo-light.png" alt="Dr. Lankapalli Bullayya College" width={520} height={72} className="h-11 w-auto" />
            <ul className="mt-8 grid gap-3 text-[15px] text-white/80">
              <li className="flex gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <address className="not-italic">{college.address.join(', ')}</address>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <a href={`tel:${college.phone.replace(/-/g, '')}`} className="hover:text-gold-2">
                  {college.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <a href={`mailto:${college.email}`} className="hover:text-gold-2">
                  {college.email}
                </a>
              </li>
            </ul>
            <ul className="mt-7 flex flex-wrap gap-2" aria-label="Social media">
              {social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 text-sm text-white/80 transition hover:border-gold hover:text-gold-2">
                    {s.label}
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {columns.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <p className="font-semibold text-gold-2">{c.title}</p>
                <ul className="mt-4 grid gap-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <SmartLink to={l.to} href={l.href} className="text-[15px] text-white/75 transition hover:text-white">
                        {l.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <p className="mt-14 max-w-3xl text-sm leading-relaxed text-white/65">
          {college.sponsor}. Affiliated to Andhra University and accredited by NAAC; MBA and MCA programmes approved by AICTE, New Delhi. Degree College recognised by APSCHE.
        </p>
        <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Dr. Lankapalli Bullayya College, Visakhapatnam.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a href="https://lbc.edu.in/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-gold-2">
              lbc.edu.in <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a href="https://nlist.inflibnet.ac.in/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-gold-2">
              N-LIST <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <Link to="/sitemap" className="hover:text-gold-2">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
