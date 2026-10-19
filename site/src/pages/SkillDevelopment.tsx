import { useState } from 'react'
import { Lightbox } from '../components/Lightbox'
import { PageHero } from '../components/PageHero'
import { Reveal, SectionHeading } from '../components/Reveal'
import { off } from '../content/site'
import { pages } from '../lib/data'

const activities = ['Book Review', 'Workshop on Employability Skills & Resume Writing', 'Career Planning and Goal Setting', 'Classroom Activities', 'PowerPoint Presentations', 'Mock Interviews']

export default function SkillDevelopment() {
  const page = pages.skill
  const paras = page.blocks.filter((b) => b.t === 'p').map((b) => (b.t === 'p' ? b.text : ''))
  const imgs = Array.from({ length: 31 }, (_, i) => `/img/static/skill/sd${i + 1}.webp`)
  const [shown, setShown] = useState<number | null>(null)
  return (
    <>
      <PageHero eyebrow="Skill Development Centre · Est. 2011" title="Skill Development Centre (SDC)" text={paras[0]} crumbs={[{ label: 'Academics', to: '/academics' }]} image="/img/static/skill/sd3.webp" />
      <section className="bg-white py-16">
        <div className="container-x grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <Reveal className="prose-lbc">
            {paras.slice(1).map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Reveal>
          <Reveal className="grid content-start gap-5">
            <div className="rounded-3xl bg-navy p-7 text-white">
              <p className="text-xs font-extrabold text-gold">Analytical skills trainers</p>
              <ul className="mt-3 grid gap-1 text-sm">
                <li>Coordinator: Mr. D. Bhujangarao</li>
                <li>Mr. P. Suri Babu</li>
                <li>Mr. M. Jagadeesh</li>
              </ul>
            </div>
            <div className="rounded-3xl bg-gold-soft p-7 text-navy">
              <p className="text-xs font-extrabold">Soft skills trainers</p>
              <ul className="mt-3 grid gap-1 text-sm">
                <li>Coordinator: Ms. E. Teja Swetha</li>
                <li>Mr. K. Sasidhar</li>
                <li>Ms. Hilda Sharon</li>
                <li>Ms. Ch. Geeta</li>
                <li>Ms. G. Surya Yellamambaswarai</li>
                <li>Ms. K.N.V.L. Lavanya Kumari</li>
              </ul>
            </div>
            <a href={off('/lbc/skill_development')} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-royal">
              Official SDC page ↗
            </a>
          </Reveal>
        </div>
      </section>
      <section className="bg-mist py-16">
        <div className="container-x">
          <SectionHeading eyebrow="Activities" title="Training in action" />
          <div className="mt-6 flex flex-wrap gap-2">
            {activities.map((a) => (
              <span key={a} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-navy ring-1 ring-navy/10">
                {a}
              </span>
            ))}
          </div>
          <div className="mt-10 columns-2 gap-4 sm:columns-3 lg:columns-4">
            {imgs.map((src, i) => (
              <button key={src} type="button" onClick={() => setShown(i)} className="mb-4 block w-full overflow-hidden rounded-2xl">
                <img src={src} alt={`Skill Development Centre activity ${i + 1}`} className="w-full transition duration-700 hover:scale-105" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </section>
      <Lightbox items={imgs.map((src, i) => ({ src, alt: `Skill Development Centre activity ${i + 1}` }))} index={shown} onChange={setShown} />
    </>
  )
}
