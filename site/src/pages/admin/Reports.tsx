import { Download, Loader2, Printer } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { COURSES, STATUS_LABEL, STATUSES, type Status } from '../../lib/application'
import { BarList, ChartCard, ColumnChart, DataTable, fmt, pct, SERIES_1, SERIES_2, SplitBar, StackedBars, Stat, STATUS_COLOR } from './charts'
import { DrillPanel, type Drill } from './DrillPanel'
import { useAdminApi } from './session'

type Stats = {
  year: number
  years: { year: number; count: number }[]
  total: number
  counts: Record<Status, number>
  byCourse: ({ course: string; total: number } & Record<Status, number>)[]
  byCategory: { category: string; count: number; admitted: number }[]
  byLocal: { key: string; count: number }[]
  byExam: { key: string; count: number }[]
  daily: { day: string; count: number }[]
  rankBands: string[]
  ranks: { exam: string; bands: number[]; best: number | null; median: number | null }[]
  medianHoursToDecision: number | null
  withPhoto: number
  edited: number
}

const field = 'rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-[15px] text-navy outline-none transition focus:border-navy/40 focus:ring-4 focus:ring-gold/30'
const CATEGORY_ORDER = ['Open', 'SC', 'ST', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'EBC']

/** Rank band bounds, matching the server's RANK_BANDS. */
const RANK_BOUNDS: [number, number | null][] = [
  [1, 1000],
  [1001, 5000],
  [5001, 10000],
  [10001, 25000],
  [25001, 50000],
  [50001, null],
]

const dayMs = 86_400_000
const isoDay = (t: number) => new Date(t).toISOString().slice(0, 10)
const parseDay = (d: string) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10))
const dayLabel = (t: number, withYear = false) => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}), timeZone: 'UTC' })
const todayIST = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())

/** Daily counts with the gaps filled; switches to weekly bars when the period is long. */
function timeline(daily: Stats['daily'], year: number) {
  if (!daily.length) return { unit: 'day' as const, data: [] }
  const today = todayIST()
  const first = parseDay(daily[0].day)
  const lastData = parseDay(daily[daily.length - 1].day)
  const last = today.startsWith(String(year)) ? Math.max(lastData, parseDay(today)) : lastData
  const byDay = new Map(daily.map((d) => [parseDay(d.day), d.count]))
  const days = Math.round((last - first) / dayMs) + 1
  if (days <= 70) {
    return {
      unit: 'day' as const,
      data: Array.from({ length: days }, (_, i) => {
        const t = first + i * dayMs
        return { key: String(t), label: dayLabel(t), value: byDay.get(t) ?? 0 }
      }),
    }
  }
  // weeks starting Monday
  const monday = (t: number) => t - ((new Date(t).getUTCDay() + 6) % 7) * dayMs
  const start = monday(first)
  const weeks = Math.floor((monday(last) - start) / (7 * dayMs)) + 1
  const data = Array.from({ length: weeks }, (_, i) => ({ key: String(start + i * 7 * dayMs), label: `${dayLabel(start + i * 7 * dayMs)} · week`, value: 0 }))
  for (const [t, n] of byDay) data[Math.floor((monday(t) - start) / (7 * dayMs))].value += n
  return { unit: 'week' as const, data }
}

const duration = (h: number | null) => (h == null ? '–' : h < 48 ? `${Math.round(h)} h` : `${(h / 24).toFixed(1)} d`)

