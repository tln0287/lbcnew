import { FileText } from 'lucide-react'
import { PageHero } from '../components/PageHero'
import { Reveal } from '../components/Reveal'
import { nirfReports } from '../content/site'

export default function NIRF() {
  return (
    <>
      <PageHero eyebrow="Rankings & data" title="NIRF" text="Data submitted by the college to the National Institutional Ranking Framework (NIRF), year by year." />
      <section className="bg-mist py-16">
        <div className="container-x">
          <ol className="relative grid gap-5 border-l-2 border-gold/50 pl-8 sm:grid-cols-2 sm:border-l-0 sm:pl-0 lg:grid-cols-3">
            {nirfReports.map((r, i) => (
              <Reveal key={r.href} delay={i * 0.06}>
                <li>
                  <a href={r.href} target="_blank" rel="noopener noreferrer" className="group card relative flex items-center gap-5 overflow-hidden p-7 transition hover:-translate-y-1">
                    <span className="absolute -right-3 -bottom-6 text-8xl font-extrabold text-navy/[0.05]">{r.label.slice(-4)}</span>
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-navy text-gold transition group-hover:bg-royal">
                      <FileText className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-2xl font-extrabold text-navy">{r.label}</span>
                      <span className="text-sm font-semibold text-royal">Open PDF ↗</span>
                    </span>
                  </a>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}
