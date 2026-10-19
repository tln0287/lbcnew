import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { BackToTop, ScrollProgress } from './components/Effects'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import Home from './pages/Home'

const Profile = lazy(() => import('./pages/Profile'))
const Faculty = lazy(() => import('./pages/Faculty'))
const Facilities = lazy(() => import('./pages/Facilities'))
const Departments = lazy(() => import('./pages/Departments'))
const Courses = lazy(() => import('./pages/Courses'))
const Programme = lazy(() => import('./pages/Programme'))
const PGCollege = lazy(() => import('./pages/PGCollege'))
const Academics = lazy(() => import('./pages/Academics'))
const Outcomes = lazy(() => import('./pages/Outcomes'))
const Projects = lazy(() => import('./pages/Projects'))
const SkillDevelopment = lazy(() => import('./pages/SkillDevelopment'))
const Activities = lazy(() => import('./pages/Activities'))
const BharatScouts = lazy(() => import('./pages/BharatScouts'))
const Committees = lazy(() => import('./pages/Committees'))
const IQAC = lazy(() => import('./pages/IQAC'))
const NAAC = lazy(() => import('./pages/NAAC'))
const NIRF = lazy(() => import('./pages/NIRF'))
const RTI = lazy(() => import('./pages/RTI'))
const AICTE = lazy(() => import('./pages/AICTE'))
const Placements = lazy(() => import('./pages/Placements'))
const Gallery = lazy(() => import('./pages/Gallery'))
const CampusGlimpses = lazy(() => import('./pages/CampusGlimpses'))
const LBCTimes = lazy(() => import('./pages/LBCTimes'))
const BGV = lazy(() => import('./pages/BGV'))
const Contact = lazy(() => import('./pages/Contact'))
const SearchPage = lazy(() => import('./pages/Search'))
const Sitemap = lazy(() => import('./pages/Sitemap'))
const NotFound = lazy(() => import('./pages/NotFound'))
const NewsletterReader = lazy(() => import('./pages/NewsletterReader'))
const NewsletterIndex = lazy(() => import('./pages/NewsletterReader').then((m) => ({ default: m.NewsletterIndex })))
const LeadershipMessage = lazy(() => import('./pages/LeadershipMessage'))

function ScrollManager() {
  const { pathname, hash, search } = useLocation()
  useEffect(() => {
    if (hash) {
      // wait for lazily loaded content to render
      let tries = 0
      const find = () => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)))
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        else if (tries++ < 20) window.setTimeout(find, 100)
      }
      find()
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
  }, [pathname, hash, search])
  return null
}

function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-navy" role="status" aria-label="Loading page">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-gold/30 border-t-gold" />
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  const reduce = useReducedMotion()
  return (
    <AnimatePresence mode="wait">
      <motion.main
        id="main"
        key={location.pathname}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduce ? undefined : { opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Suspense fallback={<Loading />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/faculty" element={<Faculty />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:level/:slug" element={<Programme />} />
            <Route path="/pg-college" element={<PGCollege />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/academics/outcomes" element={<Outcomes />} />
            <Route path="/academics/projects" element={<Projects />} />
            <Route path="/academics/skill-development" element={<SkillDevelopment />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/activities/bharat-scouts-guides" element={<BharatScouts />} />
            <Route path="/committees" element={<Committees />} />
            <Route path="/committees/:slug" element={<Committees />} />
            <Route path="/iqac" element={<IQAC />} />
            <Route path="/naac" element={<NAAC />} />
            <Route path="/nirf" element={<NIRF />} />
            <Route path="/rti" element={<RTI />} />
            <Route path="/aicte" element={<AICTE />} />
            <Route path="/placements" element={<Placements />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/campus-glimpses" element={<CampusGlimpses />} />
            <Route path="/lbc-times" element={<LBCTimes />} />
            <Route path="/bgv" element={<BGV />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/newsletters" element={<NewsletterIndex />} />
            <Route path="/newsletters/:slug" element={<NewsletterReader />} />
            <Route path="/leadership/:id" element={<LeadershipMessage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.main>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <ScrollProgress />
      <Header />
      <AnimatedRoutes />
      <Footer />
      <BackToTop />
    </BrowserRouter>
  )
}
