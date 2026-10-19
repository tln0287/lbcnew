import { ArrowRight, ArrowUpRight, CreditCard, LogIn } from 'lucide-react'
import { RiseText } from '../components/Effects'
import { Fade } from '../components/Motion'
import { SmartLink } from '../components/SmartLink'
import { off, PAYMENT_URL } from '../content/site'

const useful = [
  { label: 'NAAC documents', to: '/naac' },
  { label: 'NIRF reports', to: '/nirf' },
  { label: 'IQAC', to: '/iqac' },
  { label: 'Committees', to: '/committees' },
  { label: 'Placements', to: '/placements' },
  { label: 'Background verification', to: '/bgv' },
  { label: 'Support request', href: off('/ugcollege/support') },
  { label: 'PG application form (.docx)', href: off('/static/PG-Admission-Application.docx') },
  { label: 'N-LIST e-resources', href: 'https://nlist.inflibnet.ac.in/' },
  { label: 'RTI', to: '/rti' },
]

export function QuickLinks() {
  return (
    <section className="section-y bg-mist">
      <div className="container-x">
        <RiseText text="Pay, sign in or find a form" className="h-section" />
        <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:grid-rows-[auto_1fr]">
          <Fade className="lg:row-span-2">
            <div className="navy-drift raised flex h-full flex-col rounded-[28px] p-8 text-white">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold text-navy">
                <CreditCard className="h-7 w-7" aria-hidden="true" />
              </span>
              <h3 className="display mt-6 text-3xl !text-white">Online payment</h3>
              <p className="mt-3 leading-[1.6] text-white/80">
                Payments go through the CCAvenue page of The Society for Collegiate Education. Card or bank details are entered there, on CCAvenue's secure page, never on this website.
              </p>
              <a href={PAYMENT_URL} target="_blank" rel="noopener noreferrer" className="btn-gold mt-auto self-start">
                Go to the payment page <ArrowUpRight className="h-4 w-4" />
                <span className="sr-only">(opens in new tab)</span>
              </a>
            </div>
          </Fade>
          <Fade className="lg:col-span-2" delay={0.08}>
            <a href={off('/ugcollege/login')} target="_blank" rel="noopener noreferrer" className="card group flex flex-wrap items-center gap-6 p-8 hover:border-navy/25">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-navy text-gold">
                <LogIn className="h-7 w-7" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="display block text-3xl text-navy">Login</span>
                <span className="mt-1 block text-slate">Sign in on the official college portal at lbc.edu.in.</span>
              </span>
              <span className="btn-outline">
                Sign in <ArrowUpRight className="h-4 w-4" />
              </span>
              <span className="sr-only">(opens in new tab)</span>
            </a>
          </Fade>
          <Fade className="card p-6 lg:col-span-2" delay={0.16}>
            <ul className="grid sm:grid-cols-2">
              {useful.map((l) => (
                <li key={l.label}>
                  <SmartLink to={l.to} href={l.href} className="group flex min-h-12 items-center justify-between gap-3 rounded-2xl px-3 font-semibold text-navy hover:bg-mist">
                    {l.label}
                    {l.href ? <ArrowUpRight className="h-4 w-4 text-gold" aria-hidden="true" /> : <ArrowRight className="h-4 w-4 text-gold transition group-hover:translate-x-1" aria-hidden="true" />}
                    {l.href && <span className="sr-only">(opens in new tab)</span>}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </Fade>
        </div>
      </div>
    </section>
  )
}
