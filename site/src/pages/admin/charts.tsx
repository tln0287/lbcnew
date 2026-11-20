import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react'

/*
 * Small chart kit for the admissions reports.
 * Colours are validated (dataviz validate_palette.js, light surface): the status order
 * blue / yellow / aqua / violet passes every check; yellow and aqua sit below 3:1 contrast,
 * so every chart pairs colour with a legend, hover values and a data table.
 */

export const SERIES_1 = '#2a78d6'
export const SERIES_2 = '#eb6834'
export const STATUS_COLOR = {
  submitted: '#2a78d6',
  under_review: '#eda100',
  admitted: '#1baf7a',
  rejected: '#6250d6',
} as const

const nf = new Intl.NumberFormat('en-IN')
export const fmt = (n: number) => nf.format(n)
export const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : '–')

/* ------------------------------------------------------------- tooltip */

type Tip = { x: number; y: number; w: number; body: ReactNode } | null

/** Hover tooltip positioned inside a relative container. */
function useTip() {
  const box = useRef<HTMLDivElement>(null)
  const [tip, setTip] = useState<Tip>(null)
  const show = (e: { clientX: number; clientY: number } | { currentTarget: Element }, body: ReactNode) => {
    const r = box.current?.getBoundingClientRect()
    if (!r) return
    let x: number
    let y: number
    if ('clientX' in e) {
      x = e.clientX - r.left
      y = e.clientY - r.top
    } else {
      // keyboard focus: anchor to the mark
      const m = e.currentTarget.getBoundingClientRect()
      x = m.left + m.width / 2 - r.left
      y = m.top - r.top
    }
    setTip({ x, y, w: r.width, body })
  }
  const hide = () => setTip(null)
  const node = tip && (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 min-w-36 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-xl border border-navy/10 bg-white px-3 py-2 text-[13px] text-navy shadow-[0_10px_30px_-10px_rgb(16_42_67/0.35)]"
      style={{ left: Math.max(70, Math.min(tip.x, tip.w - 70)), top: tip.y }}
    >
      {tip.body}
    </div>
  )
  return { box, show, hide, node }
}

function TipRow({ color, label, value }: { color?: string; label: string; value: ReactNode }) {
  return (
    <span className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-1.5 text-slate">
        {color && <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />}
        {label}
      </span>
      <span className="font-semibold tabular-nums">{value}</span>
    </span>
  )
}

/* -------------------------------------------------------------- legend */

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[4px]" style={{ background: i.color }} aria-hidden="true" />
          {i.label}
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------ card shell */

