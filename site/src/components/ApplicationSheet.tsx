import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/** Data the sheet needs; mirrors the Apply page form. */
export type SheetData = {
  course: string
  name: string
  father: string
  mother: string
  caste: string
  email: string
  aadhaar: string
  rankExam: string
  rank: string
  address: string
  phone: string
  quals: { college: string; university: string; passing: string; regNo: string; groupPct: string; totalMarks: string; result: string }[]
  cetCourse: string
  hallTicket: string
  cetRank: string
  local: string
  category: string
  /** Passport photo as a JPEG data URL, already cropped to the photo box's proportions. */
  photo?: string
}

/* Layout of the college's printed form (PG-Admission-Application.docx): A4, 0.5" margins, two pages. */
const PAGE_W = 794 // 210mm at 96dpi
const PAGE_H = 1123 // 297mm
const FORM_CATEGORIES = ['Open', 'SC', 'ST', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'EBC', 'PH', 'NSS', 'NCC']
const EXAM_ROWS = ['SSC / CBSE / Others', 'INTERMEDIATE', 'DEGREE B.A / B.Sc / B.Com']
const COURSE_ROWS = ['SSC', 'INTERMEDIATE', 'DEGREE']

const UNDERTAKING = [
  "The total fees as prescribed for each year of study for entire period of study shall be paid by me at the beginning of each academic year or as may be communicated from time to time by the management.",
  "Any upward revision or review in the fees prescribed as may be fixed from time to time by the State Govt. / APSCHE / Andhra University or any statutory body shall be paid by me during the entire course of study.",
  "The total 1st year course fees being Rs. __________ is herewith paid by me.",
  "75% of attendance is mandatory as per the guidelines given by the University / State Government. If the attendance is less then the student will not be allowed to sit for the final examinations during that semester.",
  "There will be Two Mid exams for each Semester. Average of the Two Mid Exams will be taken together to arrive at the final marks. As such attending of Two Mid Examinations is COMPULSORY.",
  "I / We further undertake that I will not withdraw admission of my son / daughter during the period of study enrolled and agree to abide by the rules of the management in force in the event of withdrawal.",
  "I / We are aware that failure to pay the prescribed fees would result in cancellation of admission any time during the period of study and the management reserves its right to initiate appropriate action at all times and the same shall be binding on us.",
  "I am signing this undertaking taking full responsibility on behalf of my ward for following the conditions stipulated above.",
]

const ink = '#111'
const cell = 'border border-black px-2 py-1 align-top'

function Line({ n, label, children }: { n: number; label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[28px_250px_14px_1fr] items-baseline py-[4px]">
      <span>{n}.</span>
      <span className="font-bold">{label}</span>
      <span className="font-bold">:</span>
      <span className="min-h-[20px] border-b border-dotted border-black pb-0.5 break-words">{children}</span>
    </div>
  )
}

function Kv({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[300px_14px_1fr] items-baseline py-[3px]">
      <span className="font-bold">{label}</span>
      <span className="font-bold">:</span>
      <span className="min-h-[20px] border-b border-dotted border-black pb-0.5">{children}</span>
    </div>
  )
}

function Signs({ left, right }: { left: string; right: string }) {
  return (
    <div className="mt-9 flex justify-between font-bold">
      <span>{left}</span>
      <span>{right}</span>
    </div>
  )
}

function Page({ children }: { children: ReactNode }) {
  return (
    <div className="sheet-page mx-auto bg-white shadow-[0_20px_50px_-20px_rgb(16_42_67/0.35)]" style={{ width: PAGE_W, minHeight: PAGE_H, padding: '34px 48px', color: ink, fontFamily: '"Times New Roman", Times, serif', fontSize: 13.5, lineHeight: 1.35 }}>
      {children}
    </div>
  )
}

/** The candidate's photo, or the printed form's "PHOTO" label when there is none or it cannot be shown. */
function PhotoBox({ src }: { src?: string }) {
  const [broken, setBroken] = useState<string | null>(null)
  if (!src || broken === src) return <>PHOTO</>
  return <img src={src} alt="Candidate photograph" onError={() => setBroken(src)} className="block h-full w-full object-cover" />
}

const blank = (v: string, w = 160) => (v ? v : <span className="inline-block" style={{ width: w }} />)

