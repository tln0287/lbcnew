import { Mail, Phone, ShieldAlert } from 'lucide-react'
import { ContentBlocks } from '../components/ContentBlocks'
import { DocList } from '../components/DocList'
import { PageHero } from '../components/PageHero'
import { Reveal, SectionHeading } from '../components/Reveal'
import { aicteDocs, aictePrograms, college } from '../content/site'
import { documents, pages } from '../lib/data'

export default function AICTE() {
  return (
    <>
      <PageHero eyebrow="PG College" title="AICTE, IIC & Grievances" text="AICTE approvals and mandatory disclosures, the Institution's Innovation Council, and student grievance support." crumbs={[{ label: 'PG College', to: '/pg-college' }]} image="/img/media/jrcollege/news/facilities4.webp" />
      <section className="bg-white py-16">
        <div className="container-x grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <SectionHeading eyebrow="AICTE" title="Approvals & disclosures" />
            <div className="mt-8">
              <DocList docs={aicteDocs.map((d) => ({ title: d.label, href: d.href }))} columns={1} />
            </div>
          </div>
          <Reveal className="rounded-3xl bg-navy p-8 text-white">
            <p className="text-xs font-extrabold text-gold">AICTE programmes · intake</p>
            <ul className="mt-5 grid gap-3">
              {aictePrograms.map(([n, v]) => (
                <li key={n} className="flex justify-between gap-4 border-b border-white/10 pb-3 font-bold">
                  {n} <span className="text-gold">{v}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
      <section className="bg-mist py-16">
        <div className="container-x">
          <SectionHeading eyebrow="Extension of Approval" title="EOA archive" />
          <div className="mt-8">
            <DocList docs={documents.eoa.map((d) => ({ title: d.label, href: d.href }))} columns={3} placeholder="Search by year" />
          </div>
        </div>
      </section>
      <section id="iic" className="scroll-mt-28 bg-white py-16">
        <div className="container-x max-w-4xl">
          <ContentBlocks blocks={pages.iic.blocks} />
        </div>
      </section>
      <section id="grievances" className="noise scroll-mt-28 bg-navy py-16 text-white">
        <div className="container-x grid gap-5 md:grid-cols-3">
          <a href={`mailto:${college.grievanceEmail}`} className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10 hover:bg-white/10">
            <Mail className="h-7 w-7 text-gold" aria-hidden="true" />
            <p className="mt-3 font-extrabold">Online grievances</p>
            <p className="text-sm text-white/70">{college.grievanceEmail}</p>
          </a>
          <a href={college.grievanceForm} target="_blank" rel="noopener noreferrer" className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10 hover:bg-white/10">
            <ShieldAlert className="h-7 w-7 text-gold" aria-hidden="true" />
            <p className="mt-3 font-extrabold">Students' Online Grievance Form ↗</p>
            <p className="text-sm text-white/70">Google Form published by the college</p>
          </a>
          <a href={`tel:${college.womenHelpline}`} className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10 hover:bg-white/10">
            <Phone className="h-7 w-7 text-gold" aria-hidden="true" />
            <p className="mt-3 font-extrabold">Women Helpline</p>
            <p className="text-sm text-white/70">{college.womenHelpline}</p>
          </a>
        </div>
      </section>
    </>
  )
}
