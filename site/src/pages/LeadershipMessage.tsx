import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { Fade } from '../components/Motion'
import { TiltCard } from '../components/TiltCard'
import { leadership } from '../content/site'
import NotFound from './NotFound'

export default function LeadershipMessage() {
  const { id } = useParams()
  const i = Number(id) - 1
  const l = leadership[i]
  if (!l) return <NotFound />
  return (
    <>
      <PageHero eyebrow="Leadership" title={l.name ? `${l.role}'s message` : `Message from the ${l.role}`} text={l.name ? `${l.name}, ${l.role}` : undefined} crumbs={[{ label: 'Profile', to: '/profile' }]} />
      <section className="section-y bg-mist">
        <div className="container-x grid gap-14 lg:grid-cols-[380px_1fr]">
          <Fade className="lg:sticky lg:top-28 lg:self-start min-[1360px]:top-36">
            <TiltCard className="rounded-[28px]">
              <div className="raised aspect-[4/5] overflow-hidden rounded-[28px]">
                <img src={l.image} alt={`${l.role}${l.name ? `, ${l.name}` : ''}`} className="h-full w-full scale-[1.32] object-cover" />
              </div>
            </TiltCard>
          </Fade>
          <Fade delay={0.1}>
            <span className="display block text-7xl leading-none text-gold" aria-hidden="true">
              “
            </span>
            {l.message.map((m, k) => (
              <p key={k} className={`max-w-[62ch] leading-[1.75] ${k === 0 ? 'display -mt-4 text-2xl leading-snug text-navy' : 'mt-6 text-lg text-slate'}`}>
                {m}
              </p>
            ))}
            <div className="mt-10 flex flex-wrap gap-3">
              {leadership.map((o, k) =>
                k === i ? null : (
                  <Link key={k} to={`/leadership/${k + 1}`} className="btn-outline">
                    {o.name ?? o.role}
                  </Link>
                ),
              )}
              <Link to="/" className="btn !px-3 text-slate hover:text-navy">
                <ArrowLeft className="h-4 w-4" /> Home
              </Link>
            </div>
          </Fade>
        </div>
      </section>
    </>
  )
}
