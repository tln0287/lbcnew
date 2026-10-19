import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'

export default function NotFound() {
  return (
    <PageHero eyebrow="404" title="Page not found" text="The page you are looking for does not exist or has moved.">
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/" className="btn-gold">
          Go to homepage
        </Link>
        <Link to="/search" className="btn-ghost">
          Search the website
        </Link>
      </div>
    </PageHero>
  )
}
