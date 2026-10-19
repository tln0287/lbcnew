import { PageHero } from '../components/PageHero'
import { SmartLink } from '../components/SmartLink'
import { primaryNav, secondaryNav } from '../content/site'

export default function Sitemap() {
  return (
    <>
      <PageHero eyebrow="Navigation" title="Sitemap" text="Every section of the website, including links to official systems." />
      <section className="bg-white py-16">
        <div className="container-x columns-1 gap-10 sm:columns-2 lg:columns-3">
          {[...primaryNav, ...secondaryNav].map((n) => (
            <div key={n.label} className="mb-8 break-inside-avoid">
              <SmartLink to={n.to} href={n.href} showExternal className="text-lg font-extrabold text-navy hover:text-royal">
                {n.label}
              </SmartLink>
              {n.groups && (
                <ul className="mt-2 grid gap-1 border-l-2 border-gold/40 pl-4">
                  {n.groups.flatMap((g) => g.links).map((l) => (
                    <li key={l.label + (l.to ?? l.href)}>
                      <SmartLink to={l.to} href={l.href} showExternal className="text-sm text-slate/70 hover:text-royal">
                        {l.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
