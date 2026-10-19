import { ArrowUpRight, HeadphonesIcon, Mail, MapPin, Phone, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { Reveal } from '../components/Reveal'
import { college, off, social } from '../content/site'

export default function Contact() {
  return (
    <>
      <PageHero eyebrow="Get in touch" title="Contact & Support" text="Reach the college office, raise a support request, or submit a grievance." />
      <section className="bg-white py-16">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <Reveal className="grid content-start gap-5">
            <div className="card flex gap-5 p-7">
              <MapPin className="h-7 w-7 shrink-0 text-gold" aria-hidden="true" />
              <div>
                <p className="font-extrabold text-navy">Address</p>
                <address className="mt-1 leading-relaxed text-slate/75 not-italic">
                  {college.name}
                  <br />
                  {college.address.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </address>
                <a href={`https://www.google.com/maps/search/?api=1&query=${college.geo.lat},${college.geo.lng}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-royal">
                  Open in maps <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <a href={`tel:${college.phone.replace(/-/g, '')}`} className="card flex gap-4 p-6 hover:-translate-y-1">
                <Phone className="h-6 w-6 shrink-0 text-gold" aria-hidden="true" />
                <span>
                  <span className="block font-extrabold text-navy">Phone</span>
                  <span className="text-slate/70">{college.phone}</span>
                </span>
              </a>
              <a href={`mailto:${college.email}`} className="card flex gap-4 p-6 hover:-translate-y-1">
                <Mail className="h-6 w-6 shrink-0 text-gold" aria-hidden="true" />
                <span>
                  <span className="block font-extrabold text-navy">Email</span>
                  <span className="break-all text-slate/70">{college.email}</span>
                </span>
              </a>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <a href={off('/ugcollege/support')} target="_blank" rel="noopener noreferrer" className="flex gap-4 rounded-3xl bg-navy p-6 text-white hover:-translate-y-1">
                <HeadphonesIcon className="h-6 w-6 shrink-0 text-gold" aria-hidden="true" />
                <span>
                  <span className="block font-extrabold">Support request ↗</span>
                  <span className="text-sm text-white/70">Official support form (Degree College)</span>
                </span>
              </a>
              <a href={off('/pgcollege/support')} target="_blank" rel="noopener noreferrer" className="flex gap-4 rounded-3xl bg-navy p-6 text-white hover:-translate-y-1">
                <HeadphonesIcon className="h-6 w-6 shrink-0 text-gold" aria-hidden="true" />
                <span>
                  <span className="block font-extrabold">PG feedback ↗</span>
                  <span className="text-sm text-white/70">Official feedback form (PG College)</span>
                </span>
              </a>
            </div>
            <Link to="/aicte#grievances" className="flex gap-4 rounded-3xl bg-gold-soft p-6 text-navy hover:-translate-y-1">
              <ShieldAlert className="h-6 w-6 shrink-0" aria-hidden="true" />
              <span>
                <span className="block font-extrabold">Grievances</span>
                <span className="text-sm text-slate/70">
                  {college.grievanceEmail} · Women Helpline {college.womenHelpline}
                </span>
              </span>
            </Link>
            <div className="flex flex-wrap gap-2">
              {social.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="rounded-full bg-mist px-4 py-2 text-sm font-bold text-navy hover:bg-navy hover:text-white">
                  {s.label}
                </a>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1} className="overflow-hidden rounded-[2rem] shadow-2xl">
            <iframe
              title="Map showing Dr. Lankapalli Bullayya College"
              className="h-full min-h-[480px] w-full"
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${college.geo.lng - 0.008}%2C${college.geo.lat - 0.005}%2C${college.geo.lng + 0.008}%2C${college.geo.lat + 0.005}&layer=mapnik&marker=${college.geo.lat}%2C${college.geo.lng}`}
            />
          </Reveal>
        </div>
      </section>
    </>
  )
}
