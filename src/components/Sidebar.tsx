import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Logo } from './Logo'
import { useCart } from '../context/CartContext'

const NAV_ITEMS = [
  { to: '/antes-de-jugar', label: 'Antes de Jugar' },
  { to: '/despues-de-jugar', label: 'Después de Jugar' },
  { to: '/historial', label: 'Historial de Rondas' },
  { to: '/shop', label: 'Shop' },
]

export function Sidebar() {
  const [open, setOpen] = useState(false)
  const { totalCount } = useCart()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-fairway-800 text-cream-50'
        : 'text-fairway-800 hover:bg-cream-200'
    }`

  return (
    <>
      <header className="flex items-center justify-between border-b border-cream-300 bg-cream-100 px-4 py-3 md:hidden">
        <NavLink to="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="font-serif text-lg font-bold text-fairway-900">AfterGolf</span>
        </NavLink>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-cream-300 px-3 py-1.5 text-sm text-fairway-800"
          aria-label="Abrir menú"
        >
          {open ? '✕' : '☰'}
        </button>
      </header>

      <aside
        className={`w-64 shrink-0 border-r border-cream-300 bg-cream-100 md:sticky md:top-0 md:block md:h-screen md:overflow-y-auto ${
          open ? 'block' : 'hidden'
        }`}
      >
        <div className="hidden items-center gap-2 px-5 py-6 md:flex">
          <Logo className="h-10 w-10" />
          <span className="font-serif text-xl font-bold text-fairway-900">AfterGolf</span>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              <span>{item.label}</span>
              {item.to === '/shop' && totalCount > 0 && (
                <span className="ml-auto rounded-full bg-gold-500 px-2 py-0.5 text-xs font-semibold text-white">
                  {totalCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3">
          <NavLink
            to="/handicap-federado"
            onClick={() => setOpen(false)}
            className="block rounded-lg border border-gold-400 bg-gold-400/10 px-3 py-2 text-xs font-medium text-fairway-800 transition hover:border-gold-500"
          >
            ¿No sabes tu handicap? <span className="font-semibold">Consúltalo aquí</span>
          </NavLink>
        </div>

        <div className="mt-auto p-4 text-xs text-fairway-600">
          WHS / RFEG · datos guardados en tu navegador
        </div>
      </aside>
    </>
  )
}
