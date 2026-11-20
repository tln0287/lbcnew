import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Camera, Check, CheckCircle2, FileDown, Loader2, Mail, Printer, RotateCcw, Save, Send, Trash2, Upload } from 'lucide-react'
import { ApplicationSheet, downloadPdf, PrintRoot, SheetPreview } from '../components/ApplicationSheet'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { PageHero } from '../components/PageHero'
import { college, off } from '../content/site'
import { ApiError, api } from '../lib/api'
import { CATEGORIES, COURSES, digits, EMPTY_FORM, EXAMS, QUAL_ROWS, STATUS_LABEL, validate, type ApplicationForm, type Qual, type Status } from '../lib/application'

type Form = ApplicationForm
const EMPTY = EMPTY_FORM

const QUAL_COLS: { key: keyof Qual; label: string; hint?: string }[] = [
  { key: 'college', label: 'Name of the college, place and period of study' },
  { key: 'university', label: 'University / board' },
  { key: 'passing', label: 'Month & year of passing', hint: 'e.g. May 2024' },
  { key: 'regNo', label: 'Reg. No. of the candidate' },
  { key: 'groupPct', label: 'Group %' },
  { key: 'totalMarks', label: 'Total marks' },
  { key: 'result', label: '% / class / grade obtained' },
]

/* Passport photo: centre-cropped to the form's 110×136 box and downscaled, so the data URL stays small. */
const PHOTO_W = 330
const PHOTO_H = 408
const PHOTO_MAX_BYTES = 8 * 1024 * 1024
async function toPassportPhoto(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('unreadable'))
      i.src = url
    })
    const target = PHOTO_W / PHOTO_H
    let sw = img.naturalWidth
    let sh = img.naturalHeight
    if (sw / sh > target) sw = sh * target
    else sh = sw / target
    const canvas = document.createElement('canvas')
    canvas.width = PHOTO_W
    canvas.height = PHOTO_H
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('no canvas')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, PHOTO_W, PHOTO_H)
    ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, 0, PHOTO_W, PHOTO_H)
    return canvas.toDataURL('image/jpeg', 0.85)
  } finally {
    URL.revokeObjectURL(url)
  }
}

// Drafts stay in this browser only (never sent anywhere); Aadhaar is not saved.
const DRAFT_KEY = 'lbc-apply-draft'
function loadDraft(): Form {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null')
    return d ? { ...EMPTY, ...d, aadhaar: '' } : EMPTY
  } catch {
    return EMPTY
  }
}


/* Once submitted, this browser keeps the application number and the secret that lets it update that same application. */
type Receipt = { appNo: string; status: Status; submittedAt: string; updatedAt: string; revision: number }
type Submission = Receipt & { token: string; fingerprint: string }
const SUBMISSION_KEY = 'lbc-apply-submission'
function loadSubmission(): Submission | null {
  try {
    const s = JSON.parse(localStorage.getItem(SUBMISSION_KEY) ?? 'null')
    return s?.appNo && s?.token ? s : null
  } catch {
    return null
  }
}
function storeSubmission(s: Submission | null) {
  try {
    if (s) localStorage.setItem(SUBMISSION_KEY, JSON.stringify(s))
    else localStorage.removeItem(SUBMISSION_KEY)
  } catch {
    /* storage unavailable: the number is still shown on screen and on the PDF */
  }
}
/** Short fingerprint of the form, Aadhaar excluded, to tell whether it changed since it was sent. */
function fingerprint(f: Form) {
  const s = JSON.stringify({ ...f, aadhaar: '' })
  let a = 0x811c9dc5
  let b = 0
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    a = Math.imul(a ^ c, 16777619)
    b = (Math.imul(b ^ c, 2246822519) + i) | 0
  }
  return (a >>> 0).toString(36) + (b >>> 0).toString(36)
}
const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })

/** The form in steps; `keys` are the validation keys checked before leaving each step. */
const STEPS = [
  { title: 'Course & candidate', short: 'Candidate', keys: ['course', 'name', 'father', 'mother', 'caste'] },
  { title: 'Contact & entrance rank', short: 'Contact', keys: ['email', 'aadhaar', 'rank', 'phone', 'address'] },
  { title: 'Educational qualifications', short: 'Education', keys: ['qual0', 'qual1', 'qual2'] },
  { title: 'CET details', short: 'CET', keys: ['local', 'category'] },
  { title: 'Review & submit', short: 'Submit', keys: [] },
] as const
const LAST = STEPS.length - 1

