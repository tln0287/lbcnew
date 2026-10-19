import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { newsletters } from '../lib/newsletters'
import { PageHero } from '../components/PageHero'
import { pgFacilities, ugFacilities } from '../content/site'
import { documents } from '../lib/data'

const covers = [
  '/img/static/skill/b1.webp',
  pgFacilities[0].image,
  ugFacilities[7].images[1],
  pgFacilities[1].image,
  '/img/static/skill/sd2.webp',
  ugFacilities[2].images[0],
  pgFacilities[3].image,
  '/img/static/skill/b3.webp',
  ugFacilities[4].images[0],
  '/img/static/skill/sd11.webp',
  pgFacilities[2].image,
  ugFacilities[0].images[0],
  '/img/static/skill/sd16.webp',
  '/img/media/jrcollege/slides/7_FAWu3ob.webp',
]

function Card({ g, i }: { g: { label: string; href: string }; i: number }) {
  const issue = newsletters.find((n) => n.pdf === g.href)
  const [month, year] = g.label.includes(' ') && /\d{4}$/.test(g.label) ? [g.label.replace(/\s\d{4}$/, ''), g.label.slice(-4)] : [g.label, '']
  return (
    <Link to={`/newsletters/${issue?.slug ?? ''}`} className="group relative block h-[62vh] max-h-[560px] min-h-[380px] w-[78vw] max-w-[420px] shrink-0 overflow-hidden rounded-[2rem] bg-navy shadow-2xl">
      <img src={issue ? `/newsletters/${issue.slug}/p001.webp` : covers[i % covers.length]} alt="" className="absolute inset-0 h-full w-full object-cover object-top opacity-80 transition duration-[1.5s] group-hover:scale-105 group-hover:opacity-100" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/30 to-transparent" />
      <span className="absolute top-6 left-6 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur">Issue {String(documents.campusGlimpses.length - i).padStart(2, '0')}</span>
      <div className="absolute inset-x-0 bottom-0 p-8 text-white">
        {year && <p className="text-sm font-extrabold text-gold">{year}</p>}
        <p className="mt-1 text-4xl leading-none font-extrabold">{month}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-white/80 group-hover:text-gold">
          Read this issue{issue ? ` · ${issue.pages} pages` : ''} <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

export default function CampusGlimpses() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref })
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-78%'])
  const list = documents.campusGlimpses

  return (
    <>
      <PageHero eyebrow="Monthly round-ups" title="Campus Glimpses" text="A month-by-month visual record of life at Dr. Lankapalli Bullayya College, published as downloadable issues." image="/img/static/skill/sd2.webp" />
      {reduce ? (
        <section className="bg-mist py-16">
          <div className="container-x grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((g, i) => (
              <Card key={g.href} g={g} i={i} />
            ))}
          </div>
        </section>
      ) : (
        <>
          {/* Horizontal scroll driven by vertical scroll (desktop) */}
          <section ref={ref} className="relative hidden bg-navy-900 md:block" style={{ height: `${list.length * 38}vh` }}>
            <div className="sticky top-0 flex h-screen items-center overflow-hidden pt-[76px] min-[1360px]:pt-[116px]">
              <motion.div style={{ x }} className="flex gap-8 pl-[8vw]">
                <div className="flex w-[34vw] shrink-0 flex-col justify-center pr-8 text-white">
                  <p className="eyebrow !text-gold">Scroll to explore</p>
                  <h2 className="mt-4 text-5xl leading-tight">{list.length} issues of campus life</h2>
                  <p className="mt-4 text-white/65">From the Rewind of 2024 to the latest month.</p>
                </div>
                {list.map((g, i) => (
                  <Card key={g.href} g={g} i={i} />
                ))}
              </motion.div>
            </div>
          </section>
          {/* Swipeable strip (mobile) */}
          <section className="bg-navy-900 py-12 md:hidden">
            <div className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto px-4">
              {list.map((g, i) => (
                <div key={g.href} className="snap-center">
                  <Card g={g} i={i} />
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  )
}