/** Chart card with a title, optional subtitle and a "View data" table for screen readers and exact numbers. */
export function ChartCard({ title, sub, children, table, action, delay = 0 }: { title: string; sub?: string; children: ReactNode; table?: ReactNode; action?: ReactNode; delay?: number }) {
  return (
    <section className="viz-rise flex min-w-0 flex-col rounded-2xl border border-navy/10 bg-white p-5 break-inside-avoid sm:p-6" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-navy">{title}</h2>
          {sub && <p className="mt-0.5 text-sm text-slate">{sub}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4 flex-1">{children}</div>
      {table && (
        <details className="mt-4 text-sm print:hidden">
          <summary className="cursor-pointer font-semibold text-royal">View data</summary>
          <div className="mt-2 overflow-x-auto">{table}</div>
        </details>
      )}
    </section>
  )
}

/** Data table; with `onCell`, every non-zero count opens the applications behind it. */
export function DataTable({ head, rows, onCell }: { head: string[]; rows: (string | number)[][]; onCell?: (row: number, col: number) => void }) {
  return (
    <table className="w-full text-left text-sm">
      <thead className="text-xs text-slate uppercase">
        <tr>
          {head.map((h, i) => (
            <th key={h} className={`py-1.5 pr-3 font-semibold ${i ? 'text-right' : ''}`}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-navy/5">
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j} className={`py-1 pr-3 ${j ? 'text-right tabular-nums' : 'text-navy'}`}>
                {onCell && j > 0 && typeof c === 'number' && c > 0 ? (
                  <button
                    type="button"
                    onClick={() => onCell(i, j)}
                    aria-label={`${c} — ${r[0]}, ${head[j]}. Show applications`}
                    className="-mr-2 rounded-lg px-2 py-0.5 font-semibold text-royal underline-offset-4 hover:bg-gold/15 hover:underline focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
                  >
                    {fmt(c)}
                  </button>
                ) : (
                  <span className="inline-block py-0.5">{typeof c === 'number' ? fmt(c) : c}</span>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/* ----------------------------------------------------- column chart (time) */

/** Rendered width of an element, so SVG text stays at its real pixel size instead of scaling. */
function useWidth(ref: RefObject<HTMLElement | null>, initial = 640) {
  const [w, setW] = useState(initial)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setW(Math.max(240, Math.round(el.clientWidth))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return w
}

const niceMax = (v: number) => {
  if (v <= 4) return 4
  const p = 10 ** Math.floor(Math.log10(v))
  const n = v / p
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p
}

/** Keyboard activation for non-button marks (Enter / Space). */
const activate = (fn?: () => void) => (e: KeyboardEvent) => {
  if (fn && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault()
    fn()
  }
}
const Hint = () => <span className="mt-1.5 block border-t border-navy/10 pt-1 text-xs text-royal">Click to see applications</span>

/** Vertical bars over time (or any ordered categories), one series. */
export function ColumnChart({
  data,
  label,
  height = 220,
  color = SERIES_1,
  tickEvery,
  onSelect,
}: {
  data: { key: string; label: string; value: number }[]
  label: string
  height?: number
  color?: string
  tickEvery?: number
  onSelect?: (key: string, label: string) => void
}) {
  const { box, show, hide, node } = useTip()
  const W = useWidth(box)
  const max = niceMax(Math.max(1, ...data.map((d) => d.value)))
  const H = height
  const L = 34
  const B = 26
  const T = 8
  const plotW = W - L - 4
  const plotH = H - B - T
  const step = plotW / Math.max(1, data.length)
  const bw = Math.max(2, Math.min(28, step - 2)) // 2px surface gap between bars
  const ticks = [0, max / 2, max]
  // label every bar only when the labels fit; otherwise thin them out
  const every = Math.max(tickEvery ?? 1, Math.ceil(data.length / Math.max(1, Math.floor(plotW / 64))))
  const y = (v: number) => T + plotH - (v / max) * plotH
  const id = useId()

  return (
    <div ref={box} className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-labelledby={id} onMouseLeave={hide}>
        <title id={id}>{label}</title>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W} y1={y(t)} y2={y(t)} stroke="#102a43" strokeOpacity={t === 0 ? 0.25 : 0.08} />
            <text x={L - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill="#5b6b7b">
              {fmt(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = L + i * step + (step - bw) / 2
          const h = Math.max(0, y(0) - y(d.value))
          const r = Math.min(4, bw / 2, h)
          const can = !!onSelect && d.value > 0
          const tip = (
            <>
              <TipRow label={d.label} value={fmt(d.value)} />
              {can && <Hint />}
            </>
          )
          const pick = can ? () => onSelect(d.key, d.label) : undefined
          return (
            <g key={d.key}>
              {d.value > 0 && (
                <path
                  d={`M${x},${y(0)} V${y(0) - h + r} Q${x},${y(0) - h} ${x + r},${y(0) - h} H${x + bw - r} Q${x + bw},${y(0) - h} ${x + bw},${y(0) - h + r} V${y(0)} Z`}
                  fill={color}
                  className="viz-grow-y"
                  style={{ animationDelay: `${Math.min(i * (600 / Math.max(1, data.length)), 600)}ms` }}
                />
              )}
              {/* hit target: the full column, wider than the bar */}
              <rect
                x={L + i * step}
                y={T}
                width={step}
                height={plotH}
                fill="transparent"
                tabIndex={0}
                role={can ? 'button' : undefined}
                aria-label={`${d.label}: ${d.value}${can ? '. Show applications' : ''}`}
                onMouseMove={(e) => show(e, tip)}
                onFocus={(e) => show(e, tip)}
                onBlur={hide}
                onClick={pick}
                onKeyDown={activate(pick)}
                className={`outline-none focus-visible:fill-gold/20 hover:fill-navy/5 ${can ? 'cursor-pointer' : 'cursor-default'}`}
              />
              {i % every === 0 && (
                <text
                  x={Math.min(L + i * step + step / 2, W - 2)}
                  y={H - 8}
                  textAnchor={L + i * step + step / 2 > W - 30 ? 'end' : 'middle'}
                  fontSize="11"
                  fill="#5b6b7b"
                  pointerEvents="none"
                >
                  {d.label.split(' · ')[0]}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      {node}
    </div>
  )
}

/* --------------------------------------------------- horizontal bar list */

/** Ranked horizontal bars, one series, value and share at the end of each row. */
export function BarList({
  data,
  total,
  color = SERIES_1,
  extra,
  onSelect,
}: {
  data: { label: string; value: number }[]
  total: number
  color?: string
  extra?: (label: string) => ReactNode
  onSelect?: (label: string) => void
}) {
  const { box, show, hide, node } = useTip()
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div ref={box} className="relative">
      <ul className="grid gap-1">
        {data.map((d, i) => {
          const can = !!onSelect && d.value > 0
          const body = (
            <>
              <TipRow label={d.label} value={fmt(d.value)} />
              <TipRow label="Share" value={pct(d.value, total)} />
              {extra?.(d.label)}
              {can && <Hint />}
            </>
          )
          const pick = can ? () => onSelect(d.label) : undefined
          return (
            <li
              key={d.label}
              tabIndex={0}
              role={can ? 'button' : undefined}
              onMouseMove={(e) => show(e, body)}
              onMouseLeave={hide}
              onFocus={(e) => show(e, body)}
              onBlur={hide}
              onClick={pick}
              onKeyDown={activate(pick)}
              className={`grid grid-cols-[minmax(5rem,9rem)_1fr_auto] items-center gap-3 rounded-lg px-1.5 py-1 outline-none focus-visible:ring-2 focus-visible:ring-gold ${can ? 'cursor-pointer hover:bg-gold/10' : ''}`}
            >
              <span className="truncate text-sm text-navy" title={d.label}>
                {d.label}
              </span>
              <span className="h-3 rounded-r-[4px] bg-navy/[0.04]">
                <span className="viz-grow-x viz-width block h-full rounded-r-[4px]" style={{ width: `${(d.value / max) * 100}%`, background: color, minWidth: d.value ? 3 : 0, animationDelay: `${i * 50}ms` }} />
              </span>
              <span className="w-20 text-right text-sm tabular-nums text-navy">
                {fmt(d.value)} <span className="text-slate">· {pct(d.value, total)}</span>
              </span>
            </li>
          )
        })}
      </ul>
      {node}
    </div>
  )
}

/* ------------------------------------------------- stacked horizontal bars */

/** One bar per row, split into ordered segments with 2px gaps; legend above, values on hover. Click a segment or the row. */
export function StackedBars<K extends string>({
  rows,
  keys,
  labels,
  colors,
  onSelect,
}: {
  rows: ({ label: string; total: number } & Record<K, number>)[]
  keys: readonly K[]
  labels: Record<K, string>
  colors: Record<K, string>
  onSelect?: (row: string, key?: K) => void
}) {
  const { box, show, hide, node } = useTip()
  const max = Math.max(1, ...rows.map((r) => r.total))
  return (
    <div ref={box} className="relative">
      <Legend items={keys.map((k) => ({ label: labels[k], color: colors[k] }))} />
      <ul className="mt-4 grid gap-1">
        {rows.map((r, ri) => {
          const body = (focus?: K) => (
            <>
              <span className="mb-1 block font-semibold">{r.label}</span>
              {keys.map((k) => (
                <span key={k} className={focus && focus !== k ? 'opacity-45' : ''}>
                  <TipRow color={colors[k]} label={labels[k]} value={fmt(r[k])} />
                </span>
              ))}
              <span className="mt-1 block border-t border-navy/10 pt-1">
                <TipRow label="Total" value={fmt(r.total)} />
              </span>
              {onSelect && <span className="mt-1 block text-xs text-royal">{focus ? `Click to see ${labels[focus].toLowerCase()} applications` : 'Click to see applications'}</span>}
            </>
          )
          const pickRow = onSelect ? () => onSelect(r.label) : undefined
          return (
            <li
              key={r.label}
              tabIndex={0}
              role={onSelect ? 'button' : undefined}
              aria-label={`${r.label}: ${keys.map((k) => `${labels[k]} ${r[k]}`).join(', ')}`}
              onMouseMove={(e) => show(e, body())}
              onMouseLeave={hide}
              onFocus={(e) => show(e, body())}
              onBlur={hide}
              onClick={pickRow}
              onKeyDown={activate(pickRow)}
              className={`grid grid-cols-[1fr_2.5rem] items-center gap-x-3 gap-y-1 rounded-lg px-1.5 py-1 outline-none focus-visible:ring-2 focus-visible:ring-gold sm:grid-cols-[minmax(6rem,13rem)_1fr_2.5rem] ${onSelect ? 'cursor-pointer hover:bg-gold/10' : ''}`}
            >
              <span className="col-span-2 truncate text-sm text-navy sm:col-span-1" title={r.label}>
                {r.label}
              </span>
              <span className="viz-grow-x viz-width flex h-4 gap-[2px]" style={{ width: `${(r.total / max) * 100}%`, animationDelay: `${ri * 60}ms` }}>
                {keys
                  .filter((k) => r[k] > 0)
                  .map((k, i, arr) => (
                    <span
                      key={k}
                      onMouseMove={(e) => {
                        e.stopPropagation()
                        show(e, body(k))
                      }}
                      onClick={(e) => {
                        if (!onSelect) return
                        e.stopPropagation()
                        onSelect(r.label, k)
                      }}
                      className={`h-full transition-opacity hover:opacity-80 ${i === arr.length - 1 ? 'rounded-r-[4px]' : ''}`}
                      style={{ flexGrow: r[k], flexBasis: 0, minWidth: 3, background: colors[k] }}
                    />
                  ))}
              </span>
              <span className="text-right text-sm font-semibold tabular-nums text-navy">{fmt(r.total)}</span>
            </li>
          )
        })}
      </ul>
      {node}
    </div>
  )
}

/* ---------------------------------------------------- two-part split bar */

/** A share of a whole split a few ways, each part labelled directly; parts can be clicked. */
export function SplitBar({ parts, onSelect }: { parts: { key?: string; label: string; value: number; color: string }[]; onSelect?: (key: string, label: string) => void }) {
  const total = parts.reduce((a, p) => a + p.value, 0)
  if (!total) return <p className="text-sm text-slate">No data yet.</p>
  const pick = (p: (typeof parts)[number]) => (onSelect && p.value > 0 ? () => onSelect(p.key ?? p.label, p.label) : undefined)
  return (
    <div>
      <div className="viz-grow-x flex h-4 gap-[2px]">
        {parts
          .filter((p) => p.value > 0)
          .map((p, i, arr) => (
            <span
              key={p.label}
              title={`${p.label}: ${p.value}${onSelect ? ' (click to see applications)' : ''}`}
              onClick={pick(p)}
              className={`h-full transition-opacity ${onSelect ? 'cursor-pointer hover:opacity-80' : ''} ${i === 0 ? 'rounded-l-[4px]' : ''} ${i === arr.length - 1 ? 'rounded-r-[4px]' : ''}`}
              style={{ flexGrow: p.value, flexBasis: 0, background: p.color }}
            />
          ))}
      </div>
      <ul className="mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1">
        {parts.map((p) => {
          const content = (
            <>
              <span className="h-3 w-3 rounded-[4px]" style={{ background: p.color }} aria-hidden="true" />
              <span className="text-slate">{p.label}</span>
              <span className="font-semibold tabular-nums text-navy">
                {fmt(p.value)} · {pct(p.value, total)}
              </span>
            </>
          )
          const fn = pick(p)
          return (
            <li key={p.label}>
              {fn ? (
                <button type="button" onClick={fn} className="-mx-1.5 flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-sm hover:bg-gold/10 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none">
                  {content}
                </button>
              ) : (
                <span className="flex items-center gap-1.5 py-1 text-sm">{content}</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------ stat tile */

export function Stat({ label, value, note, onClick, delay = 0 }: { label: string; value: ReactNode; note?: ReactNode; onClick?: () => void; delay?: number }) {
  const inner = (
    <>
      <span className="block text-sm font-semibold text-slate">{label}</span>
      <span className="display mt-1 block text-3xl text-navy tabular-nums sm:text-4xl">{typeof value === 'number' ? <CountUp value={value} /> : value}</span>
      {note && <span className="mt-1 block text-xs text-slate">{note}</span>}
    </>
  )
  const cls = 'viz-rise rounded-2xl border border-navy/10 bg-white p-4 text-left sm:p-5'
  const style = { animationDelay: `${delay}ms` }
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={`${cls} transition-[border-color,box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-[0_14px_30px_-18px_rgb(16_42_67/0.45)] focus-visible:ring-4 focus-visible:ring-gold/40 focus-visible:outline-none`}
    >
      {inner}
    </button>
  ) : (
    <div className={cls} style={style}>
      {inner}
    </div>
  )
}

/** Counts up to `value` (eased); shows it at once when the viewer prefers reduced motion. */
export function CountUp({ value, ms = 900 }: { value: number; ms?: number }) {
  const [shown, setShown] = useState(value)
  const from = useRef(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      from.current = value
      setShown(value)
      return
    }
    const start = performance.now()
    const a = from.current
    let raf = 0
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / ms)
      const e = 1 - (1 - k) ** 3
      setShown(Math.round(a + (value - a) * e))
      if (k < 1) raf = requestAnimationFrame(tick)
      else from.current = value
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])
  return <>{fmt(shown)}</>
}
