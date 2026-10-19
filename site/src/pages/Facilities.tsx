import { useMemo, useState } from 'react'
import { Lightbox } from '../components/Lightbox'
import { PageHero } from '../components/PageHero'
import { Reveal, SectionHeading } from '../components/Reveal'
import { TiltCard } from '../components/TiltCard'
import { labCounts, pgFacilities, ugFacilities } from '../content/site'

export default function Facilities() {
  const items = useMemo(
    () => [
      ...ugFacilities.flatMap((f) => f.images.map((src, i) => ({ src, alt: `${f.name} — UG campus${f.images.length > 1 ? ` (${i + 1})` : ''}`, caption: `${f.name} · Degree College` }))),
      ...pgFacilities.map((f) => ({ src: f.image, alt: `${f.name} — PG campus`, caption: `${f.name} · PG College` })),
    ],
    [],
  )
  const [open, setOpen] = useState<number | null>(null)
  const indexOf = (src: string) => items.findIndex((i) => i.src === src)

  return (
    <>
      <PageHero
        eyebrow="Campus infrastructure"
        title="Our Facilities"
        text="Well-ventilated classrooms of 600 sq ft each, dedicated science and computer laboratories, libraries, seminar halls, sports grounds and student services."
        image="/img/media/jrcollege/news/library_3_block-5.webp"
      />

      <section className="bg-white py-20">
        <div className="container-x grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['56', 'UG classrooms'],
            ['16', 'UG laboratories'],
            ['31', 'PG classrooms'],
            ['17', 'PG laboratories'],
          ].map(([n, l], i) => (
            <Reveal key={l} delay={i * 0.06} className="rounded-3xl bg-mist p-7">
              <p className="text-5xl font-extrabold text-royal">{n}</p>
              <p className="mt-2 font-semibold text-slate/65">{l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-mist py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Degree College" title="Laboratories & library" text="Block 1 houses the science laboratories, with additional spaces in other blocks as needed." />
          <div className="mt-12 grid auto-rows-[240px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ugFacilities.map((f, i) => (
              <Reveal key={f.name} delay={(i % 4) * 0.06} className={i === 0 || i === 7 ? 'sm:col-span-2 sm:row-span-2' : ''}>
                <TiltCard className="h-full" max={5}>
                  <button type="button" onClick={() => setOpen(indexOf(f.images[0]))} className="group relative block h-full w-full overflow-hidden rounded-3xl text-left">
                    <img src={f.images[0]} alt={`${f.name} at the Degree College`} className="h-full w-full object-cover transition duration-[1.2s] group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy/10 to-transparent" />
                    <div className="absolute bottom-5 left-6">
                      <p className="text-xl font-extrabold text-white">{f.name}</p>
                      <p className="text-xs font-bold text-gold">
                        {f.images.length} photo{f.images.length > 1 ? 's' : ''} · View
                      </p>
                    </div>
                  </button>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container-x">
          <SectionHeading eyebrow="PG College" title="Campus services & spaces" text="Well-planned infrastructure includes well-stocked libraries, seminar halls, a large ground and playfields." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pgFacilities.map((f, i) => (
              <Reveal key={f.name} delay={(i % 4) * 0.06}>
                <button type="button" onClick={() => setOpen(indexOf(f.image))} className="group block w-full overflow-hidden rounded-3xl bg-mist text-left">
                  <div className="h-52 overflow-hidden">
                    <img src={f.image} alt={`${f.name} at the PG College`} className="h-full w-full object-cover transition duration-1000 group-hover:scale-110" loading="lazy" />
                  </div>
                  <p className="p-5 text-lg font-extrabold text-navy">{f.name}</p>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="noise bg-navy py-20 text-white">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          {(
            [
              ['UG – 16 laboratories', labCounts.ug],
              ['PG – 17 laboratories', labCounts.pg],
            ] as const
          ).map(([title, rows]) => (
            <Reveal key={title}>
              <h2 className="text-2xl">{title}</h2>
              <ul className="mt-6 grid gap-3">
                {rows.map(([name, n]) => (
                  <li key={name} className="flex items-center gap-4">
                    <span className="w-44 shrink-0 text-sm font-semibold text-white/80">{name}</span>
                    <span className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full rounded-full bg-gradient-to-r from-gold to-royal" style={{ width: `${(n / 5) * 100}%` }} />
                    </span>
                    <span className="w-6 text-right font-extrabold text-gold">{n}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      <Lightbox items={items} index={open} onChange={setOpen} />
    </>
  )
}
