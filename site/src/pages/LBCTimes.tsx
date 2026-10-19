import { ArrowUpRight, Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { Reveal, SectionHeading } from '../components/Reveal'
import { conference, news, off } from '../content/site'

export default function LBCTimes() {
  const [featured, ...rest] = news
  return (
    <>
      <PageHero eyebrow="Newsletter" title="The LBC Times" text="Institutional news, student achievements, academic activities and event reports from across the campus." image="/img/media/jrcolleg/news/6.webp">
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/newsletters/the-lbc-times" className="btn-gold">
            <Newspaper className="h-4 w-4" aria-hidden="true" /> Read the latest issue
          </Link>
          <a href={off('/ugcollege/lbctimes')} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            Download the PDF <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </PageHero>

      <section className="bg-white py-20">
        <div className="container-x">
          <SectionHeading eyebrow="Featured story" title={featured.title} />
          <Reveal className="mt-10 grid overflow-hidden rounded-[2rem] bg-mist lg:grid-cols-[1fr_1.2fr]">
            <img src={featured.image} alt={featured.title} className="h-full max-h-[560px] w-full object-cover" />
            <article className="p-8 sm:p-12">
              <span className="rounded-full bg-navy px-3 py-1 text-[11px] font-extrabold text-gold">{featured.category}</span>
              <p className="mt-6 text-lg leading-relaxed text-slate/80 first-letter:float-left first-letter:mr-3 first-letter:text-6xl first-letter:leading-none first-letter:font-extrabold first-letter:text-royal">
                {featured.text}
              </p>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="bg-mist py-20">
        <div className="container-x">
          <SectionHeading eyebrow="More stories" title="News & updates" />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((n, i) => (
              <Reveal key={n.title} delay={i * 0.08}>
                <article className="card h-full overflow-hidden">
                  <img src={n.image} alt="" className="h-60 w-full object-cover object-top" loading="lazy" />
                  <div className="p-6">
                    <p className="text-[11px] font-extrabold text-royal">
                      {n.category}
                      {'date' in n && n.date ? ` · ${n.date}` : ''}
                    </p>
                    <h3 className="mt-2 text-lg text-navy">{n.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate/70">{n.text}</p>
                  </div>
                </article>
              </Reveal>
            ))}
            <Reveal delay={0.16}>
              <a href={conference.href} target="_blank" rel="noopener noreferrer" className="flex h-full flex-col justify-between rounded-3xl bg-navy p-7 text-white">
                <div>
                  <p className="text-[11px] font-extrabold text-gold">Event · {conference.date}</p>
                  <h3 className="mt-3 text-2xl">{conference.title}</h3>
                </div>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-gold">
                  Registration details <ArrowUpRight className="h-4 w-4" />
                </span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
