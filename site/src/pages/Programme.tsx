import { ArrowUpRight, FileText, Users } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ContentBlocks } from '../components/ContentBlocks'
import { DocLink } from '../components/DocList'
import { Lightbox } from '../components/Lightbox'
import { PageHero } from '../components/PageHero'
import { Reveal } from '../components/Reveal'
import { aictePrograms } from '../content/site'
import { documents, facts, faculty, initials, pgProgrammes, ugProgrammes, type Programme as P } from '../lib/data'
import NotFound from './NotFound'

const UG_META: Record<string, { title: string; faculty: string; outcomes: string[]; image: string }> = {
  ba: { title: 'B.A. (Honours) — Social Science', faculty: 'B.A.', outcomes: ['Social Sciences'], image: '/img/media/jrcollege/news/psycology_lab_block-4.webp' },
  bcom: { title: 'B.Com. (Honours)', faculty: 'B.Com.', outcomes: ['B.Com'], image: '/img/media/jrcollege/news/library_3_block-5.webp' },
  bsc: {
    title: 'B.Sc. (Honours)',
    faculty: 'B.Sc.',
    outcomes: ['Biotechnology', 'Chemistry', 'Computer Science', 'Data Science', 'Mathematics', 'Microbiology', 'Physics', 'Botany', 'Zoology'],
    image: '/img/media/jrcollege/news/chemistry_lab-2-block-1.webp',
  },
  bba: { title: 'BBA (Honours)', faculty: 'BBA', outcomes: ['BBA'], image: '/img/media/jrcollege/news/block-9_computer_lab-2.webp' },
  bca: { title: 'Bachelor of Computer Applications (BCA)', faculty: 'BCA', outcomes: [], image: '/img/media/jrcollege/news/block-9_computer_lab.webp' },
  'library-science': { title: 'Undergraduate Library', faculty: 'Library Science', outcomes: [], image: '/img/media/jrcollege/news/labrary1_block-4.webp' },
}

const PG_OUTCOMES: Record<string, string[]> = {
  biochemistry: ['Bio chemistry'],
  biotechnology: ['Bio technology'],
  chemistry: ['Organic Chemistry', 'Analytical Chemistry'],
  'm-com': ['M.Com'],
  'computer-science': ['M.Sc Computer Science'],
  mathematics: ['Mathematics'],
  mba: ['MBA'],
  mca: ['MCA'],
  'human-resource-management': ['MHRM'],
  microbiology: ['Microbiology'],
  english: ['English'],
}

export default function Programme() {
  const { level, slug } = useParams()
  const [shown, setShown] = useState<number | null>(null)
  const isUG = level === 'ug'
  const prog: P | undefined = (isUG ? ugProgrammes : level === 'pg' ? pgProgrammes : []).find((p) => p.slug === slug)
  if (!prog || !slug) return <NotFound />

  const meta = isUG ? UG_META[slug] : undefined
  const title = meta?.title ?? prog.name ?? prog.title
  const f = facts(prog.blocks)
  const outcomeLabels = isUG ? (meta?.outcomes ?? []) : (PG_OUTCOMES[slug] ?? [])
  const outcomeDocs = (isUG ? documents.poscos.ug : documents.poscos.pg).filter((d) => outcomeLabels.includes(d.label))
  const people = faculty.filter((p) => (isUG ? p.college === 'UG' && p.programme === meta?.faculty : p.college === 'PG' && p.programme === prog.name))
  const hasContent = prog.blocks.length > 1
  const aicte = slug === 'bca' ? aictePrograms.find(([n]) => n.includes('Computer Applications') && n.startsWith('Bachelor')) : undefined

  return (
    <>
      <PageHero
        eyebrow={isUG ? 'Degree College · Undergraduate' : 'PG College · Postgraduate'}
        title={title}
        image={meta?.image ?? prog.images[0] ?? '/img/media/jrcollege/news/facilities1.webp'}
        crumbs={[{ label: 'Courses', to: '/courses' }]}
      >
        {f.length > 0 && (
          <dl className="mt-8 flex flex-wrap gap-3">
            {f.slice(0, 5).map((x) => (
              <div key={x.key} className="glass rounded-2xl px-4 py-3">
                <dt className="text-[10px] font-bold text-gold">{x.key}</dt>
                <dd className="text-sm font-bold">{x.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </PageHero>

      <section className="bg-white py-16 sm:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_340px]">
          <article>
            {hasContent ? (
              <ContentBlocks blocks={prog.blocks} skip={f.map((x) => new RegExp(`^${x.key.replace(/[()]/g, '\\$&')}:`))} />
            ) : (
              <div className="rounded-3xl bg-mist p-8">
                <h2 className="text-2xl text-navy">Programme details</h2>
                <p className="mt-3 leading-relaxed text-slate/70">
                  The official {title} page does not yet publish a programme description.
                  {aicte && ` The programme is listed among the college's AICTE programmes with an intake of ${aicte[1]}.`} Faculty for this programme are listed below.
                </p>
              </div>
            )}
            {prog.images.length > 0 && (
              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {prog.images.map((src, i) => (
                  <button key={src} type="button" onClick={() => setShown(i)} className="overflow-hidden rounded-2xl">
                    <img src={src} alt={`${title} — photo ${i + 1}`} className="aspect-[4/3] w-full object-cover transition duration-700 hover:scale-105" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </article>

          <aside className="grid content-start gap-6 lg:sticky lg:top-28 lg:self-start min-[1360px]:top-36">
            <a href={prog.official} target="_blank" rel="noopener noreferrer" className="btn-navy">
              Official department page <ArrowUpRight className="h-4 w-4" />
            </a>
            {outcomeDocs.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-extrabold text-royal">Programme & course outcomes</p>
                <div className="grid gap-2">
                  {outcomeDocs.map((d) => (
                    <DocLink key={d.href} doc={{ title: d.label, href: d.href, meta: "PO's / CO's" }} />
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-3xl bg-gold-soft p-6">
              <FileText className="h-6 w-6 text-navy" aria-hidden="true" />
              <p className="mt-2 font-extrabold text-navy">Curriculum & regulations</p>
              <p className="mt-1 text-sm text-slate/70">Courses follow the semester pattern and syllabus of Andhra University, which conducts semester-end examinations and issues degrees.</p>
              <Link to="/academics" className="mt-3 inline-block text-sm font-bold text-royal">
                Academic resources →
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {people.length > 0 && (
        <section className="bg-mist py-16">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="flex items-center gap-3 text-3xl text-navy">
                <Users className="h-8 w-8 text-gold" aria-hidden="true" /> Faculty
              </h2>
              <Link to={isUG ? `/faculty?programme=${encodeURIComponent(meta?.faculty ?? '')}` : `/faculty?college=PG&programme=${encodeURIComponent(prog.name ?? '')}`} className="btn-outline">
                Open in directory
              </Link>
            </div>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {people.map((p, i) => (
                <Reveal key={p.name + i} delay={(i % 3) * 0.04}>
                  <li className="flex items-center gap-4 rounded-2xl bg-white p-4">
                    {p.photo ? (
                      <img src={p.photo} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover object-top" loading="lazy" />
                    ) : (
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-navy font-extrabold text-gold" aria-hidden="true">
                        {initials(p.name)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-extrabold text-navy">{p.name}</p>
                      <p className="text-sm text-royal">{p.designation}</p>
                      <p className="truncate text-xs text-slate/55">{p.qualification}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}
      <Lightbox items={prog.images.map((src) => ({ src, alt: title }))} index={shown} onChange={setShown} />
    </>
  )
}
