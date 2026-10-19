import { ArrowUpRight, Building2, GraduationCap, Mail, Phone, School } from 'lucide-react'
import { PageHero } from '../components/PageHero'
import { Reveal } from '../components/Reveal'
import { college, off } from '../content/site'

export default function BGV() {
  const steps = [
    {
      icon: Mail,
      title: 'Confirm a candidate who studied at LBC',
      text: 'To confirm from the college (Undergraduate College, Engineering College, Post Graduate College, Junior College) about the genuineness of a candidate who studied here, email the request.',
      action: { label: college.bgvEmail, href: `mailto:${college.bgvEmail}` },
    },
    {
      icon: GraduationCap,
      title: 'Verify a UG, Engineering or PG degree certificate',
      text: 'Use the Andhra University portal — Andhra University is the issuing authority of the original degree certificates.',
      action: { label: 'services.andhrauniversity.edu.in', href: 'https://services.andhrauniversity.edu.in' },
    },
    {
      icon: School,
      title: 'Verify an Intermediate certificate',
      text: 'Request verification from the “Regional Inspection Officer, Board of Intermediate Education, Visakhapatnam, Andhra Pradesh.”',
    },
  ]
  return (
    <>
      <PageHero eyebrow="Services" title="Background Verification" text="Process for organisations and verification agencies requesting background verification of a candidate who studied in any of the campus colleges of Dr. Lankapalli Bullayya College." />
      <section className="bg-mist py-16">
        <div className="container-x grid gap-6 lg:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08} className="card relative flex flex-col p-8">
              <span className="absolute top-6 right-6 text-5xl font-extrabold text-navy/[0.06]">0{i + 1}</span>
              <s.icon className="h-9 w-9 text-gold" aria-hidden="true" />
              <h2 className="mt-5 text-xl text-navy">{s.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate/70">{s.text}</p>
              {s.action && (
                <a href={s.action.href} {...(s.action.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="mt-auto inline-flex items-center gap-1 pt-6 font-bold break-all text-royal">
                  {s.action.label} <ArrowUpRight className="h-4 w-4 shrink-0" />
                </a>
              )}
            </Reveal>
          ))}
        </div>
        <div className="container-x mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-navy p-8 text-white">
          <p className="flex items-center gap-3 font-bold">
            <Phone className="h-5 w-5 text-gold" aria-hidden="true" /> Further queries:{' '}
            <a href={`tel:${college.bgvPhone}`} className="text-gold">
              {college.bgvPhone}
            </a>
          </p>
          <a href={off('/ugcollege/bgv')} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            <Building2 className="h-4 w-4" aria-hidden="true" /> Official BGV page
          </a>
        </div>
      </section>
    </>
  )
}