function downloadCsv(name: string, head: string[], rows: (string | number)[][]) {
  const cell = (v: string | number) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const blob = new Blob(['﻿' + [head, ...rows].map((r) => r.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  window.setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export default function Reports() {
  const call = useAdminApi()
  const [params, setParams] = useSearchParams()
  const year = params.get('year') ?? ''
  const course = params.get('course') ?? ''
  const [s, setS] = useState<Stats | null>(null)
  const [error, setError] = useState('')

  // the open drill-down lives in the URL, so Back from an application returns to it
  const drillQuery = params.get('drill')
  const drill: Drill | null = drillQuery ? { title: params.get('dt') ?? 'Applications', params: Object.fromEntries(new URLSearchParams(drillQuery)) } : null
  const openDrill = (title: string, extra: Record<string, string> = {}) => {
    if (!s) return
    const q = new URLSearchParams({ year: String(s.year), ...(course ? { course } : {}), ...extra })
    setParams((p) => {
      const n = new URLSearchParams(p)
      n.set('drill', q.toString())
      n.set('dt', title)
      return n
    })
  }
  const closeDrill = useCallback(
    () =>
      setParams(
        (p) => {
          const n = new URLSearchParams(p)
          n.delete('drill')
          n.delete('dt')
          return n
        },
        { replace: true },
      ),
    [setParams],
  )

  const setParam = (k: string, v: string) =>
    setParams(
      (p) => {
        const n = new URLSearchParams(p)
        if (v) n.set(k, v)
        else n.delete(k)
        return n
      },
      { replace: true },
    )

  useEffect(() => {
    let live = true
    const q = new URLSearchParams()
    if (year) q.set('year', year)
    if (course) q.set('course', course)
    call<Stats>(`/stats?${q}`)
      .then((r) => {
        if (!live) return
        setS(r)
        setError('')
      })
      .catch((e) => live && setError(e instanceof Error ? e.message : 'Could not load the reports.'))
    return () => {
      live = false
    }
  }, [call, year, course])

  // print this page (the site's print stylesheet otherwise prints only application forms)
  useEffect(() => {
    document.body.classList.add('print-app')
    return () => document.body.classList.remove('print-app')
  }, [])

  const line = useMemo(() => (s ? timeline(s.daily, s.year) : { unit: 'day' as const, data: [] }), [s])

  if (error)
    return (
      <p role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-5 font-semibold text-red-800">
        {error}
      </p>
    )
  if (!s)
    return (
      <div className="grid place-items-center py-24" role="status" aria-label="Loading reports">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    )

  const openPeriod = (key: string) => {
    const t = Number(key)
    const to = line.unit === 'day' ? t : t + 6 * dayMs
    openDrill(line.unit === 'day' ? `Received ${dayLabel(t, true)}` : `Received ${dayLabel(t)} – ${dayLabel(to, true)}`, { from: isoDay(t), to: isoDay(to) })
  }
  const periodRows = line.data.filter((d) => d.value)
  /** Opens a course-table cell: column 1 = all, 2–5 = one status; row past the courses = all courses. */
  const openCourseCell = (row: number, col: number) => {
    const c = s.byCourse[row]?.course
    const st = col >= 2 && col <= 5 ? STATUSES[col - 2] : undefined
    openDrill(`${c ?? 'All applications'}${st ? ` · ${STATUS_LABEL[st]}` : ''} · ${c ? s.year : scope}`, { ...(c ? { course: c } : {}), ...(st ? { status: st } : {}) })
  }

  const decided = s.counts.admitted + s.counts.rejected
  const pending = s.counts.submitted + s.counts.under_review
  const categories = [...s.byCategory].sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category))
  const peak = line.data.reduce((m, d) => (d.value > m.value ? d : m), { key: '', label: '', value: 0 })
  const courseRows = s.byCourse.map((c) => [c.course, c.total, c.submitted, c.under_review, c.admitted, c.rejected, pct(c.admitted, c.admitted + c.rejected)] as (string | number)[])
  const totalRow: (string | number)[] = ['All courses', s.total, s.counts.submitted, s.counts.under_review, s.counts.admitted, s.counts.rejected, pct(s.counts.admitted, decided)]
  const courseHead = ['Course', 'Applications', 'Submitted', 'Under review', 'Admitted', 'Not admitted', 'Admission rate']
  const scope = `${s.year}${course ? ` · ${course}` : ''}`

  return (
    <div key={`${s.year}-${course}`} className="grid gap-6">
      <DrillPanel drill={drill} onClose={closeDrill} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl text-navy sm:text-4xl">Admission reports</h1>
          <p className="mt-1 text-slate">
            PG applications received in {scope}. <span className="hidden print:inline">Printed {new Date().toLocaleString('en-IN')}.</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <label>
            <span className="sr-only">Year</span>
            <select value={year || String(s.year)} onChange={(e) => setParam('year', e.target.value)} className={field}>
              {s.years.map((y) => (
                <option key={y.year} value={y.year}>
                  {y.year} ({fmt(y.count)})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Course</span>
            <select value={course} onChange={(e) => setParam('course', e.target.value)} className={field}>
              <option value="">All courses</option>
              {COURSES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => window.print()} className="btn-navy">
            <Printer className="h-4 w-4" aria-hidden="true" /> Print
          </button>
        </div>
      </div>

      {/* headline numbers */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Applications"
          value={s.total}
          onClick={() => openDrill(`All applications · ${scope}`)}
          note={peak.value ? `Busiest ${line.unit}: ${peak.label.split(' · ')[0]} (${fmt(peak.value)})` : 'None received yet'}
        />
        <Stat
          label="Admitted"
          value={s.counts.admitted}
          delay={60}
          onClick={() => openDrill(`Admitted · ${scope}`, { status: 'admitted' })}
          note={decided ? `${pct(s.counts.admitted, decided)} of ${fmt(decided)} decided` : 'No decisions yet'}
        />
        <Stat
          label="Awaiting a decision"
          value={pending}
          delay={120}
          onClick={() => openDrill(`Awaiting a decision · ${scope}`, { status: 'submitted,under_review' })}
          note={`${fmt(s.counts.submitted)} new · ${fmt(s.counts.under_review)} under review`}
        />
        <Stat
          label="Median response time"
          value={duration(s.medianHoursToDecision)}
          delay={180}
          onClick={() => openDrill(`Decided · ${scope}`, { status: 'under_review,admitted,rejected' })}
          note="Submission to latest status change"
        />
      </div>

      {s.total === 0 ? (
        <p className="rounded-2xl border border-navy/10 bg-white p-10 text-center text-slate">No applications for {scope} yet.</p>
      ) : (
        <>
          <ChartCard
            title={line.unit === 'day' ? 'Applications per day' : 'Applications per week'}
            sub={`${dayLabel(Number(line.data[0]?.key), true)} – ${dayLabel(Number(line.data[line.data.length - 1]?.key), true)}`}
            table={<DataTable head={[line.unit === 'day' ? 'Date' : 'Week from', 'Applications']} rows={periodRows.map((d) => [d.label.split(' · ')[0], d.value])} onCell={(i) => openPeriod(periodRows[i].key)} />}
          >
            <ColumnChart
              data={line.data}
              label={`Applications per ${line.unit}`}
              onSelect={openPeriod}
            />
          </ChartCard>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <ChartCard title="Status" sub="Where every application stands now · click to list" delay={60}>
              <SplitBar
                parts={STATUSES.map((k) => ({ key: k, label: STATUS_LABEL[k], value: s.counts[k], color: STATUS_COLOR[k] }))}
                onSelect={(k, label) => openDrill(`${label} · ${scope}`, { status: k })}
              />
              <div className="mt-6 grid gap-5">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-navy">Local / Non-Local</h3>
                  <SplitBar
                    parts={['Local', 'Non-Local'].map((k, i) => ({ label: k, value: s.byLocal.find((x) => x.key === k)?.count ?? 0, color: i ? SERIES_2 : SERIES_1 }))}
                    onSelect={(k) => openDrill(`${k} candidates · ${scope}`, { local: k })}
                  />
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-navy">Entrance test</h3>
                  <SplitBar
                    parts={['ICET', 'AUCET'].map((k, i) => ({ label: k, value: s.byExam.find((x) => x.key === k)?.count ?? 0, color: i ? SERIES_2 : SERIES_1 }))}
                    onSelect={(k) => openDrill(`${k} candidates · ${scope}`, { exam: k })}
                  />
                </div>
                <p className="text-sm text-slate">
                  {fmt(s.withPhoto)} of {fmt(s.total)} uploaded a photo ({pct(s.withPhoto, s.total)}) · {fmt(s.edited)} corrected after submitting.
                </p>
              </div>
            </ChartCard>

            <ChartCard
              delay={100}
              title="Applications by category"
              sub="Hover for admissions in each category; click to list them"
              table={
                <DataTable
                  head={['Category', 'Applications', 'Admitted']}
                  rows={categories.map((c) => [c.category, c.count, c.admitted])}
                  onCell={(i, j) => openDrill(`${categories[i].category} category${j === 2 ? ' · Admitted' : ''} · ${scope}`, { category: categories[i].category, ...(j === 2 ? { status: 'admitted' } : {}) })}
                />
              }
            >
              <BarList
                data={categories.map((c) => ({ label: c.category, value: c.count }))}
                total={s.total}
                onSelect={(c) => openDrill(`${c} category · ${scope}`, { category: c })}
                extra={(label) => {
                  const c = categories.find((x) => x.category === label)
                  return c ? <span className="mt-1 block border-t border-navy/10 pt-1 text-slate">Admitted: <b className="text-navy">{fmt(c.admitted)}</b></span> : null
                }}
              />
            </ChartCard>
          </div>

          {!course && (
            <ChartCard title="Applications by course" sub="Split by current status · click a course or a coloured segment" delay={120} table={<DataTable head={courseHead} rows={[...courseRows, totalRow]} onCell={openCourseCell} />}>
              <StackedBars
                rows={s.byCourse.map((c) => ({ ...c, label: c.course }))}
                keys={STATUSES}
                labels={STATUS_LABEL}
                colors={STATUS_COLOR}
                onSelect={(c, k) => openDrill(`${c}${k ? ` · ${STATUS_LABEL[k]}` : ''} · ${s.year}`, { course: c, ...(k ? { status: k } : {}) })}
              />
            </ChartCard>
          )}

          <div className={`grid gap-6 ${s.ranks.length > 1 ? 'lg:grid-cols-2' : ''}`}>
            {s.ranks.map((r) => (
              <ChartCard
                key={r.exam}
                title={`${r.exam} rank distribution`}
                sub={`Best rank ${r.best != null ? fmt(r.best) : '–'} · median ${r.median != null ? fmt(r.median) : '–'}`}
                table={
                  <DataTable
                    head={['Rank band', 'Applicants']}
                    rows={s.rankBands.map((b, i) => [b, r.bands[i]])}
                    onCell={(i) => {
                      const [lo, hi] = RANK_BOUNDS[i]
                      openDrill(`${r.exam} rank ${s.rankBands[i]} · ${scope}`, { exam: r.exam, rankMin: String(lo), ...(hi ? { rankMax: String(hi) } : {}) })
                    }}
                  />
                }
              >
                <ColumnChart
                  data={s.rankBands.map((b, i) => ({ key: String(i), label: b, value: r.bands[i] }))}
                  label={`${r.exam} rank distribution`}
                  height={200}
                  tickEvery={1}
                  onSelect={(key, label) => {
                    const [lo, hi] = RANK_BOUNDS[Number(key)]
                    openDrill(`${r.exam} rank ${label} · ${scope}`, { exam: r.exam, rankMin: String(lo), ...(hi ? { rankMax: String(hi) } : {}) })
                  }}
                />
              </ChartCard>
            ))}
          </div>

          {/* the report table */}
          <ChartCard
            title="Course-wise report"
            sub={`Admission rate = admitted ÷ decided (admitted + not admitted) · ${scope}`}
            action={
              <button
                type="button"
                onClick={() => downloadCsv(`lbc-pg-course-report-${s.year}${course ? `-${course.replace(/\W+/g, '-')}` : ''}.csv`, courseHead, [...courseRows, totalRow])}
                className="btn-outline !min-h-10 print:hidden"
              >
                <Download className="h-4 w-4" aria-hidden="true" /> Download CSV
              </button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-navy/10 text-xs font-semibold tracking-wide text-slate uppercase">
                  <tr>
                    {courseHead.map((h, i) => (
                      <th key={h} className={`py-2.5 pr-4 ${i ? 'pr-6 text-right' : ''}`}>
                        {i >= 2 && i <= 5 && <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-[3px] align-middle" style={{ background: STATUS_COLOR[STATUSES[i - 2]] }} aria-hidden="true" />}
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {courseRows.map((r) => (
                    <tr key={r[0]} className="hover:bg-gold/5">
                      {r.map((c, j) => (
                        <td key={j} className={`py-1.5 pr-4 ${j ? 'text-right tabular-nums' : 'font-semibold text-navy'}`}>
                          <CellLink value={c} onClick={j >= 1 && j <= 5 ? () => openDrill(`${r[0]}${j > 1 ? ` · ${STATUS_LABEL[STATUSES[j - 2]]}` : ''} · ${s.year}`, { course: String(r[0]), ...(j > 1 ? { status: STATUSES[j - 2] } : {}) }) : undefined} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-navy/15 font-semibold text-navy">
                  <tr>
                    {totalRow.map((c, j) => (
                      <td key={j} className={`py-1.5 pr-4 ${j ? 'text-right tabular-nums' : ''}`}>
                        <CellLink value={c} onClick={j >= 1 && j <= 5 ? () => openDrill(`${j > 1 ? STATUS_LABEL[STATUSES[j - 2]] : 'All applications'} · ${scope}`, j > 1 ? { status: STATUSES[j - 2] } : {}) : undefined} />
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          </ChartCard>
        </>
      )}
    </div>
  )
}

/** A table number that opens the matching applications (0 and text stay plain). */
function CellLink({ value, onClick }: { value: string | number; onClick?: () => void }) {
  const text = typeof value === 'number' ? fmt(value) : value
  if (!onClick || value === 0) return <span className="inline-block py-1">{text}</span>
  return (
    <button
      type="button"
      onClick={onClick}
      className="-mr-2 rounded-lg px-2 py-1 font-[inherit] text-royal underline-offset-4 hover:bg-gold/15 hover:underline focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
    >
      {text}
    </button>
  )
}
