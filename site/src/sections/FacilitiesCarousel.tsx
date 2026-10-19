import { useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Autoplay, EffectCoverflow, Keyboard, A11y } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import { RiseText } from '../components/Effects'
import { Lightbox } from '../components/Lightbox'
import { facilitySlides } from '../content/home'

export function FacilitiesCarousel() {
  const reduce = useReducedMotion()
  const swiper = useRef<SwiperType | null>(null)
  const [shown, setShown] = useState<number | null>(null)

  // hold the carousel still while the viewer is open
  useEffect(() => {
    if (!swiper.current?.autoplay || reduce) return
    if (shown === null) swiper.current.autoplay.start()
    else swiper.current.autoplay.stop()
  }, [shown, reduce])

  return (
    <section className="section-y overflow-hidden bg-mist">
      <div className="container-x flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <RiseText text="What’s the campus like?" className="h-section" />
          <p className="lede mt-5">Science laboratories, libraries, seminar halls, computer labs and playfields across the Degree and PG colleges.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => swiper.current?.slidePrev()} aria-label="Previous facility" className="grid h-11 w-11 place-items-center rounded-full border border-navy/20 text-navy hover:bg-navy hover:text-white">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => swiper.current?.slideNext()} aria-label="Next facility" className="grid h-11 w-11 place-items-center rounded-full border border-navy/20 text-navy hover:bg-navy hover:text-white">
            <ChevronRight className="h-5 w-5" />
          </button>
          <Link to="/facilities" className="btn-navy ml-2">
            Explore all facilities <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-14">
        <Swiper
          modules={[EffectCoverflow, Autoplay, Keyboard, A11y]}
          onSwiper={(s) => (swiper.current = s)}
          effect="coverflow"
          centeredSlides
          loop
          grabCursor
          slidesPerView="auto"
          speed={reduce ? 300 : 1400}
          keyboard={{ enabled: true, onlyInViewport: true }}
          autoplay={reduce ? false : { delay: 2600, pauseOnMouseEnter: true, disableOnInteraction: false }}
          coverflowEffect={{ rotate: 22, stretch: 0, depth: 160, modifier: 1, slideShadows: false }}
          a11y={{ prevSlideMessage: 'Previous facility', nextSlideMessage: 'Next facility' }}
          className="facility-swiper !overflow-visible !px-4"
        >
          {facilitySlides.map((f, i) => (
            <SwiperSlide key={f.image + i} className="!w-[78vw] max-w-[620px] sm:!w-[520px] lg:!w-[620px]">
              <button type="button" onClick={() => setShown(i)} className="group relative block aspect-[4/3] w-full overflow-hidden rounded-[28px] text-left raised">
                <img src={f.image} alt={`${f.name} — ${f.line}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 via-navy/40 to-transparent p-7 pt-20">
                  <span className="display block text-3xl text-white">{f.name}</span>
                  <span className="mt-1 block text-sm text-white/80">{f.line}</span>
                </span>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <style>{`.facility-swiper .swiper-slide{transition:opacity .8s, filter .8s}.facility-swiper .swiper-slide:not(.swiper-slide-active){opacity:.72;filter:saturate(.8)}`}</style>
      <Lightbox
        items={facilitySlides.map((f) => ({ src: f.image, alt: `${f.name} — ${f.line}`, caption: f.name, text: f.line, link: { label: `See all ${f.name.toLowerCase()} photos`, to: '/facilities' } }))}
        index={shown}
        onChange={setShown}
      />
    </section>
  )
}
