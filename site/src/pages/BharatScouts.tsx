import { ArrowUpRight } from 'lucide-react'
import { ContentBlocks } from '../components/ContentBlocks'
import { PageHero } from '../components/PageHero'
import { Reveal } from '../components/Reveal'
import { off } from '../content/site'
import { pages } from '../lib/data'

export default function BharatScouts() {
  const page = pages.bharat
  return (
    <>
      <PageHero eyebrow="Activities · Est. 2023" title="Bharat Scouts & Guides" text="Scouting / Guiding is an approved method of character building for good citizenship." image="/img/static/skill/b1.webp" crumbs={[{ label: 'Activities', to: '/activities' }]} />
      <section className="bg-white py-16">
        <div className="container-x grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <ContentBlocks blocks={page.blocks.slice(1)} skip={[/^ACTIVITIES$/]} />
            <a href={off('/ugcollege/bharat')} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-royal">
              Official page <ArrowUpRight className="h-4 w-4" />
            </a>
          </Reveal>
          <div className="grid content-start gap-4">
            {page.images.map((src, i) => (
              <Reveal key={src} delay={i * 0.08}>
                <img src={src} alt={`Bharat Scouts & Guides activity at LBC ${i + 1}`} className="w-full rounded-3xl shadow-xl" loading="lazy" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
