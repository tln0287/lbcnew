import { HeroCarousel } from '../components/HeroCarousel'
import { usePageTitle } from '../components/PageHero'
import { ActivitiesPanels } from '../sections/ActivitiesPanels'
import { Alumni } from '../sections/Alumni'
import { ContactSection } from '../sections/ContactSection'
import { FacilitiesCarousel } from '../sections/FacilitiesCarousel'
import { GalleryHighlights } from '../sections/GalleryHighlights'
import { Intro } from '../sections/Intro'
import { Leadership } from '../sections/Leadership'
import { NewsBlog } from '../sections/NewsBlog'
import { NewsletterShelf } from '../sections/NewsletterShelf'
import { Programmes } from '../sections/Programmes'
import { QuickLinks } from '../sections/QuickLinks'
import { Ribbon } from '../sections/Ribbon'

/**
 * Home page — section order and backgrounds follow the design system:
 * hero (photo) · ribbon (navy) · intro & timeline (paper) · programmes (white grid)
 * · facilities (paper) · activities (white) · gallery (paper) · newsletters (navy)
 * · news & blog (paper) · alumni (paper) · leadership (white) · quick links (paper)
 * · contact (white) · footer (solid navy).
 */
export default function Home() {
  usePageTitle('')
  return (
    <>
      <HeroCarousel />
      <Ribbon />
      <Intro />
      <Programmes />
      <FacilitiesCarousel />
      <ActivitiesPanels />
      <GalleryHighlights />
      <NewsletterShelf />
      <NewsBlog />
      <Alumni />
      <Leadership />
      <QuickLinks />
      <ContactSection />
    </>
  )
}
