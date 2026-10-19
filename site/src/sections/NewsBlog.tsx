import { ArrowRight, ArrowUpRight, Clock } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RiseText } from '../components/Effects'
import { Lightbox } from '../components/Lightbox'
import { Fade, ImageReveal } from '../components/Motion'
import { blogPost } from '../content/home'
import { conference, news } from '../content/site'
import { newsletters } from '../lib/newsletters'

export function NewsBlog() {
  const [shown, setShown] = useState<number | null>(null)
  const times = newsletters.find((n) => n.slug === 'the-lbc-times')
  return (
    <section className="section-y bg-mist">
      <div className="container-x">
        <RiseText text="What’s new at LBC?" className="h-section" />
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          {/* Feature: The LBC Times */}
          <Fade className="card raised grid overflow-hidden sm:grid-cols-[0.9fr_1fr]">
            <ImageReveal src="/newsletters/the-lbc-times/p001.webp" alt="Front page of The LBC Times, 31 March 2026" className="aspect-[3/4] sm:aspect-auto sm:h-full sm:min-h-[440px]" imgClassName="object-top" />
            <div className="flex flex-col p-8">
              <p className="display text-3xl text-navy italic">The LBC Times</p>
              <p className="mt-1 text-sm text-slate">The Campus Chronicle · from the Department of Social Sciences</p>
              <p className="mt-5 leading-[1.6] text-slate">
                The latest issue, dated {times?.month}
                {/\d/.test(times?.month ?? '') ? ',' : ''} {times?.year}, runs to {times?.pages} pages, published by the Department of Social Sciences.
              </p>
              <div className="mt-auto flex flex-wrap gap-3 pt-8">
                <Link to="/newsletters/the-lbc-times" className="btn-gold">
                  Read the issue <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Fade>

          <div className="grid content-start gap-6">
            <ul className="card divide-y divide-navy/8">
              {news.map((n, i) => (
                <li key={n.title}>
                  <button type="button" onClick={() => setShown(i)} className="group flex w-full items-center gap-4 p-4 text-left">
                    <img src={n.image} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" loading="lazy" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-slate">{'date' in n && n.date ? n.date : n.category}</span>
                      <span className="line-clamp-2 font-bold text-navy group-hover:text-royal">{n.title}</span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-gold transition group-hover:translate-x-1" aria-hidden="true" />
                  </button>
                </li>
              ))}
              <li>
                <a href={conference.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 p-4">
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-navy text-center text-xs font-bold text-gold-2">Dec 2026</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-slate">Conference · {conference.date}</span>
                    <span className="line-clamp-2 font-bold text-navy group-hover:text-royal">{conference.title}</span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              </li>
            </ul>

            <Fade className="card overflow-hidden">
              <a href={blogPost.href} target="_blank" rel="noopener noreferrer" className="group grid sm:grid-cols-[160px_1fr]">
                <img src={blogPost.image} alt="" className="h-40 w-full object-cover sm:h-full" loading="lazy" />
                <div className="p-6">
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate">
                    <span className="rounded-full bg-gold-soft px-2.5 py-0.5 font-semibold text-navy">Blog · {blogPost.tags.join(', ')}</span>
                    <span>{blogPost.date}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {blogPost.minutes} min read
                    </span>
                  </p>
                  <h3 className="display mt-3 text-xl leading-snug group-hover:text-royal">{blogPost.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate">{blogPost.summary}</p>
                  <span className="sr-only">(opens in new tab)</span>
                </div>
              </a>
            </Fade>
          </div>
        </div>
      </div>
      <Lightbox items={news.map((n) => ({ src: n.image, alt: n.title, caption: n.title, text: n.text }))} index={shown} onChange={setShown} />
    </section>
  )
}
