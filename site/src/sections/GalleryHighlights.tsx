import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RiseText } from '../components/Effects'
import { Lightbox } from '../components/Lightbox'
import { albums, mixed } from '../content/gallery'

const PAGE = 12

export function GalleryHighlights() {
  const [album, setAlbum] = useState('All')
  const [count, setCount] = useState(PAGE)
  const [shown, setShown] = useState<number | null>(null)
  const names = useMemo(() => ['All', ...new Set(albums.map((a) => a.album))], [])
  const list = album === 'All' ? mixed : albums.filter((a) => a.album === album)
  const visible = list.slice(0, count)

  return (
    <section className="section-y bg-mist">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <RiseText text="Show me the campus" className="h-section" />
            <p className="lede mt-5">Photographs from celebrations, laboratories, sports and student activities.</p>
          </div>
          <Link to="/gallery" className="btn-outline">
            Open the gallery <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="scrollbar-none -mx-5 mt-10 flex gap-2 overflow-x-auto px-5" role="group" aria-label="Filter photos by album">
          {names.map((n) => {
            const c = n === 'All' ? albums.length : albums.filter((a) => a.album === n).length
            return (
              <button
                key={n}
                type="button"
                aria-pressed={album === n}
                onClick={() => {
                  setAlbum(n)
                  setCount(PAGE)
                }}
                className={`relative min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition ${album === n ? 'text-white' : 'bg-white text-navy ring-1 ring-navy/10 hover:ring-navy/30'}`}
              >
                {album === n && <motion.span layoutId="album-chip" className="absolute inset-0 rounded-full bg-navy" transition={{ type: 'spring', stiffness: 260, damping: 28 }} />}
                <span className="relative">
                  {n} <span className={album === n ? 'text-gold-2' : 'text-slate'}>{c}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-8 columns-2 gap-4 sm:columns-3 lg:columns-4">
          <AnimatePresence initial={false}>
            {visible.map((p, i) => (
              <motion.button
                key={album + p.src}
                type="button"
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: Math.min((i % PAGE) * 0.04, 0.4), ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setShown(i)}
                className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-[22px] bg-track text-left"
              >
                <img src={p.src} alt={p.alt} className="w-full transition duration-700 group-hover:scale-[1.04]" loading="lazy" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent p-4 pt-10 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  {p.album}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
        {count < list.length && (
          <div className="mt-6 text-center">
            <button type="button" onClick={() => setCount(count + PAGE)} className="btn-outline">
              Show more photos ({list.length - count} more)
            </button>
          </div>
        )}
      </div>
      <Lightbox items={list.map((p) => ({ src: p.src, alt: p.alt, caption: p.album, text: p.alt }))} index={shown} onChange={setShown} />
    </section>
  )
}
