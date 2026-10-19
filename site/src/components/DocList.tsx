import { FileText, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

export type DocItem = { title: string; meta?: string; group?: string; href: string; unavailable?: boolean }

export function DocLink({ doc }: { doc: DocItem }) {
  const ext = (doc.href.match(/\.(pdf|docx?|xlsx?|mp4)$/i)?.[1] ?? 'link').toUpperCase()
  if (doc.unavailable) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-dashed border-navy/15 bg-mist/60 p-4">
        <FileText className="h-5 w-5 shrink-0 text-slate/30" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate/50">{doc.title}</p>
          <p className="text-xs text-slate/45">The official server does not currently return this file.</p>
        </div>
      </div>
    )
  }
  return (
    <a
      href={doc.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 rounded-2xl border border-navy/8 bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-royal/30 hover:shadow-lg hover:shadow-navy/10"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-royal/8 text-royal transition group-hover:bg-royal group-hover:text-white">
        <FileText className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-navy group-hover:text-royal">{doc.title}</span>
        {doc.meta && <span className="block truncate text-xs text-slate/55">{doc.meta}</span>}
      </span>
      <span className="rounded-md bg-gold-soft px-2 py-1 text-[10px] font-extrabold text-navy">{ext}</span>
    </a>
  )
}

/** Searchable, grouped document archive. */
export function DocList({ docs, placeholder = 'Search documents', columns = 2 }: { docs: DocItem[]; placeholder?: string; columns?: 1 | 2 | 3 }) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? docs.filter((d) => `${d.title} ${d.meta ?? ''} ${d.group ?? ''}`.toLowerCase().includes(s)) : docs
  }, [docs, q])
  const groups = useMemo(() => {
    const m = new Map<string, DocItem[]>()
    for (const d of filtered) m.set(d.group ?? '', [...(m.get(d.group ?? '') ?? []), d])
    return [...m.entries()]
  }, [filtered])
  const grid = columns === 1 ? '' : columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'

  return (
    <div>
      {docs.length > 6 && (
        <label className="relative mb-8 block max-w-md">
          <span className="sr-only">{placeholder}</span>
          <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate/40" aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-full border border-navy/12 bg-white py-3 pr-4 pl-11 text-sm shadow-sm outline-none focus:border-royal focus:ring-4 focus:ring-royal/10"
          />
        </label>
      )}
      <p className="sr-only" aria-live="polite">
        {filtered.length} documents shown
      </p>
      {groups.map(([g, items]) => (
        <div key={g || 'all'} className="mb-10">
          {g && <h3 className="mb-4 text-sm text-royal">{g}</h3>}
          <div className={`grid gap-3 ${grid}`}>
            {items.map((d, i) => (
              <DocLink key={d.href + i} doc={d} />
            ))}
          </div>
        </div>
      ))}
      {filtered.length === 0 && <p className="rounded-2xl bg-mist p-6 text-slate/60">No documents match “{q}”.</p>}
    </div>
  )
}
