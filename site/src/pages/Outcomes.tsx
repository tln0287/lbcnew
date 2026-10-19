import { DocList } from '../components/DocList'
import { PageHero } from '../components/PageHero'
import { off } from '../content/site'
import { documents } from '../lib/data'

export default function Outcomes() {
  const docs = [
    ...documents.poscos.ug.map((d) => ({ title: d.label, href: d.href, group: 'Undergraduate programmes', meta: "UG PO's / CO's" })),
    ...documents.poscos.pg.map((d) => ({ title: d.label, href: d.href, group: 'Postgraduate programmes', meta: "PG PO's / CO's" })),
  ]
  return (
    <>
      <PageHero eyebrow="Academics" title="Programme & Course Outcomes" text="Programme outcomes (POs) and course outcomes (COs) for UG and PG programmes, as published by the college." crumbs={[{ label: 'Academics', to: '/academics' }]} />
      <section className="bg-mist py-16">
        <div className="container-x">
          <DocList docs={docs} placeholder="Search programmes" columns={3} />
          <a href={off('/ugcollege/poscos')} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-royal">
            View on the official site ↗
          </a>
        </div>
      </section>
    </>
  )
}
