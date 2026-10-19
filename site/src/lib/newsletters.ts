import { docUrl } from '../content/site'
import data from '../data/newsletters.json'

export type Issue = {
  slug: string
  kind: string
  title: string
  month: string
  year: string
  pages: number
  ratio: number
  pdf: string
}

/** The LBC Times issue is dated on its cover: Tuesday, March 31, 2026. */
const DATED: Record<string, Partial<Issue>> = {
  'the-lbc-times': { month: 'March 31', year: '2026' },
}

export const newsletters: Issue[] = (data as Issue[]).map((n) => ({ ...n, ...DATED[n.slug], pdf: docUrl(n.pdf) }))
export const pageSrc = (slug: string, page: number) => `/newsletters/${slug}/p${String(page).padStart(3, '0')}.webp`
export const thumbSrc = (slug: string, page: number) => `/newsletters/${slug}/t${String(page).padStart(3, '0')}.webp`
