import { ArrowUpRight, Search as SearchIcon } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { ugDepartments } from '../content/departments'
import { nirfReports, primaryNav, secondaryNav } from '../content/site'
import { committees, documents, faculty, pgProgrammes, ugProgrammes } from '../lib/data'

type Hit = { title: string; type: string; to?: string; href?: string; text?: string }

const index: Hit[] = ([
  ...[...primaryNav, ...secondaryNav].flatMap((n): Hit[] => [
    { title: n.label, type: 'Page', to: n.to, href: n.href },
    ...(n.groups ?? []).flatMap((g) => g.links.map((l) => ({ title: l.label, type: n.label, to: l.to, href: l.href, text: l.desc }))),
  ]),
  ...faculty.map((f): Hit => ({ title: f.name, type: 'Faculty', to: `/faculty?q=${encodeURIComponent(f.name)}`, text: `${f.designation} · ${f.group} · ${f.qualification}` })),
  ...ugDepartments.map((d) => ({ title: d.name, type: 'Department', to: `/departments?category=${d.category}`, text: d.honours })),
  ...ugProgrammes.map((p) => ({ title: p.title, type: 'UG programme', to: `/courses/ug/${p.slug}` })),
  ...pgProgrammes.map((p) => ({ title: p.name ?? p.title, type: 'PG department', to: `/courses/pg/${p.slug}` })),
  ...committees.ug.map((c) => ({ title: c.name, type: 'Committee', to: `/committees/${c.slug}`, text: c.members.join(', ') })),
  ...documents.iqac.ug.flatMap((g) => g.docs.map((d) => ({ title: `IQAC ${g.group} ${d.label}`, type: 'IQAC document', href: d.href }))),
  ...documents.poscos.ug.map((d) => ({ title: `${d.label} — UG PO's/CO's`, type: 'Outcomes', href: d.href })),
  ...documents.poscos.pg.map((d) => ({ title: `${d.label} — PG PO's/CO's`, type: 'Outcomes', href: d.href })),
  ...documents.campusGlimpses.map((d) => ({ title: `Campus Glimpses ${d.label}`, type: 'Campus Glimpses', href: d.href })),
  ...documents.projects.map((d) => ({ title: d.label, type: 'Projects & internships', href: d.href })),
  ...nirfReports.map((d) => ({ title: d.label, type: 'NIRF', href: d.href })),
] as Hit[]).filter((h) => h.to || h.href)

export default function Search() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const hits = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
    if (!terms.length) return []
    return index.filter((h) => terms.every((t) => `${h.title} ${h.type} ${h.text ?? ''}`.toLowerCase().includes(t))).slice(0, 80)
  }, [q])

  return (
    <>
      <PageHero eyebrow="Search" title="Search the website" text="Find pages, programmes, departments, faculty, committees and documents.">
        <label className="relative mt-8 block max-w-xl">
          <span className="sr-only">Search</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-navy/50" aria-hidden="true" />
          <input
            autoFocus
            type="search"
            value={q}
            onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
            placeholder="e.g. Microbiology, AQAR, Chakravarty"
            className="w-full rounded-full bg-white py-4 pr-5 pl-14 text-navy shadow-2xl outline-none focus:ring-4 focus:ring-gold/50"
          />
        </label>
      </PageHero>
      <section className="min-h-[40vh] bg-mist py-14">
        <div className="container-x">
          <p className="text-sm font-semibold text-slate/60" aria-live="polite">
            {q ? `${hits.length} result${hits.length === 1 ? '' : 's'}` : 'Type to search'}
          </p>
          <ul className="mt-6 grid gap-3">
            {hits.map((h, i) => {
              const inner = (
                <>
                  <span className="w-36 shrink-0 text-[11px] font-extrabold text-royal">{h.type}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-navy">{h.title}</span>
                    {h.text && <span className="block truncate text-sm text-slate/55">{h.text}</span>}
                  </span>
                  {h.href && <ArrowUpRight className="h-4 w-4 shrink-0 text-slate/40" aria-label="(external)" />}
                </>
              )
              const cls = 'flex items-center gap-4 rounded-2xl bg-white px-5 py-4 transition hover:shadow-lg'
              return (
                <li key={i}>
                  {h.to ? (
                    <Link to={h.to} className={cls}>
                      {inner}
                    </Link>
                  ) : (
                    <a href={h.href} target="_blank" rel="noopener noreferrer" className={cls}>
                      {inner}
                    </a>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </>
  )
}