function stepErrors(f: Form, s: number) {
  const all = validate(f)
  const keys: readonly string[] = STEPS[s].keys
  return Object.fromEntries(Object.entries(all).filter(([k]) => keys.includes(k))) as Partial<Record<string, string>>
}

const maskAadhaar =(a: string) => a.replace(/\s/g, '').replace(/^(\d{4})(\d{4})(\d{4})$/, '$1 $2 $3')

function summary(f: Form, appNo: string) {
  const q = f.quals
    .map((r, i) => `${i + 1}. ${QUAL_ROWS[i]}\n${QUAL_COLS.map((c) => `   ${c.label}: ${r[c.key] || '—'}`).join('\n')}`)
    .join('\n')
  return [
    'APPLICATION FOR ADMISSION — PG COLLEGE',
    'Dr. Lankapalli Bullayya College, Visakhapatnam',
    `Application No.: ${appNo}`,
    '',
    `1. Name of the course: ${f.course}`,
    `2. Name of the candidate: ${f.name}`,
    `3. Father's name: ${f.father}`,
    `4. Mother's name: ${f.mother}`,
    `5. Caste / sub caste: ${f.caste}`,
    `6. E-mail ID: ${f.email}`,
    `7. Aadhaar No.: ${maskAadhaar(f.aadhaar)}`,
    `8. Rank obtained (${f.rankExam}): ${f.rank}`,
    `9. Address & phone No.: ${f.address.replace(/\s*\n\s*/g, ', ')} · ${f.phone}`,
    '',
    '10. Educational qualifications:',
    q,
    '',
    'CET details:',
    `   Admission given into the course of: ${f.cetCourse || '—'}`,
    `   Hall Ticket No.: ${f.hallTicket || '—'}`,
    `   Rank No.: ${f.cetRank || f.rank}`,
    `   Local or Non-Local: ${f.local}`,
    `   Category: ${f.category}`,
    '',
    'Original certificates will be produced at the time of admission.',
  ].join('\n')
}

/* ----------------------------------------------------------------- fields */

const input =
  'mt-2 w-full rounded-2xl border border-navy/15 bg-white px-4 py-3 text-base text-navy outline-none transition focus:border-navy/40 focus:ring-4 focus:ring-gold/30 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-200'

