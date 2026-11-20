import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, CreditCard, LogIn, Mail, Phone, Search, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type Dispatch, type KeyboardEvent, type MutableRefObject, type SetStateAction } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { college, off, PAYMENT_URL, primaryNav, secondaryNav, type NavItem, type NavLink } from '../content/site'
import { Icon } from './Icon'
import { SmartLink } from './SmartLink'

const LOGIN_URL = off('/ugcollege/login')

function isActive(item: NavLink, pathname: string) {
  if (!item.to) return false
  const path = item.to.split(/[?#]/)[0]
  return path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(path + '/')
}

/** Arrow keys move between links inside an open menu; Home/End jump. */
function onMenuKeys(e: KeyboardEvent<HTMLElement>) {
  const links = Array.from(e.currentTarget.querySelectorAll<HTMLAnchorElement>('a[href]'))
  const i = links.indexOf(document.activeElement as HTMLAnchorElement)
  const go = (n: number) => {
    e.preventDefault()
    links[(n + links.length) % links.length]?.focus()
  }
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') go(i + 1)
  else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') go(i - 1)
  else if (e.key === 'Home') go(0)
  else if (e.key === 'End') go(links.length - 1)
}

/* ------------------------------------------------------------- desktop menu */

function MenuPanel({ item, compact, onNavigate }: { item: NavItem; compact?: boolean; onNavigate: () => void }) {
  const groups = item.groups ?? []
  if (compact) {
    return (
      <div className="min-w-60 rounded-[22px] border border-navy/10 bg-white p-2 shadow-[var(--shadow-raised)]" onKeyDown={onMenuKeys}>
        {groups.map((g) => (
          <div key={g.title}>
            {groups.length > 1 && <p className="px-3 pt-2 pb-1 text-xs font-semibold text-royal">{g.title}</p>}
            <ul className={g.links.length > 8 ? 'grid w-80 grid-cols-2 gap-x-1' : ''}>
              {g.links.map((l) => (
                <li key={l.label}>
                  <SmartLink to={l.to} href={l.href} onClick={onNavigate} showExternal className="block rounded-xl px-3 py-2 text-sm font-semibold text-navy hover:bg-mist hover:text-royal focus-visible:bg-mist">
                    {l.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="overflow-hidden rounded-[28px] border border-navy/10 bg-white shadow-[var(--shadow-raised)]" onKeyDown={onMenuKeys}>
      <div className="flex">
        <div className={`grid flex-1 gap-8 p-8 ${groups.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {groups.map((g) => (
            <div key={g.title}>
              <p className="mb-3 border-b border-navy/8 pb-2 text-sm font-semibold text-royal">{g.title}</p>
              <ul className="grid gap-1">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <SmartLink to={l.to} href={l.href} onClick={onNavigate} className="group flex items-start gap-3 rounded-2xl px-2.5 py-2 transition hover:bg-mist focus-visible:bg-mist">
                      {l.icon && (
                        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy/5 text-navy transition group-hover:bg-navy group-hover:text-gold">
                          <Icon name={l.icon} className="h-4 w-4" />
                        </span>
                      )}
                      <span>
                        <span className="block text-sm font-bold text-navy group-hover:text-royal">{l.label}</span>
                        {l.desc && <span className="block text-xs leading-snug text-slate">{l.desc}</span>}
                      </span>
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {item.feature && (
          <Link to={item.feature.to} onClick={onNavigate} className="group relative hidden w-72 shrink-0 overflow-hidden bg-navy xl:block">
            <img src={item.feature.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="display text-2xl">{item.feature.title}</p>
              <p className="mt-1 text-sm text-white/80">{item.feature.text}</p>
              <span className="mt-3 inline-block text-sm font-bold text-gold-2">Explore →</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}

function DesktopItem({
  item,
  open,
  setOpen,
  timer,
  solid,
  tier,
}: {
  item: NavItem
  open: string | null
  setOpen: Dispatch<SetStateAction<string | null>>
  /** one timer shared by all items, so moving between items never closes the new menu */
  timer: MutableRefObject<number | undefined>
  solid: boolean
  tier: 'primary' | 'secondary'
}) {
  const { pathname } = useLocation()
  const id = useId()
  const reduce = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const key = tier + item.label
  const isOpen = open === key
  const active = isActive(item, pathname) || item.groups?.some((g) => g.links.some((l) => isActive(l, pathname)))
  const compact = tier === 'secondary'

  const enter = () => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(key), 90)
  }
  const leave = () => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen((cur) => (cur === key ? null : cur)), 160)
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(null)
    if (e.key === 'ArrowDown' && item.groups && !isOpen) {
      e.preventDefault()
      setOpen(key)
      window.setTimeout(() => panelRef.current?.querySelector<HTMLAnchorElement>('a[href]')?.focus(), 60)
    }
  }

  const base =
    tier === 'primary'
      ? `relative inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-2 text-[13.5px] font-bold transition 2xl:px-3.5 ${
          solid ? 'text-navy hover:text-royal' : 'text-white hover:text-gold-2'
        }`
      : item.to === '/apply'
        ? 'inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-gold/15 px-3 py-1 text-[12.5px] font-bold text-gold-2 ring-1 ring-gold/40 transition hover:bg-gold hover:text-navy'
        : 'inline-flex items-center gap-1 whitespace-nowrap px-2 py-1.5 text-[12.5px] font-medium text-white/80 transition hover:text-gold-2'

  const underline = active && tier === 'primary' && <motion.span layoutId="nav-active" className="absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full bg-gold" />

  if (!item.groups) {
    return (
      <li>
        <SmartLink to={item.to} href={item.href} className={base} aria-current={active ? 'page' : undefined}>
          {item.label}
          {underline}
        </SmartLink>
      </li>
    )
  }

  return (
    <li className={compact ? 'relative' : ''} onMouseEnter={enter} onMouseLeave={leave} onKeyDown={onKey}>
      <span className="inline-flex items-center">
        <SmartLink to={item.to} href={item.href} className={base} aria-current={active ? 'page' : undefined}>
          {item.label}
          {underline}
        </SmartLink>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={id}
          aria-label={`${item.label} menu`}
          onClick={() => setOpen(isOpen ? null : key)}
          className={`-ml-2 grid h-8 w-7 place-items-center rounded-full ${tier === 'primary' ? (solid ? 'text-navy' : 'text-white') : 'text-white/70'}`}
        >
          <ChevronDown className={`h-3.5 w-3.5 transition duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </span>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            id={id}
            initial={reduce ? { opacity: 0 } : { opacity: 0, rotateX: -18, y: 6 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, rotateX: -10, y: 4 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformPerspective: 1200, transformOrigin: 'top center' }}
            className={compact ? 'absolute top-full right-0 z-50 pt-2' : 'absolute inset-x-0 top-full z-50 mx-auto max-w-6xl px-6 pt-3'}
          >
            <MenuPanel item={item} compact={compact} onNavigate={() => setOpen(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

/* -------------------------------------------------------------- mobile menu */

function MobileSection({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  if (!item.groups) {
    return (
      <li>
        <SmartLink to={item.to} href={item.href} onClick={onNavigate} showExternal className="flex min-h-12 items-center rounded-2xl px-4 text-base font-bold text-white hover:bg-white/10">
          {item.label}
        </SmartLink>
      </li>
    )
  }
  return (
    <li>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} className="flex min-h-12 w-full items-center justify-between rounded-2xl px-4 text-left text-base font-bold text-white hover:bg-white/10">
        {item.label}
        <ChevronDown className={`h-5 w-5 transition ${open ? 'rotate-180 text-gold' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={id} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mb-2 ml-4 border-l border-gold/30 pl-3">
              {item.to && (
                <SmartLink to={item.to} onClick={onNavigate} className="block rounded-xl px-3 py-2.5 text-sm font-bold text-gold-2">
                  {item.label} overview
                </SmartLink>
              )}
              {item.groups.map((g) => (
                <div key={g.title} className="py-1">
                  <p className="px-3 pt-2 text-xs font-semibold text-white/50">{g.title}</p>
                  {g.links.map((l) => (
                    <SmartLink key={l.label} to={l.to} href={l.href} onClick={onNavigate} showExternal className="block rounded-xl px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10">
                      {l.label}
                    </SmartLink>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

/* ------------------------------------------------------------------- header */

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const [mobile, setMobile] = useState(false)
  const { pathname, search } = useLocation()
  const ref = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const hoverTimer = useRef<number | undefined>(undefined)
  const primary = primaryNav.filter((i) => i.badge !== 'pay')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(null)
    setMobile(false)
  }, [pathname, search])

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null)
    }
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(null)
        setMobile(false)
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  // phone menu: lock scroll, move focus in, trap it, and return it on close
  useEffect(() => {
    document.body.style.overflow = mobile ? 'hidden' : ''
    if (!mobile) return
    const panel = panelRef.current
    const burger = burgerRef.current
    window.setTimeout(() => panel?.querySelector<HTMLElement>('button')?.focus(), 50)
    const trap = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Tab' || !panel) return
      const f = Array.from(panel.querySelectorAll<HTMLElement>('a[href],button')).filter((el) => el.offsetParent !== null)
      if (!f.length) return
      if (e.shiftKey && document.activeElement === f[0]) {
        e.preventDefault()
        f[f.length - 1].focus()
      } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
        e.preventDefault()
        f[0].focus()
      }
    }
    document.addEventListener('keydown', trap)
    return () => {
      document.removeEventListener('keydown', trap)
      burger?.focus()
    }
  }, [mobile])

  const solid = scrolled || open !== null

  return (
    <header ref={ref} className="fixed inset-x-0 top-0 z-50">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:font-bold focus:text-navy">
        Skip to content
      </a>

      {/* Row 1 — contact and secondary links */}
      <div className="relative z-10 hidden h-10 overflow-visible bg-navy min-[1360px]:block">
        <nav aria-label="Secondary" className="container-x flex h-10 items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-[12.5px] text-white/75">
            <a href={`tel:${college.phone.replace(/-/g, '')}`} className="inline-flex items-center gap-1.5 hover:text-gold-2">
              <Phone className="h-3.5 w-3.5 text-gold" aria-hidden="true" /> {college.phone}
            </a>
            <a href={`mailto:${college.email}`} className="hidden items-center gap-1.5 hover:text-gold-2 2xl:inline-flex">
              <Mail className="h-3.5 w-3.5 text-gold" aria-hidden="true" /> {college.email}
            </a>
          </div>
          <ul className="flex items-center">
            {secondaryNav.map((item) => (
              <DesktopItem key={item.label} item={item} open={open} setOpen={setOpen} timer={hoverTimer} solid={solid} tier="secondary" />
            ))}
          </ul>
        </nav>
      </div>

      {/* Row 2 — logo, primary links, actions */}
      <div className={`relative transition-all duration-500 ${solid ? 'bg-white/85 shadow-[0_10px_30px_-18px_rgb(16_42_67/0.45)] backdrop-blur-xl' : 'bg-transparent'}`}>
        <div className="container-x flex h-[76px] items-center justify-between gap-4">
          <Link to="/" className="relative block shrink-0" aria-label="Dr. Lankapalli Bullayya College — home">
            <img src="/brand/logo-light.png" alt="" width={520} height={72} className={`h-9 w-auto transition-opacity duration-500 sm:h-10 ${solid ? 'opacity-0' : 'opacity-100'}`} />
            <img src="/brand/jrlogo.png" alt="" width={520} height={72} className={`absolute inset-0 h-9 w-auto transition-opacity duration-500 sm:h-10 ${solid ? 'opacity-100' : 'opacity-0'}`} />
          </Link>

          <nav aria-label="Main" className="hidden min-[1360px]:block">
            <ul className="flex items-center">
              {primary.map((item) => (
                <DesktopItem key={item.label} item={item} open={open} setOpen={setOpen} timer={hoverTimer} solid={solid} tier="primary" />
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 min-[1360px]:flex">
            <a
              href={LOGIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn !min-h-10 border !px-4 !py-2 text-[13px] ${solid ? 'border-navy/25 text-navy hover:bg-navy hover:text-white' : 'border-white/50 text-white hover:bg-white/10'}`}
            >
              <LogIn className="h-4 w-4" aria-hidden="true" /> Login<span className="sr-only"> (opens in new tab)</span>
            </a>
            <a href={PAYMENT_URL} target="_blank" rel="noopener noreferrer" className="btn-gold !min-h-10 !px-4 !py-2 text-[13px] whitespace-nowrap">
              <CreditCard className="h-4 w-4" aria-hidden="true" /> Online Payment<span className="sr-only"> (opens in new tab)</span>
            </a>
          </div>

          <div className="flex items-center gap-1 min-[1360px]:hidden">
            <Link to="/search" aria-label="Search the website" className={`grid h-11 w-11 place-items-center rounded-full ${solid ? 'text-navy' : 'text-white'}`}>
              <Search className="h-5 w-5" />
            </Link>
            <button
              ref={burgerRef}
              type="button"
              aria-expanded={mobile}
              aria-controls="mobile-menu"
              aria-label="Open menu"
              onClick={() => setMobile(true)}
              className={`grid h-11 w-11 place-items-center rounded-full ${solid ? 'bg-navy text-white' : 'glass text-white'}`}
            >
              <span className="relative block h-4 w-6" aria-hidden="true">
                <span className="absolute top-0 left-0 h-0.5 w-6 rounded bg-current" />
                <span className="absolute top-1.5 left-0 h-0.5 w-4 rounded bg-current" />
                <span className="absolute top-3 left-0 h-0.5 w-6 rounded bg-current" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobile && (
          <>
            <motion.div key="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobile(false)} className="fixed inset-0 z-[54] bg-navy/40 backdrop-blur-sm min-[1360px]:hidden" />
            <motion.div
              key="panel"
              ref={panelRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="navy-flat fixed inset-y-0 right-0 z-[55] w-full max-w-md overflow-y-auto min-[1360px]:hidden"
            >
              <div className="flex h-[76px] items-center justify-between px-5">
                <img src="/brand/logo-light.png" alt="Dr. Lankapalli Bullayya College" className="h-9 w-auto" />
                <button type="button" onClick={() => setMobile(false)} aria-label="Close menu" className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav aria-label="Mobile" className="px-3 pb-16">
                <Link to="/apply" onClick={() => setMobile(false)} className="btn-gold mx-2 mb-2 flex">
                  Apply for admission
                </Link>
                <div className="mx-2 mb-4 grid grid-cols-2 gap-2">
                  <a href={PAYMENT_URL} target="_blank" rel="noopener noreferrer" className="btn-gold !px-3">
                    <CreditCard className="h-4 w-4" aria-hidden="true" /> Online Payment
                  </a>
                  <a href={LOGIN_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost !px-3">
                    <LogIn className="h-4 w-4" aria-hidden="true" /> Login
                  </a>
                </div>
                <ul>
                  {primary.map((item) => (
                    <MobileSection key={item.label} item={item} onNavigate={() => setMobile(false)} />
                  ))}
                </ul>
                <p className="mt-6 px-4 text-sm font-semibold text-gold-2">Institution and services</p>
                <ul className="mt-1">
                  {secondaryNav.map((item) => (
                    <MobileSection key={item.label} item={item} onNavigate={() => setMobile(false)} />
                  ))}
                </ul>
                <div className="mt-6 grid gap-2 px-4 text-sm text-white/75">
                  <a href={`tel:${college.phone.replace(/-/g, '')}`} className="inline-flex min-h-11 items-center gap-2">
                    <Phone className="h-4 w-4 text-gold" aria-hidden="true" /> {college.phone}
                  </a>
                  <a href={`mailto:${college.email}`} className="inline-flex min-h-11 items-center gap-2">
                    <Mail className="h-4 w-4 text-gold" aria-hidden="true" /> {college.email}
                  </a>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
