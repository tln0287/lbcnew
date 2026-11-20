/**
 * The PG admission application: fields, choices and validation.
 * Shared by the Apply page (browser) and the API server (server/), so both check the same rules.
 * Keep this file free of imports so Node can load it directly.
 */

/** PG courses as listed on the PG College profile (lbc.edu.in/pgcollege/profile). */
export const COURSES = [
  'MBA',
  'MCA',
  'M.Sc. Computer Science',
  'M.Sc. Mathematics',
  'M.Sc. Organic Chemistry',
  'M.Sc. Analytical Chemistry',
  'M.Sc. Bio-Chemistry',
  'M.Sc. Bio-Technology',
  'M.Sc. Micro-Biology',
  'M.A. English',
  'M.Com.',
  'Human Resource Management (MHRM)',
]
export const EXAMS = ['ICET', 'AUCET'] as const
export const CATEGORIES = ['Open', 'SC', 'ST', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'EBC']
export const LOCAL_OPTIONS = ['Local', 'Non-Local'] as const
export const QUAL_ROWS = ['SSC / CBSE / Others', 'Intermediate', 'Degree (B.A. / B.Sc. / B.Com.)'] as const

export type Qual = { college: string; university: string; passing: string; regNo: string; groupPct: string; totalMarks: string; result: string }
export const QUAL_KEYS = ['college', 'university', 'passing', 'regNo', 'groupPct', 'totalMarks', 'result'] as const

export type ApplicationForm = {
  course: string
  name: string
  father: string
  mother: string
  caste: string
  email: string
  aadhaar: string
  rankExam: (typeof EXAMS)[number]
  rank: string
  address: string
  phone: string
  quals: Qual[]
  cetCourse: string
  hallTicket: string
  cetRank: string
  local: '' | (typeof LOCAL_OPTIONS)[number]
  category: string
  /** Passport photo as a JPEG data URL ('' when none). */
  photo: string
}

export const TEXT_KEYS = ['course', 'name', 'father', 'mother', 'caste', 'email', 'aadhaar', 'rankExam', 'rank', 'address', 'phone', 'cetCourse', 'hallTicket', 'cetRank', 'local', 'category'] as const

/** Longest value accepted for any one text field. */
export const MAX_TEXT = 500
/** Largest photo data URL accepted (the page produces ~30–80 KB). */
export const MAX_PHOTO_CHARS = 600_000

export const emptyQual = (): Qual => ({ college: '', university: '', passing: '', regNo: '', groupPct: '', totalMarks: '', result: '' })

export const EMPTY_FORM: ApplicationForm = {
  course: '',
  name: '',
  father: '',
  mother: '',
  caste: '',
  email: '',
  aadhaar: '',
  rankExam: 'ICET',
  rank: '',
  address: '',
  phone: '',
  quals: QUAL_ROWS.map(emptyQual),
  cetCourse: '',
  hallTicket: '',
  cetRank: '',
  local: '',
  category: '',
  photo: '',
}

export type Errors = Partial<Record<string, string>>

export const digits = (s: string) => s.replace(/\D/g, '')
export const normalisePhone = (s: string) => s.replace(/[\s-]/g, '').replace(/^(\+91|0)/, '')

export function validate(f: ApplicationForm): Errors {
  const e: Errors = {}
  if (!COURSES.includes(f.course)) e.course = 'Choose the course you are applying for.'
  if (f.name.trim().length < 3) e.name = 'Enter your full name as in your certificates.'
  if (!f.father.trim()) e.father = "Enter your father's name."
  if (!f.mother.trim()) e.mother = "Enter your mother's name."
  if (!f.caste.trim()) e.caste = 'Enter your caste / sub caste.'
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email address.'
  if (!/^\d{12}$/.test(f.aadhaar.replace(/\s/g, ''))) e.aadhaar = 'Aadhaar number must be 12 digits.'
  if (!(EXAMS as readonly string[]).includes(f.rankExam)) e.rank = 'Choose ICET or AUCET.'
  else if (!/^\d+$/.test(f.rank)) e.rank = 'Enter your rank as a number.'
  if (f.address.trim().length < 10) e.address = 'Enter your full postal address.'
  if (!/^[6-9]\d{9}$/.test(normalisePhone(f.phone))) e.phone = 'Enter a 10-digit mobile number.'
  if (!f.quals[0]?.passing || !f.quals[0]?.result) e.qual0 = 'Fill in at least the month & year of passing and the result for SSC.'
  if (!f.quals[1]?.passing || !f.quals[1]?.result) e.qual1 = 'Fill in at least the month & year of passing and the result for Intermediate.'
  if (!f.quals[2]?.passing || !f.quals[2]?.result) e.qual2 = 'Fill in at least the month & year of passing and the result for your degree.'
  if (!CATEGORIES.includes(f.category)) e.category = 'Choose the category under which you are applying.'
  if (!(LOCAL_OPTIONS as readonly string[]).includes(f.local)) e.local = 'Choose Local or Non-Local.'
  return e
}

/**
 * Turns untrusted JSON into a well-formed form (unknown keys dropped, strings trimmed to MAX_TEXT),
 * or returns null when its shape is wrong. Run validate() on the result for the field rules.
 */
export function sanitise(input: unknown): ApplicationForm | null {
  if (!input || typeof input !== 'object') return null
  const o = input as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of TEXT_KEYS) {
    const v = o[k] ?? ''
    if (typeof v !== 'string') return null
    out[k] = v.slice(0, MAX_TEXT)
  }
  if (!Array.isArray(o.quals) || o.quals.length !== QUAL_ROWS.length) return null
  const quals: Qual[] = []
  for (const row of o.quals) {
    if (!row || typeof row !== 'object') return null
    const q = emptyQual()
    for (const k of QUAL_KEYS) {
      const v = (row as Record<string, unknown>)[k] ?? ''
      if (typeof v !== 'string') return null
      q[k] = v.slice(0, MAX_TEXT)
    }
    quals.push(q)
  }
  out.quals = quals
  const photo = o.photo ?? ''
  if (typeof photo !== 'string' || photo.length > MAX_PHOTO_CHARS) return null
  if (photo && !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(photo)) return null
  out.photo = photo
  return out as ApplicationForm
}

/** Application statuses, in the order an application moves through them. */
export const STATUSES = ['submitted', 'under_review', 'admitted', 'rejected'] as const
export type Status = (typeof STATUSES)[number]
export const STATUS_LABEL: Record<Status, string> = {
  submitted: 'Submitted',
  under_review: 'Under review',
  admitted: 'Admitted',
  rejected: 'Not admitted',
}
