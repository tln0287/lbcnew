import { DocList } from '../components/DocList'
import { PageHero } from '../components/PageHero'
import { Reveal } from '../components/Reveal'
import { college, rtiDocs } from '../content/site'

export default function RTI() {
  return (
    <>
      <PageHero eyebrow="Transparency" title="Right to Information" text="Disclosures made by the college under the Right to Information Act, 2005." />
      <section className="bg-mist py-16">
        <div className="container-x grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <DocList docs={rtiDocs.map((d) => ({ title: d.label, href: d.href, meta: 'Published on lbc.edu.in' }))} columns={1} />
          <Reveal className="card p-7">
            <p className="text-xs font-extrabold text-royal">College contact</p>
            <p className="mt-3 font-bold text-navy">
              <a href={`mailto:${college.email}`}>{college.email}</a>
            </p>
            <p className="font-bold text-navy">
              <a href={`tel:${college.phone.replace(/-/g, '')}`}>{college.phone}</a>
            </p>
            <address className="mt-3 text-sm text-slate/65 not-italic">{college.address.join(', ')}</address>
          </Reveal>
        </div>
      </section>
    </>
  )
}
