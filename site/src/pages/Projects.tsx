import { DocList } from '../components/DocList'
import { PageHero } from '../components/PageHero'
import { off } from '../content/site'
import { documents } from '../lib/data'
import { naac } from '../lib/naac'

export default function Projects() {
  const naacRows = (naac.ug.ssr['1'] ?? []).filter((r) => r.cells[0] === '1.3.2')
  const docs = [
    ...documents.projects.map((d) => ({ title: d.label, href: d.href, group: 'Projects & internship records' })),
    ...naacRows.map((r) => ({ title: r.cells[3], href: r.href, group: 'NAAC metric 1.3.2 — Internships & Projects', meta: r.cells[2], unavailable: r.unavailable })),
  ]
  return (
    <>
      <PageHero eyebrow="Academics" title="Projects & Internships" text="Project reports and internship certificates across programmes, preserved from the official website." crumbs={[{ label: 'Academics', to: '/academics' }]} image="/img/media/jrcollege/news/block-9_computer_lab.webp" />
      <section className="bg-mist py-16">
        <div className="container-x">
          <DocList docs={docs} placeholder="Search projects & internships" />
          <a href={off('/ugcollege/projects')} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-royal">
            View on the official site ↗
          </a>
        </div>
      </section>
    </>
  )
}
