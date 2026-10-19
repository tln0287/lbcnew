import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Lightbox } from '../components/Lightbox'
import { PageHero } from '../components/PageHero'
import { Reveal, SectionHeading } from '../components/Reveal'
import { achievers, galleryVideos, jubileeBanners, pgFacilities, ugFacilities } from '../content/site'

type Item = { src: string; alt: string; cat: string }

const items: Item[] = [
  ...jubileeBanners.map((b) => ({ src: b.image, alt: b.alt, cat: 'Golden Jubilee' })),
  ...achievers.map((b) => ({ src: b.image, alt: b.alt, cat: 'Achievements' })),
  { src: '/img/media/jrcollege/gallery/1521098234_15172259953.webp', alt: 'Eenadu Cricket Tournament Champions, AP & Telangana', cat: 'Sports' },
  { src: '/img/media/jrcolleg/news/6.webp', alt: 'AU Inter-College Weightlifting, Powerlifting and Best Physique Championship', cat: 'Sports' },
  { src: '/img/static/skill/b1.webp', alt: 'Bharat Scouts & Guides on the LBC ground', cat: 'Campus' },
  { src: '/img/static/skill/b3.webp', alt: 'Bharat Scouts & Guides unit', cat: 'Activities' },
  { src: '/img/static/skill/b4.webp', alt: 'Bharat Scouts & Guides unit', cat: 'Activities' },
  ...pgFacilities.map((f) => ({ src: f.image, alt: `${f.name}, PG College`, cat: 'Campus' })),
  ...ugFacilities.flatMap((f) => f.images.map((src) => ({ src, alt: `${f.name}, Degree College`, cat: 'Labs & Library' }))),
  ...[1, 2, 3, 6, 9, 13, 16, 20, 24, 28].map((n) => ({ src: `/img/static/skill/sd${n}.webp`, alt: `Skill Development Centre activity`, cat: 'Activities' })),
]

const CATS = ['All', 'Golden Jubilee', 'Campus', 'Labs & Library', 'Sports', 'Activities', 'Achievements']

export default function Gallery() {
  const [cat, setCat] = useState('All')
  const [shown, setShown] = useState<number | null>(null)
  const [video, setVideo] = useState<string | null>(null)
  const list = useMemo(() => (cat === 'All' ? items : items.filter((i) => i.cat === cat)), [cat])

  return (
    <>
      <PageHero eyebrow="Gallery" title="Our Gallery" text="Golden Jubilee celebrations, campus spaces, sports, activities and achievements." image="/img/media/jrcollege/slides/5_HzE7bx5.webp" />

      <section className="bg-white py-16">
        <div className="container-x">
          <SectionHeading eyebrow="Video" title="Golden Jubilee Celebrations" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {galleryVideos.jubilee.map((id, i) => (
              <Reveal key={id} delay={(i % 3) * 0.06} className="overflow-hidden rounded-3xl bg-navy shadow-xl">
                {video === id ? (
                  <iframe
                    className="aspect-video w-full"
                    src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
                    title={`Golden Jubilee Celebrations — video ${i + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <button type="button" onClick={() => setVideo(id)} className="group relative block aspect-video w-full" aria-label={`Play Golden Jubilee video ${i + 1}`}>
                    <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105" loading="lazy" />
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid h-16 w-16 place-items-center rounded-full bg-gold text-navy shadow-xl transition group-hover:scale-110">
                        <Play className="ml-1 h-6 w-6" />
                      </span>
                    </span>
                  </button>
                )}
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12">
            <h3 className="text-xl text-navy">UG Campus</h3>
            <video className="mt-5 aspect-video w-full rounded-3xl bg-navy shadow-xl" controls preload="none" poster="/img/static/skill/b1.webp">
              <source src={galleryVideos.campusVideo} type="video/mp4" />
              Your browser does not support the video tag. <a href={galleryVideos.campusVideo}>Download the campus video</a>.
            </video>
          </Reveal>
        </div>
      </section>

      <section className="bg-mist py-16">
        <div className="container-x">
          <SectionHeading eyebrow="Photos" title="Campus in pictures" />
          <div className="scrollbar-none -mx-4 mt-8 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Filter photos">
            {CATS.map((c) => (
              <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-bold ${cat === c ? 'text-white' : 'bg-white text-navy ring-1 ring-navy/10'}`}>
                {cat === c && <motion.span layoutId="gal-cat" className="absolute inset-0 rounded-full bg-navy" />}
                <span className="relative">{c}</span>
              </button>
            ))}
          </div>
          <motion.div layout className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {list.map((it, i) => (
              <motion.button
                layout
                key={it.src}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.4) }}
                onClick={() => setShown(i)}
                className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-3xl text-left"
              >
                <img src={it.src} alt={it.alt} className="w-full transition duration-700 group-hover:scale-105" loading="lazy" />
                <span className="absolute inset-0 flex items-end bg-gradient-to-t from-navy-900/80 via-transparent to-transparent p-5 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="text-sm font-bold text-white">{it.alt}</span>
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>
      <Lightbox items={list.map((i) => ({ src: i.src, alt: i.alt, caption: i.alt }))} index={shown} onChange={setShown} />
    </>
  )
}