function Field({ n, label, id, error, children, hint }: { n?: number; label: string; id: string; error?: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline gap-2 font-semibold text-navy">
        {n !== undefined && <span className="display text-gold">{n}.</span>}
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-sm text-slate">{hint}</p>}
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

/** Progress header: numbered steps joined by a gold line; finished steps can be revisited. */
function Stepper({ step, reachable, go }: { step: number; reachable: (i: number) => boolean; go: (i: number) => void }) {
  const reduce = useReducedMotion()
  return (
    <nav aria-label="Application progress" className="print:hidden">
      {/* phone: compact label + bar */}
      <div className="sm:hidden">
        <p className="flex items-baseline justify-between text-sm font-semibold text-navy">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-slate">{STEPS[step].title}</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy/10">
          <motion.div className="h-full rounded-full bg-gold" initial={false} animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }} />
        </div>
      </div>

      {/* tablet and up: full stepper */}
      <ol className="relative hidden grid-cols-5 sm:grid">
        <span aria-hidden="true" className="absolute top-6 right-[10%] left-[10%] h-[3px] rounded-full bg-navy/10" />
        <motion.span
          aria-hidden="true"
          className="absolute top-6 left-[10%] h-[3px] origin-left rounded-full bg-gold"
          style={{ width: '80%' }}
          initial={false}
          animate={{ scaleX: step / LAST }}
          transition={{ duration: reduce ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
        {STEPS.map((s, i) => {
          const done = i < step
          const current = i === step
          const can = !current && reachable(i)
          return (
            <li key={s.title} className="relative flex flex-col items-center text-center">
              <button
                type="button"
                disabled={!can}
                onClick={() => go(i)}
                aria-current={current ? 'step' : undefined}
                aria-label={`Step ${i + 1}: ${s.title}${done ? ' (completed)' : ''}`}
                className={`relative grid h-12 w-12 place-items-center rounded-full border-2 text-lg font-bold transition duration-300 ${
                  current
                    ? 'scale-110 border-gold bg-navy text-white shadow-[0_0_0_6px_rgb(214_173_96/0.25)]'
                    : done
                      ? 'border-navy bg-navy text-gold-2 hover:bg-royal'
                      : 'border-navy/15 bg-white text-slate'
                } ${can ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {done ? <Check className="h-5 w-5" aria-hidden="true" /> : i + 1}
              </button>
              <span className={`mt-3 text-sm font-semibold ${current ? 'text-navy' : 'text-slate'}`}>
                <span className="lg:hidden">{s.short}</span>
                <span className="hidden lg:inline">{s.title}</span>
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/* ------------------------------------------------------------------- page */

export default function Apply() {
  const reduce = useReducedMotion()
  const [f, setF] = useState<Form>(loadDraft)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const top = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const first = useRef(true)

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...f, aadhaar: '' }))
    } catch {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...f, aadhaar: '', photo: '' })) // too big? keep the rest
      } catch {
        /* storage unavailable — the form still works */
      }
    }
  }, [f])

  // On every step change after the first render: bring the form into view and move focus to the step title.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    top.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    const t = window.setTimeout(() => heading.current?.focus({ preventScroll: true }), reduce ? 0 : 380)
    return () => window.clearTimeout(t)
  }, [step, reduce])

  const clear = (k: string) => setErrors((p) => (p[k] ? { ...p, [k]: undefined } : p))
  const set =
    (k: keyof Form) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setF((p) => ({ ...p, [k]: e.target.value }))
      clear(k)
    }
  const setQual = (row: number, key: keyof Qual, value: string) => {
    setF((p) => ({ ...p, quals: p.quals.map((q, i) => (i === row ? { ...q, [key]: value } : q)) }))
    clear(`qual${row}`)
  }
  const err = (k: string) => (errors[k] ? { 'aria-invalid': true, 'aria-describedby': `${k}-err` } : {})

  const photoInput = useRef<HTMLInputElement>(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const onPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow choosing the same file again
    if (!file) return
    if (!file.type.startsWith('image/')) return setErrors((p) => ({ ...p, photo: 'Choose an image file (JPG or PNG).' }))
    if (file.size > PHOTO_MAX_BYTES) return setErrors((p) => ({ ...p, photo: 'That image is larger than 8 MB. Choose a smaller one.' }))
    setPhotoBusy(true)
    try {
      const photo = await toPassportPhoto(file)
      setF((p) => ({ ...p, photo }))
      clear('photo')
    } catch {
      setErrors((p) => ({ ...p, photo: 'That image could not be read. Try a JPG or PNG.' }))
    } finally {
      setPhotoBusy(false)
    }
  }

  const goTo = (i: number) => {
    setDir(i > step ? 1 : -1)
    setErrors({})
    setStep(i)
  }
  /** A step can be opened when every step before it is complete. */
  const reachable = (i: number) => Array.from({ length: i }, (_, s) => s).every((s) => Object.keys(stepErrors(f, s)).length === 0)

  const next = (e?: FormEvent) => {
    e?.preventDefault()
    const v = stepErrors(f, step)
    setErrors(v)
    if (Object.keys(v).length) {
      window.setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 30)
      return
    }
    goTo(step + 1)
  }

  /* ---- submission: the server assigns the application number; updates keep it */
  const [sub, setSub] = useState<Submission | null>(loadSubmission)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  // the Aadhaar last sent; kept in memory only, so after a reload the form counts as changed until saved again
  const [sentAadhaar, setSentAadhaar] = useState<string | null>(null)
  const keep = (s: Submission | null) => {
    setSub(s)
    storeSubmission(s)
  }
  const dirty = !!sub && (fingerprint(f) !== sub.fingerprint || sentAadhaar !== digits(f.aadhaar))
  const locked = !!sub && sub.status !== 'submitted'

  // refresh the status of an earlier submission (the college may have reviewed it)
  useEffect(() => {
    const s = loadSubmission()
    if (!s) return
    api<Receipt>(`/applications/${s.appNo}`, { token: s.token })
      .then((r) => {
        const cur = loadSubmission()
        if (cur?.appNo === r.appNo) keep({ ...cur, ...r })
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) keep(null) // no longer on the server
      })
  }, [])

  /** Shows server-side field errors on the first step that has one. */
  const showFieldErrors = (errs: Partial<Record<string, string>>) => {
    const i = STEPS.findIndex((s) => (s.keys as readonly string[]).some((k) => errs[k]))
    setDir(-1)
    setStep(i < 0 ? 0 : i)
    setErrors(errs)
  }

  const send = async () => {
    setSendError('')
    const all = validate(f)
    if (Object.keys(all).length) return showFieldErrors(all)
    setSending(true)
    try {
      const r = sub
        ? { ...sub, ...(await api<Receipt>(`/applications/${encodeURIComponent(sub.appNo)}`, { method: 'PUT', body: f, token: sub.token })) }
        : await api<Receipt & { token: string }>('/applications', { body: f })
      keep({ ...r, fingerprint: fingerprint(f) })
      setSentAadhaar(digits(f.aadhaar))
    } catch (e) {
      if (!(e instanceof ApiError)) throw e
      if (e.status === 422 && e.body.errors) showFieldErrors(e.body.errors)
      else if (e.status === 409 && sub) {
        keep({ ...sub, status: (e.body.status as Status) ?? 'under_review' })
        setSendError(e.message)
      } else if (e.status === 403 && sub) {
        keep(null)
        setSendError('This browser can no longer update that application. Submit again to get a new application number.')
      } else setSendError(e.message)
    } finally {
      setSending(false)
    }
  }

  const [busy, setBusy] = useState(false)
  const today = sub ? formatDate(sub.submittedAt) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const pdf = async () => {
    setBusy(true)
    try {
      await downloadPdf(`${sub?.appNo ?? 'LBC-application'}-${(f.name || 'candidate').trim().replace(/[^\w]+/g, '-')}.pdf`)
    } catch {
      window.print() // fall back to the browser's own Save as PDF
    } finally {
      setBusy(false)
    }
  }

  const errorCount = Object.values(errors).filter(Boolean).length
  const mailto = sub ? `mailto:${college.email}?subject=${encodeURIComponent(`Application ${sub.appNo} — ${f.course} — ${f.name}`)}&body=${encodeURIComponent(summary(f, sub.appNo))}` : ''

  const panels: ReactNode[] = [
    /* 1 — course & candidate */
    <div key="s0" className="grid gap-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <Field n={1} label="Name of the course" id="course" error={errors.course}>
          <select id="course" value={f.course} onChange={set('course')} className={input} {...err('course')}>
            <option value="">Select a course</option>
            {COURSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field n={2} label="Name of the candidate" id="name" error={errors.name} hint="As printed in your certificates.">
          <input id="name" autoComplete="name" value={f.name} onChange={set('name')} className={input} {...err('name')} />
        </Field>
      </div>
      <Field n={3} label="Father's name" id="father" error={errors.father}>
        <input id="father" value={f.father} onChange={set('father')} className={input} {...err('father')} />
      </Field>
      <Field n={4} label="Mother's name" id="mother" error={errors.mother}>
        <input id="mother" value={f.mother} onChange={set('mother')} className={input} {...err('mother')} />
      </Field>
      <Field n={5} label="Caste / sub caste" id="caste" error={errors.caste}>
        <input id="caste" value={f.caste} onChange={set('caste')} className={input} {...err('caste')} />
      </Field>
      <div className="md:col-span-2">
        <p id="photo-label" className="font-semibold text-navy">
          Passport-size photograph <span className="font-normal text-slate">(optional)</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-5">
          <div className="grid h-[136px] w-[110px] shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-dashed border-navy/20 bg-mist/60 text-sm font-semibold text-slate">
            {photoBusy ? (
              <Loader2 className="h-6 w-6 animate-spin text-navy" aria-hidden="true" />
            ) : f.photo ? (
              <img src={f.photo} alt="Your photograph" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-1">
                <Camera className="h-6 w-6" aria-hidden="true" /> Photo
              </span>
            )}
          </div>
          <div className="grid gap-2">
            <input ref={photoInput} id="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhoto} className="sr-only" aria-labelledby="photo-label" {...err('photo')} />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => photoInput.current?.click()} disabled={photoBusy} className="btn-outline disabled:opacity-60">
                <Upload className="h-4 w-4" aria-hidden="true" /> {f.photo ? 'Change photo' : 'Upload photo'}
              </button>
              {f.photo && (
                <button
                  type="button"
                  onClick={() => {
                    setF((p) => ({ ...p, photo: '' }))
                    clear('photo')
                  }}
                  className="btn !px-3 text-royal hover:text-navy"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
                </button>
              )}
            </div>
            {errors.photo ? (
              <p id="photo-err" className="text-sm font-semibold text-red-700">
                {errors.photo}
              </p>
            ) : (
              <p className="max-w-sm text-sm text-slate">A recent, front-facing photo, JPG or PNG. It’s cropped to passport size and printed on your form. It stays on this device.</p>
            )}
          </div>
        </div>
      </div>
    </div>,

    /* 2 — contact & rank */
    <div key="s1" className="grid gap-6 md:grid-cols-2">
      <Field n={6} label="E-mail ID" id="email" error={errors.email}>
        <input id="email" type="email" autoComplete="email" value={f.email} onChange={set('email')} className={input} {...err('email')} />
      </Field>
      <Field n={7} label="Aadhaar No." id="aadhaar" error={errors.aadhaar} hint="12 digits. Not saved on this device.">
        <input
          id="aadhaar"
          inputMode="numeric"
          autoComplete="off"
          maxLength={14}
          value={f.aadhaar}
          onChange={(e) => {
            setF((p) => ({ ...p, aadhaar: e.target.value.replace(/[^\d ]/g, '') }))
            clear('aadhaar')
          }}
          className={input}
          {...err('aadhaar')}
        />
      </Field>
      <Field n={8} label="Rank obtained (ICET / AUCET)" id="rank" error={errors.rank}>
        <div className="mt-2 flex gap-2">
          <select aria-label="Entrance test" value={f.rankExam} onChange={set('rankExam')} className={`${input} !mt-0 w-32`}>
            {EXAMS.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <input id="rank" inputMode="numeric" value={f.rank} onChange={set('rank')} className={`${input} !mt-0`} {...err('rank')} />
        </div>
      </Field>
      <Field n={9} label="Phone No." id="phone" error={errors.phone}>
        <input id="phone" type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} className={input} {...err('phone')} />
      </Field>
      <div className="md:col-span-2">
        <Field label="Address" id="address" error={errors.address}>
          <textarea id="address" rows={3} autoComplete="street-address" value={f.address} onChange={set('address')} className={input} {...err('address')} />
        </Field>
      </div>
    </div>,

    /* 3 — qualifications */
    <div key="s2" className="grid gap-6">
      {QUAL_ROWS.map((row, i) => (
        <div key={row} className="rounded-2xl border border-navy/10 bg-mist/60 p-5">
          <p className="display text-xl text-navy">
            {i + 1}. {row}
          </p>
          {errors[`qual${i}`] && (
            <p id={`qual${i}-err`} className="mt-1 text-sm font-semibold text-red-700">
              {errors[`qual${i}`]}
            </p>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUAL_COLS.map((c) => {
              const id = `q${i}-${c.key}`
              const required = c.key === 'passing' || c.key === 'result'
              const bad = !!errors[`qual${i}`] && required && !f.quals[i][c.key]
              return (
                <div key={c.key} className={`flex flex-col ${c.key === 'college' ? 'sm:col-span-2' : ''}`}>
                  <label htmlFor={id} className="pb-2 text-sm leading-snug font-semibold text-navy">
                    {c.label}
                    {required && <span className="text-gold"> *</span>}
                  </label>
                  <input
                    id={id}
                    value={f.quals[i][c.key]}
                    placeholder={c.hint}
                    onChange={(e) => setQual(i, c.key, e.target.value)}
                    className={`${input} !mt-auto !py-2.5 text-[15px]`}
                    aria-invalid={bad || undefined}
                    aria-describedby={bad ? `qual${i}-err` : undefined}
                  />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>,

    /* 4 — CET details */
    <div key="s3" className="grid gap-6 md:grid-cols-2">
      <Field label="Admission given into the course of" id="cetCourse">
        <input id="cetCourse" value={f.cetCourse} onChange={set('cetCourse')} className={input} />
      </Field>
      <Field label="Hall Ticket No." id="hallTicket">
        <input id="hallTicket" value={f.hallTicket} onChange={set('hallTicket')} className={input} />
      </Field>
      <Field label="Rank No." id="cetRank" hint="Leave blank to use the rank in field 8.">
        <input id="cetRank" inputMode="numeric" value={f.cetRank} onChange={set('cetRank')} className={input} />
      </Field>
      <fieldset>
        <legend className="font-semibold text-navy">Local or Non-Local</legend>
        <div className="mt-3 flex gap-3">
          {(['Local', 'Non-Local'] as const).map((v) => (
            <label key={v} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-5 font-semibold transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-gold/40 ${f.local === v ? 'border-navy bg-navy text-white' : 'border-navy/15 bg-white text-navy hover:border-navy/40'}`}>
              <input
                type="radio"
                name="local"
                value={v}
                checked={f.local === v}
                onChange={() => {
                  setF((p) => ({ ...p, local: v }))
                  clear('local')
                }}
                className="sr-only"
                aria-invalid={!!errors.local || undefined}
                aria-describedby={errors.local ? 'local-err' : undefined}
              />
              {v}
            </label>
          ))}
        </div>
        {errors.local && (
          <p id="local-err" className="mt-1.5 text-sm font-semibold text-red-700">
            {errors.local}
          </p>
        )}
      </fieldset>
      <fieldset className="md:col-span-2">
        <legend className="font-semibold text-navy">Category under which the candidate is applying</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <label key={c} className={`flex min-h-11 cursor-pointer items-center rounded-full border px-4 font-semibold transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-gold/40 ${f.category === c ? 'border-navy bg-navy text-white' : 'border-navy/15 bg-white text-navy hover:border-navy/40'}`}>
              <input
                type="radio"
                name="category"
                value={c}
                checked={f.category === c}
                onChange={() => {
                  setF((p) => ({ ...p, category: c }))
                  clear('category')
                }}
                className="sr-only"
                aria-invalid={!!errors.category || undefined}
                aria-describedby={errors.category ? 'category-err' : undefined}
              />
              {c}
            </label>
          ))}
        </div>
        {errors.category && (
          <p id="category-err" className="mt-1.5 text-sm font-semibold text-red-700">
            {errors.category}
          </p>
        )}
      </fieldset>
    </div>,

    /* 5 — review */
    <div key="s4">
      {!sub ? (
        /* not yet submitted */
        <div className="rounded-2xl border border-navy/10 bg-mist/60 p-5 sm:p-6">
          <p className="font-semibold text-navy">Check your details in the form below, then submit it to the college.</p>
          <p className="mt-1 text-slate">You’ll get an application number straight away. After that you can download, print or email your form.</p>
          <button type="button" onClick={send} disabled={sending} className="btn-gold mt-5 disabled:opacity-60">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />} {sending ? 'Submitting…' : 'Submit application'}
          </button>
        </div>
      ) : (
        /* submitted: the number stays with this application */
        <div className="rounded-2xl border border-gold/50 bg-[#fdf8ee] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 font-semibold text-royal">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" /> Application submitted on {formatDate(sub.submittedAt)}
              </p>
              <p className="mt-3 text-sm font-semibold tracking-wide text-slate uppercase">Application No.</p>
              <p className="display mt-1 text-3xl text-navy sm:text-4xl" aria-live="polite">
                {sub.appNo}
              </p>
            </div>
            <span className="rounded-full bg-navy px-4 py-1.5 text-sm font-semibold text-white">{STATUS_LABEL[sub.status]}</span>
          </div>
          <p className="mt-3 text-sm text-slate">Quote this number in any message to the college. It stays the same if you correct your details.</p>

          {dirty && !locked && (
            <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
              <p className="font-semibold text-amber-900">You’ve changed your details since you submitted.</p>
              <p className="mt-1 text-sm text-amber-900/80">Save the changes to application {sub.appNo} before you download or print it.</p>
              <button type="button" onClick={send} disabled={sending} className="btn-gold mt-4 disabled:opacity-60">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />} {sending ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          )}
          {dirty && locked && (
            <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
              The college has started reviewing this application, so changes can’t be saved online. Please contact the office at {college.email} with your application number.
            </div>
          )}
        </div>
      )}

      {sendError && (
        <p role="alert" className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4 font-semibold text-red-800">
          {sendError}
        </p>
      )}

      {sub && !dirty && (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={pdf} disabled={busy} className="btn-gold disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileDown className="h-4 w-4" aria-hidden="true" />} {busy ? 'Preparing PDF…' : 'Download PDF'}
            </button>
            <button type="button" onClick={() => window.print()} className="btn-navy">
              <Printer className="h-4 w-4" aria-hidden="true" /> Print
            </button>
            <a href={mailto} className="btn-outline">
              <Mail className="h-4 w-4" aria-hidden="true" /> Email to the college
            </a>
          </div>
          <p className="mt-3 text-sm text-slate">
            Print it, {f.photo ? '' : 'paste a passport photo, '}sign it and bring it with your original certificates. Email opens your mail app addressed to {college.email}
            {f.photo ? ' — attach the downloaded PDF there, since a mail link can’t carry your photo.' : '.'}
          </p>
        </>
      )}

      <div className="mt-8 rounded-2xl bg-mist p-3 sm:p-6">
        <SheetPreview>
          <ApplicationSheet f={f} date={today} appNo={sub?.appNo} />
        </SheetPreview>
      </div>
      <PrintRoot>
        <ApplicationSheet f={f} date={today} appNo={sub?.appNo} />
      </PrintRoot>
    </div>,
  ]

  return (
    <>
      <PageHero eyebrow="Admissions · PG College" title="Apply for admission" text="Five short steps. Submit online to get your application number, then print the form and bring it with your certificates." />
      <section className="bg-mist py-14">
        <div ref={top} className="container-x grid max-w-5xl scroll-mt-28 gap-8 lg:scroll-mt-40">
          <Stepper step={step} reachable={reachable} go={goTo} />

          <form noValidate onSubmit={next} className="card overflow-hidden p-6 sm:p-10 print:border-0 print:p-0 print:shadow-none">
            {errorCount > 0 && (
              <div role="alert" className="mb-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-800">
                Please correct the {errorCount} highlighted {errorCount === 1 ? 'field' : 'fields'} to continue.
              </div>
            )}
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.fieldset
                key={step}
                custom={dir}
                variants={{
                  enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 60 }),
                  center: { opacity: 1, x: 0 },
                  exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -60 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: reduce ? 0.01 : 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="min-w-0"
              >
                <legend className="sr-only">{STEPS[step].title}</legend>
                <h2 ref={heading} tabIndex={-1} className="display text-3xl outline-none sm:text-4xl">
                  {step === LAST ? 'Application for admission' : STEPS[step].title}
                </h2>
                {step === 2 && <p className="mt-2 text-slate">Enclose original certificates at the time of admission. Fields marked * are required.</p>}
                <div className="mt-8">{panels[step]}</div>
              </motion.fieldset>
            </AnimatePresence>

            <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-navy/10 pt-6 print:hidden">
              {step > 0 && (
                <button type="button" onClick={() => goTo(step - 1)} className="btn-outline">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {step === LAST ? 'Edit details' : 'Back'}
                </button>
              )}
              {step < LAST && (
                <button type="submit" className="btn-gold sm:ml-auto">
                  {step === LAST - 1 ? 'Review application' : `Next: ${STEPS[step + 1].short}`} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
              {step === LAST && (
                <button
                  type="button"
                  onClick={() => {
                    if (sub && !window.confirm(`Start a new application? This browser will stop showing application ${sub.appNo}. Note the number down first.`)) return
                    setF(EMPTY)
                    keep(null)
                    setSentAadhaar(null)
                    setSendError('')
                    goTo(0)
                  }}
                  className="btn !px-3 text-royal hover:text-navy sm:ml-auto"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" /> Start a new application
                </button>
              )}
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <p className="text-sm text-slate">Your draft is kept in this browser until you submit it. Submitted applications go securely to the college admissions office.</p>
            <a href={off('/static/PG-Admission-Application.docx')} className="btn !px-3 text-royal hover:text-navy" download>
              <FileDown className="h-4 w-4" aria-hidden="true" /> Printed form (.docx)
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
