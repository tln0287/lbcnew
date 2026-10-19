import { ExternalLink } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { officialUnavailable } from '../content/site'

type Props = Omit<ComponentProps<'a'>, 'href'> & {
  to?: string
  href?: string
  children: ReactNode
  /** show an external-link glyph for off-site destinations */
  showExternal?: boolean
}

/**
 * Internal routes use the router; official/external URLs open in a new tab
 * (documents) or the same tab (login/payment-style workflows stay intact).
 */
export function SmartLink({ to, href, children, showExternal = false, ...rest }: Props) {
  if (to) {
    return (
      <Link to={to} {...rest}>
        {children}
      </Link>
    )
  }
  const url = href ?? '#'
  const isDoc = url.startsWith('/docs/') || /\.(pdf|docx?|xlsx?)$/i.test(url) || url.includes('/static/') || url.includes('/media/')
  const external = /^https?:/.test(url) || isDoc
  const unavailable = officialUnavailable.has(url)
  return (
    <a
      href={url}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      title={unavailable ? 'Official page — the official server was not responding when this site was last checked' : rest.title}
      {...rest}
    >
      {children}
      {showExternal && external && <ExternalLink className="ml-1 inline h-3.5 w-3.5 opacity-60" aria-label={isDoc ? '(opens document)' : '(opens in new tab)'} />}
    </a>
  )
}
