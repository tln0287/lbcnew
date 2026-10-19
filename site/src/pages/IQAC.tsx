import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ContentBlocks } from '../components/ContentBlocks'
import { DocList } from '../components/DocList'
import { PageHero } from '../components/PageHero'
import { Reveal, SectionHeading } from '../components/Reveal'
import { off } from '../content/site'
import { documents, pages } from '../lib/data'

const GROUP_NAMES: Record<string, string> = {
  AAR: 'AAR — Academic Audit Reports',
  ATR: 'ATR — Action Taken Reports',
  AQAR: 'AQAR — Annual Quality Assurance Reports',
  'Feed Back': 'Feedback',
}

export default function IQAC() {
  const [college, setCollege] = useState<'ug' | 'pg'>('ug')
  const text = pages.iqacUg.blocks.filter((b) => b.t !== 'table' && !/^(Name|Qualification|Co-ordinator)/.test(b.text))
  const docs = documents.iqac[college].flatMap((g) => g.docs.map((d) => ({ title: d.label, href: d.href, group: GROUP_NAMES[g.group] ?? g.group })))
  return (
    <>
      <PageHero eyebrow="Quality assurance" title="Internal Quality Assurance Cell (IQAC)" text="Fostering quality awareness and the enhancement of quality in content and delivery among campus functionaries." image="/img/media/jrcollege/news/library_3_block-4.webp" />
      <section className="bg-white py-16">
        <div className="container-x grid gap-12 lg:grid-cols-[320px_1fr]">
          <Reveal className="lg:sticky lg:top-28 lg:self-start min-[1360px]:top-36">
            <div className="overflow-hidden rounded-3xl bg-navy text-white">
              <img src="/img/media/aboutiqac/subbalaxmi.webp" alt="Mrs. V. Subbalakshmi, IQAC Co-ordinator" className="aspect-square w-full object-cover object-top" />
              <div className="p-6">
                <p className="text-xs font-extrabold text-gold">Co-ordinator (IQAC)</p>
                <p className="mt-1 text-xl font-extrabold">Mrs. V. Subbalakshmi</p>
                <p className="text-sm text-white/70">M.Sc., M.Phil.</p>
              </div>
            </div>
            <Link to="/committees/iqac" className="btn-outline mt-4 w-full">
              IQAC committee members <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <Reveal>
            <ContentBlocks blocks={text} />
          </Reveal>
        </div>
      </section>
      <section className="bg-mist py-16">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Reports & records" title="IQAC documents" />
            <div role="group" aria-label="College" className="inline-flex rounded-full bg-white p-1 ring-1 ring-navy/10">
              {(['ug', 'pg'] as const).map((k) => (
                <button key={k} type="button" aria-pressed={college === k} onClick={() => setCollege(k)} className={`rounded-full px-4 py-2 text-sm font-bold ${college === k ? 'bg-navy text-white' : 'text-navy'}`}>
                  {k === 'ug' ? 'Degree College' : 'PG College'}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-10">
            <DocList docs={docs} columns={3} placeholder="Search IQAC documents (e.g. AQAR 2021-22)" />
          </div>
          <a href={off(college === 'ug' ? '/ugcollege/iqac' : '/pgcollege/iqac')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-royal">
            Official IQAC page <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  )
}
