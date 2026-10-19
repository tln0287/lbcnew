import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, BookOpen, ChevronLeft, ChevronRight, Rows3 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { newsletters, pageSrc, thumbSrc } from '../lib/newsletters'
import NotFound from './NotFound'

function useWide() {
  const q = '(min-width: 900px)'
  const [w, setW] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const on = () => setW(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return w
}

/** Desktop spreads: [cover alone on the right], then [2,3], [4,5] … */
const spreadOf = (page: number) => Math.floor(page / 2)
const pagesOf = (spread: number, total: number): [number | null, number | null] => {
  const l = spread === 0 ? null : spread * 2
  const r = spread * 2 + 1
  return [l && l <= total ? l : null, r <= total ? r : null]
}

function Page({ slug, n, side }: { slug: string; n: number | null; side: 'left' | 'right' }) {
  if (!n) return <div className="h-full w-full" />
  return <img src={pageSrc(slug, n)} alt={`Page ${n}`} className={`h-full w-full bg-white object-contain ${side === 'left' ? 'rounded-l-md' : 'rounded-r-md'}`} draggable={false} />
}

export default function NewsletterReader() {
  const { slug } = useParams()
  const issue = newsletters.find((n) => n.slug === slug)
  const wide = useWide()
  const reduce = useReducedMotion()
  const [page, setPage] = useState(1) // single-page mode, and anchor for spreads
  const [all, setAll] = useState(false)
  const [flip, setFlip] = useState<{ from: number; to: number } | null>(null)
  const thumbs = useRef<HTMLDivElement>(null)

  const total = issue?.pages ?? 1
  const spread = spreadOf(page)
  const lastSpread = spreadOf(total)

  const go = useCallback(
    (d: number) => {
      if (flip) return
      if (wide) {
        const to = Math.max(0, Math.min(lastSpread, spread + d))
        if (to === spread) return
        if (reduce) setPage(to === 0 ? 1 : to * 2)
        else setFlip({ from: spread, to })
      } else {
        setPage((p) => Math.max(1, Math.min(total, p + d)))
      }
    },
    [flip, wide, spread, lastSpread, reduce, total],
  )

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [go])

  useEffect(() => {
    thumbs.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [page])

  if (!issue) return <NotFound />
  const heading = issue.kind === issue.title ? issue.kind : `${issue.kind} — ${issue.title}`

  // what sits under the turning sheet
  const shown = flip ? flip.to : spread
  const [nl, nr] = pagesOf(shown, total)
  const [ol, or] = flip ? pagesOf(flip.from, total) : [nl, nr]
  const forward = flip ? flip.to > flip.from : true
  const underLeft = flip && forward ? ol : nl
  const underRight = flip && !forward ? or : nr
  const pageW = `min(40vw, calc((100svh - 260px) * ${issue.ratio}))`
  const visiblePages = wide ? pagesOf(spread, total).filter(Boolean) : [page]

  return (
    <>
      <PageHero eyebrow={issue.kind} title={issue.kind === issue.title ? `${issue.title}` : issue.title} text={`${heading} · ${issue.pages} pages`} crumbs={[{ label: 'Newsletters', to: '/newsletters' }]}>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={() => setAll(!all)} className="btn-gold" aria-pressed={all}>
            {all ? <BookOpen className="h-4 w-4" /> : <Rows3 className="h-4 w-4" />} {all ? 'Back to the page reader' : 'Read all pages here'}
          </button>
          <a href={issue.pdf} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            Download the PDF <ArrowUpRight className="h-4 w-4" />
            <span className="sr-only">(opens in new tab)</span>
          </a>
        </div>
      </PageHero>

      {all ? (
        <section className="bg-mist py-14">
          <div className="mx-auto grid max-w-3xl gap-6 px-5">
            {Array.from({ length: total }, (_, i) => (
              <img key={i} src={pageSrc(issue.slug, i + 1)} alt={`${heading}, page ${i + 1} of ${total}`} className="w-full rounded-xl bg-white shadow-[var(--shadow-raised)]" loading={i < 2 ? 'eager' : 'lazy'} />
            ))}
          </div>
        </section>
      ) : (
        <section className="bg-mist py-10" aria-label="Page reader">
          <p className="sr-only" aria-live="polite">
            Showing page{visiblePages.length > 1 ? 's' : ''} {visiblePages.join(' and ')} of {total}
          </p>
          <div className="flex items-center justify-center gap-3 px-3">
            <button type="button" onClick={() => go(-1)} disabled={wide ? spread === 0 : page === 1} aria-label="Previous page" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy text-white disabled:opacity-30">
              <ChevronLeft className="h-6 w-6" />
            </button>

            {wide ? (
              <div className="relative flex" style={{ perspective: 2400 }}>
                <div className="flex shadow-[var(--shadow-raised)]">
                  <div style={{ width: pageW, aspectRatio: `${issue.ratio}` }} className="relative">
                    <Page slug={issue.slug} n={underLeft} side="left" />
                    {underLeft && <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-black/15 to-transparent" />}
                  </div>
                  <div style={{ width: pageW, aspectRatio: `${issue.ratio}` }} className="relative">
                    <Page slug={issue.slug} n={underRight} side="right" />
                    {underRight && <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-black/15 to-transparent" />}
                  </div>
                </div>
                {flip && (
                  <motion.div
                    key={`${flip.from}-${flip.to}`}
                    className="absolute inset-y-0"
                    style={{ width: pageW, left: forward ? pageW : 0, transformStyle: 'preserve-3d', transformOrigin: forward ? 'left center' : 'right center' }}
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: forward ? -180 : 180 }}
                    transition={{ duration: 0.9, ease: [0.45, 0.05, 0.25, 1] }}
                    onAnimationComplete={() => {
                      setPage(flip.to === 0 ? 1 : flip.to * 2)
                      setFlip(null)
                    }}
                  >
                    <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                      <Page slug={issue.slug} n={forward ? or : ol} side={forward ? 'right' : 'left'} />
                    </div>
                    <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                      <Page slug={issue.slug} n={forward ? nl : nr} side={forward ? 'left' : 'right'} />
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="relative w-full max-w-[560px] overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.img
                    key={page}
                    src={pageSrc(issue.slug, page)}
                    alt={`Page ${page} of ${total}`}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, x: -40 }}
                    transition={{ duration: 0.4 }}
                    className="w-full rounded-xl bg-white shadow-[var(--shadow-raised)]"
                  />
                </AnimatePresence>
              </div>
            )}

            <button type="button" onClick={() => go(1)} disabled={wide ? spread === lastSpread : page === total} aria-label="Next page" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy text-white disabled:opacity-30">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div ref={thumbs} className="scrollbar-none container-x mt-8 flex gap-3 overflow-x-auto pb-2" role="group" aria-label="Pages">
            {Array.from({ length: total }, (_, i) => {
              const n = i + 1
              const current = wide ? spreadOf(n) === spread : n === page
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => !flip && setPage(n)}
                  aria-label={`Go to page ${n}`}
                  aria-current={current ? 'true' : undefined}
                  className={`w-16 shrink-0 overflow-hidden rounded-md ring-2 transition ${current ? 'ring-gold' : 'opacity-70 ring-transparent hover:opacity-100'}`}
                >
                  <img src={thumbSrc(issue.slug, n)} alt="" className="w-full bg-white" loading="lazy" />
                  <span className="block bg-white py-0.5 text-center text-[11px] text-slate">{n}</span>
                </button>
              )
            })}
          </div>
          <p className="mt-4 text-center text-sm text-slate">Use ← and → to turn pages.</p>
        </section>
      )}
    </>
  )
}

export function NewsletterIndex() {
  return (
    <>
      <PageHero eyebrow="Newsletters" title="The LBC Times & Campus Glimpses" text="Every issue published on lbc.edu.in, readable page by page." />
      <section className="bg-mist py-16">
        <div className="container-x grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {newsletters.map((n) => (
            <Link key={n.slug} to={`/newsletters/${n.slug}`} className="group">
              <div className="overflow-hidden rounded-xl bg-white shadow-[var(--shadow-raised)] transition duration-500 group-hover:-translate-y-1" style={{ aspectRatio: `${n.ratio}` }}>
                <img src={`/newsletters/${n.slug}/t001.webp`} srcSet={`/newsletters/${n.slug}/t001.webp 180w, /newsletters/${n.slug}/p001.webp 1100w`} sizes="(min-width:1024px) 20vw, 45vw" alt="" className="h-full w-full object-cover object-top" loading="lazy" />
              </div>
              <p className="display mt-3 text-xl text-navy">
                {n.month} {n.year}
              </p>
              <p className="text-sm text-slate">
                {n.kind} · {n.pages} pages
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
