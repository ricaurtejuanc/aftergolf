import { useState, type SVGProps } from 'react'
import { NavLink } from 'react-router-dom'
import { Logo } from './Logo'
import { CartPanel } from './CartPanel'
import { useCart } from '../context/CartContext'

function FlagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 21V4" />
      <path d="M6 4l12 3.5L6 11" />
    </svg>
  )
}

function ScoreIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  )
}

function HistoryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  )
}

function ShopIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  )
}

function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  )
}

function CartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M3 4h2l2.4 12.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6" />
    </svg>
  )
}

const NAV_ITEMS = [
  { to: '/antes-de-jugar', label: 'Antes de Jugar', shortLabel: 'Antes', icon: FlagIcon },
  { to: '/despues-de-jugar', label: 'Después de Jugar', shortLabel: 'Después', icon: ScoreIcon },
  { to: '/historial', label: 'Historial de Rondas', shortLabel: 'Historial', icon: HistoryIcon },
  { to: '/shop', label: 'Shop', shortLabel: 'Shop', icon: ShopIcon },
  { to: '/contacto', label: 'Contacto', shortLabel: 'Contacto', icon: MailIcon },
]

export function Sidebar() {
  const { totalCount } = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-fairway-800 text-cream-50'
        : 'text-fairway-800 hover:bg-cream-200'
    }`

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition ${
      isActive ? 'text-fairway-900' : 'text-fairway-500'
    }`

  return (
    <>
      <header className="relative flex items-center justify-between border-b border-cream-300 bg-cream-100 px-4 py-3 md:hidden">
        <NavLink to="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="font-serif text-lg font-bold text-fairway-900">AfterGolf</span>
        </NavLink>
        <div className="flex items-center gap-2">
          <NavLink
            to="/handicap-federado"
            className="rounded-lg border border-gold-400 bg-gold-400/10 px-2.5 py-1.5 text-xs font-medium text-fairway-800"
          >
            ¿No sabes tu handicap?
          </NavLink>
          <button
            type="button"
            onClick={() => setCartOpen((v) => !v)}
            aria-label="Ver carrito"
            className="relative rounded-lg border border-cream-300 bg-white p-1.5 text-fairway-800 transition hover:border-fairway-400"
          >
            <CartIcon className="h-5 w-5" />
            {totalCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 rounded-full bg-gold-500 px-1 text-[9px] font-semibold text-white">
                {totalCount}
              </span>
            )}
          </button>
        </div>

        {cartOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setCartOpen(false)} />
            <div className="absolute right-4 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-cream-300 bg-white p-4 shadow-lg">
              <CartPanel />
            </div>
          </>
        )}
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-cream-300 bg-cream-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <NavLink to="/" end className={mobileLinkClass}>
          <Logo className="h-5 w-5" />
          Inicio
        </NavLink>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={mobileLinkClass}>
            <span className="relative">
              <item.icon className="h-5 w-5" />
              {item.to === '/shop' && totalCount > 0 && (
                <span className="absolute -right-2 -top-1.5 rounded-full bg-gold-500 px-1 text-[9px] font-semibold text-white">
                  {totalCount}
                </span>
              )}
            </span>
            {item.shortLabel}
          </NavLink>
        ))}
      </nav>

      <aside className="hidden w-64 shrink-0 border-r border-cream-300 bg-cream-100 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:overflow-y-auto">
        <div className="flex items-center gap-2 px-5 py-6">
          <Logo className="h-10 w-10" />
          <span className="font-serif text-xl font-bold text-fairway-900">AfterGolf</span>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={desktopLinkClass}>
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.to === '/shop' && totalCount > 0 && (
                <span className="ml-auto rounded-full bg-gold-500 px-2 py-0.5 text-xs font-semibold text-white">
                  {totalCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-3">
          <NavLink
            to="/handicap-federado"
            className="block rounded-lg border border-gold-400 bg-gold-400/10 px-3 py-2 text-xs font-medium text-fairway-800 transition hover:border-gold-500"
          >
            ¿No sabes tu handicap? <span className="font-semibold">Consúltalo aquí</span>
          </NavLink>
        </div>
      </aside>
    </>
  )
}
