import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RiseText, Seal, Spotlight } from '../components/Effects'
import { newsletters } from '../lib/newsletters'

/** Horizontal shelf of issue covers leaning back 18°, standing upright on hover or focus. */
export function NewsletterShelf() {
  return (
    <Spotlight className="navy-drift overflow-hidden pt-24 pb-14 text-white lg:pt-32 lg:pb-16">
      <Seal className="absolute -top-24 -right-24 h-[420px] w-[420px]" opacity={0.55} />
      <div className="container-x relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <RiseText text="What’s been happening?" className="h-section !text-white" />
            <p className="mt-5 max-w-[60ch] text-lg leading-[1.65] text-white/75">Read The LBC Times and every monthly issue of Campus Glimpses, page by page.</p>
          </div>
          <Link to="/newsletters" className="btn-ghost">
            All issues <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="scrollbar-none relative mt-14 flex snap-x scroll-px-5 gap-6 overflow-x-auto px-5 pt-6 pb-6 sm:scroll-px-8 sm:px-8 lg:snap-none lg:px-[max(3rem,calc((100vw-1320px)/2+3rem))]" style={{ perspective: 1400 }}>
        {newsletters.map((n) => (
          <Link
            key={n.slug}
            to={`/newsletters/${n.slug}`}
            className="group relative w-[200px] shrink-0 snap-start outline-none sm:w-[220px]"
            aria-label={`${n.kind}${n.kind !== n.title ? `, ${n.title}` : ''} — ${n.pages} pages`}
          >
            <div
              className="relative overflow-hidden rounded-[14px] bg-white shadow-[0_30px_50px_-20px_rgb(0_0_0/0.6)] transition duration-700 ease-out-expo [transform:rotateX(18deg)] group-hover:[transform:rotateX(0deg)_translateY(-6px)] group-focus-visible:[transform:rotateX(0deg)_translateY(-6px)] group-focus-visible:ring-2 group-focus-visible:ring-gold"
              style={{ transformOrigin: 'bottom center', aspectRatio: `${n.ratio}` }}
            >
              <img src={`/newsletters/${n.slug}/p001.webp`} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy via-navy/80 to-transparent p-4 pt-16">
                <p className="display text-3xl leading-none text-white">{n.month}</p>
                {n.year && <p className="display mt-1 text-xl text-gold-2">{n.year}</p>}
              </div>
            </div>
            <p className="mt-4 text-sm text-white/70">
              {n.kind} · {n.pages} pages
            </p>
          </Link>
        ))}
      </div>
    </Spotlight>
  )
}
