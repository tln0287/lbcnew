import committeesJson from '../data/committees.json'
import documentsJson from '../data/documents.json'
import facultyJson from '../data/faculty.json'
import pagesJson from '../data/pages.json'
import pgJson from '../data/pg_programmes.json'
import ugJson from '../data/ug_programmes.json'

export type Block = { t: 'h' | 'p' | 'li'; text: string } | { t: 'table'; rows: string[][] }
export type RichPage = { title: string; blocks: Block[]; images: string[] }
export type Programme = RichPage & { slug: string; id: number; name?: string; official: string }
export type Doc = { label: string; href: string }
export type NaacRow = { cells: string[]; label: string; href: string; unavailable?: boolean }
export type NaacSet = { ssr: Record<string, NaacRow[]>; dvv: Record<string, NaacRow[]>; quality: NaacRow[]; extended: NaacRow[] }
export type Committee = {
  slug: string
  name: string
  members: string[]
  roles: string[]
  official: string
  /** PG pages publish name, status, email and phone per member */
  contacts?: { name: string; status: string; email: string; phone: string }[]
}
export type FacultyMember = {
  name: string
  designation: string
  qualification: string
  group: string
  profile: string | null
  photo: string | null
  college: 'UG' | 'PG'
  programme: string
  official: string
}

export const faculty = facultyJson as FacultyMember[]
export const committees = committeesJson as { ug: Committee[]; pg: Committee[] }
export const ugProgrammes = ugJson as Programme[]
export const pgProgrammes = pgJson as Programme[]
export const pages = pagesJson as unknown as Record<string, RichPage>
export const documents = documentsJson as {
  iqac: { ug: { group: string; docs: Doc[] }[]; pg: { group: string; docs: Doc[] }[] }
  poscos: { ug: Doc[]; pg: Doc[] }
  projects: Doc[]
  eoa: Doc[]
  campusGlimpses: Doc[]
}

/** "Year of Establishment: 1994" style facts from a programme page. */
export function facts(blocks: Block[]): { key: string; value: string }[] {
  const out: { key: string; value: string }[] = []
  for (const b of blocks) {
    if (b.t === 'table') continue
    const m = b.text.match(/^([A-Z][A-Za-z ()/-]{3,40}):\s*(.{1,180})$/)
    if (m && /establish|intake|affiliation|eligib|duration|admission|pattern/i.test(m[1])) {
      out.push({ key: m[1].trim(), value: m[2].trim() })
    }
  }
  return out
}

/** Section text under a heading (used for previews of department activities). */
export function sectionAfter(blocks: Block[], heading: RegExp): string | undefined {
  const i = blocks.findIndex((b) => b.t === 'h' && heading.test(b.text))
  if (i < 0) return undefined
  const next = blocks.slice(i + 1).find((b) => b.t === 'p' || b.t === 'li')
  return next && next.t !== 'table' ? next.text : undefined
}

export function initials(name: string) {
  const parts = name
    .replace(/^(Dr|Mr|Mrs|Ms|Smt|Sri|Prof|Major|Captain)\.?\s+/i, '')
    .split(/[\s.]+/)
    .filter((p) => p.length > 1)
  return (parts.slice(-2).map((p) => p[0]).join('') || name[0]).toUpperCase()
}