/** The two pages of the application, filled in. */
export function ApplicationSheet({ f, date, appNo }: { f: SheetData; date: string; appNo?: string }) {
  const aadhaar = f.aadhaar.replace(/\s/g, '').replace(/^(\d{4})(\d{4})(\d{4})$/, '$1 $2 $3')
  return (
    <div className="grid gap-8 print:block">
      {/* ------------------------------------------------------------- page 1 */}
      <Page>
        <div className="-mt-2 mb-2 flex justify-end">
          <p className="border border-black px-3 py-1 text-[14px]">
            <span className="font-bold">APPLICATION No.: </span>
            {appNo ? <span className="font-bold tracking-wide">{appNo}</span> : <span className="inline-block w-[150px]" />}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[21px] font-bold tracking-wide">Dr. LANKAPALLI BULLAYYA COLLEGE</p>
          <p className="font-bold">VISAKHAPATNAM-530013</p>
        </div>
        <p className="mt-3 text-justify font-bold underline underline-offset-4">APPLICATION FORM FOR ADMISSION INTO CONVENER / MANAGEMENT QUOTA INTO MCA / MBA / MA, MSc, MHRM &amp; M.COM.</p>

        <div className="mt-4 flex items-start justify-between gap-6">
          <div className="pt-6">
            <p>To</p>
            <p>The Secretary &amp; Correspondent,</p>
            <p>Dr. Lankapalli Bullayya College,</p>
            <p>Visakhapatnam-530013</p>
          </div>
          <div className="text-right">
            <p>
              <span className="font-bold">DATE:</span> {date}
            </p>
            <div className="mt-3 ml-auto grid h-[136px] w-[110px] place-items-center border border-black p-[2px] text-sm font-bold">
              <PhotoBox src={f.photo} />
            </div>
          </div>
        </div>

        <p className="mt-4">Dear Sir,</p>
        <p className="mt-2 text-justify indent-10">I request your good selves to kindly allot the admission in your College under Management / N.R.I quota as per details furnished by me as under.</p>

        <div className="mt-4">
          <Line n={1} label="NAME OF THE COURSE">{f.course}</Line>
          <Line n={2} label="NAME OF THE CANDIDATE">{f.name}</Line>
          <Line n={3} label="FATHER’S NAME">{f.father}</Line>
          <Line n={4} label="MOTHER’S NAME">{f.mother}</Line>
          <Line n={5} label="CASTE / SUB CASTE">{f.caste}</Line>
          <Line n={6} label="E-mail ID">{f.email}</Line>
          <Line n={7} label="AADHAR No.">{aadhaar}</Line>
          <Line n={8} label="RANK OBTAINED (ICET / AUCET)">{f.rank ? `${f.rank} (${f.rankExam})` : ''}</Line>
          <Line n={9} label="ADDRESS & PHONE No.">
            {f.address.replace(/\s*\n\s*/g, ', ')}
            {f.phone && <span className="whitespace-nowrap"> — Ph: {f.phone}</span>}
          </Line>
        </div>

        <p className="mt-5 font-bold">10. EDUCATIONAL QUALIFICATIONS :</p>
        <table className="mt-2 w-full border-collapse text-center">
          <thead>
            <tr className="font-bold">
              <th className={`${cell} w-[60px]`}>S.No.</th>
              <th className={cell}>COURSE</th>
              <th className={cell}>Month &amp; Year of Passing</th>
              <th className={cell}>Group %</th>
              <th className={cell}>Total Marks</th>
            </tr>
          </thead>
          <tbody>
            {COURSE_ROWS.map((r, i) => (
              <tr key={r}>
                <td className={cell}>{i + 1}.</td>
                <td className={`${cell} text-left font-bold`}>{r}</td>
                <td className={cell}>{f.quals[i]?.passing}</td>
                <td className={cell}>{f.quals[i]?.groupPct}</td>
                <td className={cell}>{f.quals[i]?.totalMarks}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Signs left="FACULTY-INCHARGE (Name & Signature)" right="SIGNATURE" />
        <hr className="mt-3 border-black" />
        <p className="mt-3 text-center font-bold underline underline-offset-4">FOR OFFICE USE</p>
        <p className="mt-3 font-bold">REMARKS:</p>
        <div className="mt-5 border-b border-dotted border-black" />
        <Signs left="PRINCIPAL" right="SECRETARY & CORRESPONDENT" />
        <hr className="mt-3 border-black" />
      </Page>

      {/* ------------------------------------------------------------- page 2 */}
      <Page>
        <div className="grid grid-cols-3 items-baseline">
          <span />
          <p className="text-center">(2)</p>
          <p className="text-right text-[12.5px]">{appNo && <span className="font-bold">Application No.: {appNo}</span>}</p>
        </div>
        <p className="mt-3 font-bold">
          11. EDUCATIONAL QUALIFICATIONS : <span className="font-normal">(Enclose Original Certificates)</span>
        </p>
        <table className="mt-2 w-full border-collapse text-center text-[12.5px] leading-snug">
          <thead>
            <tr className="font-bold">
              <th className={`${cell} w-[44px]`}>S.No.</th>
              <th className={cell}>Name of the Examination</th>
              <th className={cell}>Name of the College / Place and period of Study</th>
              <th className={cell}>Name of the University</th>
              <th className={cell}>Year and Month of Passing</th>
              <th className={cell}>Reg. No. of the Candidate</th>
              <th className={cell}>Percentage / Class / Grade Obtained</th>
            </tr>
          </thead>
          <tbody>
            {EXAM_ROWS.map((r, i) => (
              <tr key={r} className="h-[46px]">
                <td className={cell}>{i + 1}.</td>
                <td className={`${cell} font-bold`}>{r}</td>
                <td className={`${cell} break-words`}>{f.quals[i]?.college}</td>
                <td className={`${cell} break-words`}>{f.quals[i]?.university}</td>
                <td className={cell}>{f.quals[i]?.passing}</td>
                <td className={`${cell} break-all`}>{f.quals[i]?.regNo}</td>
                <td className={cell}>{f.quals[i]?.result}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-5 font-bold underline underline-offset-4">CET DETAILS:</p>
        <div className="mt-1">
          <Kv label="Admission given into the course of">{f.cetCourse}</Kv>
          <Kv label="Hall Ticket No">{f.hallTicket}</Kv>
          <Kv label="Rank No">{f.cetRank || f.rank}</Kv>
          <Kv label="Local or Non-Local">{f.local}</Kv>
        </div>
        <p className="mt-2">
          <span className="font-bold">Category under which the candidate is admitted : </span>
          {FORM_CATEGORIES.map((c, i) => (
            <span key={c}>
              <span className={c === f.category ? 'rounded-full border-[1.5px] border-black px-1.5 font-bold' : ''}>{c}</span>
              {i < FORM_CATEGORIES.length - 1 ? ' / ' : ''}
            </span>
          ))}
        </p>
        <Signs left="Head of the Department" right="Principal" />

        <p className="mt-5 text-center font-bold underline underline-offset-4">Undertaking by Parent / Guardian</p>
        <div className="mt-2 text-justify text-[12.5px] leading-[1.42]">
          <p>
            I <u className="px-1">{blank(f.father, 220)}</u> F/o <u className="px-1">{blank(f.name, 220)}</u> having secured admission for my son / daughter (Mr./Ms. <u className="px-1">{blank(f.name, 200)}</u>) under ‘B’ Category (Mgt) / ‘A’ Category (Convener) &amp; Spot admissions in Dr. L. Bullayya College (PG courses) in MBA / MCA / Maths / Eng / Microbiology / Biochemistry / Org. Chemistry / Analy. Chemistry / Bio-Tech / Comp. Science / MHRM / M.Com from the academic year ________ and having understood and agreed to terms of admission rules and fees prescribed for the respective course, undertake to abide by the following.
          </p>
          <ol className="mt-2 space-y-1">
            {UNDERTAKING.map((t, i) => (
              <li key={i} className="grid grid-cols-[24px_1fr]">
                <span>{i + 1}.</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>
        <Signs left="Signature of Applicant" right="Signature of Parent / Guardian" />
      </Page>
    </div>
  )
}

/** On-screen preview: the A4 pages scaled down to fit the available width. */
export function SheetPreview({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [h, setH] = useState(0)
  const [left, setLeft] = useState(0)
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (!outer.current || !inner.current) return
      const w = outer.current.clientWidth
      const s = Math.min(1, w / PAGE_W)
      setScale(s)
      setH(inner.current.offsetHeight * s)
      setLeft(Math.max(0, (w - PAGE_W * s) / 2)) // centre the pages when there is room to spare
    })
    if (outer.current) ro.observe(outer.current)
    if (inner.current) ro.observe(inner.current)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={outer} className="w-full overflow-hidden" style={{ height: h || undefined }}>
      <div ref={inner} style={{ width: PAGE_W, marginLeft: left, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  )
}

/** Unscaled copy outside the app root: the only thing printed, and the source for the PDF. */
export function PrintRoot({ children }: { children: ReactNode }) {
  return createPortal(<div id="print-root">{children}</div>, document.body)
}

/** Renders each page of #print-root to an A4 PDF and downloads it. */
export async function downloadPdf(fileName: string) {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas-pro')])
  await document.fonts.ready
  const pages = Array.from(document.querySelectorAll<HTMLElement>('#print-root .sheet-page'))
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  for (const [i, page] of pages.entries()) {
    const canvas = await html2canvas(page, { scale: 2, backgroundColor: '#ffffff', logging: false })
    const img = canvas.toDataURL('image/jpeg', 0.92)
    // fit to A4 width; if a page ran long, shrink it to fit the height
    let w = 210
    let hgt = (canvas.height / canvas.width) * w
    if (hgt > 297) {
      w = (297 / hgt) * w
      hgt = 297
    }
    if (i > 0) pdf.addPage()
    pdf.addImage(img, 'JPEG', (210 - w) / 2, 0, w, hgt)
  }
  pdf.save(fileName)
}
