import type { ReactNode } from 'react'
import type { Block } from '../lib/data'

/** Renders content extracted from official pages (headings, paragraphs, lists, tables). */
export function ContentBlocks({ blocks, skip = [] }: { blocks: Block[]; skip?: RegExp[] }) {
  const out: ReactNode[] = []
  let list: string[] = []
  const flush = (key: number) => {
    if (list.length) {
      out.push(
        <ul key={`ul-${key}`}>
          {list.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>,
      )
      list = []
    }
  }
  blocks.forEach((b, i) => {
    if (b.t !== 'table' && skip.some((r) => r.test(b.text))) return
    if (b.t === 'li') {
      list.push(b.text)
      return
    }
    flush(i)
    if (b.t === 'h') out.push(<h3 key={i}>{b.text}</h3>)
    else if (b.t === 'p') out.push(<p key={i}>{b.text}</p>)
    else if (b.t === 'table')
      out.push(
        <div key={i} className="mb-6 overflow-x-auto rounded-2xl border border-navy/10">
          <table className="w-full text-left text-sm">
            <tbody>
              {b.rows.map((r, ri) => (
                <tr key={ri} className={ri === 0 ? 'bg-navy text-white' : 'border-t border-navy/8 odd:bg-mist/50'}>
                  {r.map((c, ci) => (
                    <td key={ci} className={`px-4 py-2.5 align-top ${ri === 0 ? 'font-bold' : ''}`}>
                      {c.split(' · ').map((part, pi) => (
                        <span key={pi} className="block">
                          {part}
                        </span>
                      ))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
  })
  flush(blocks.length)
  return <div className="prose-lbc">{out}</div>
}
