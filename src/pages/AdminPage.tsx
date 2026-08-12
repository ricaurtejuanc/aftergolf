import { useState, type FormEvent } from 'react'
import { isAdminUnlocked, lockAdmin, unlockAdmin } from '../lib/admin'
import { CoursesPage } from './CoursesPage'
import { ProductsAdminPage } from './ProductsAdminPage'

export function AdminPage() {
  const [unlocked, setUnlocked] = useState(() => isAdminUnlocked())
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [tab, setTab] = useState<'campos' | 'productos'>('campos')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (unlockAdmin(pin)) {
      setUnlocked(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  function handleLogout() {
    lockAdmin()
    setUnlocked(false)
    setPin('')
  }

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-sm space-y-4 py-12">
        <h1 className="text-xl font-semibold text-fairway-900">Panel de administrador</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value)
              setError(false)
            }}
            placeholder="PIN de administrador"
            className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
          />
          {error && <p className="text-sm text-red-500">PIN incorrecto.</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-fairway-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-fairway-800"
          >
            Entrar
          </button>
        </form>
      </div>
    )
  }

  const tabClass = (t: typeof tab) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      tab === t
        ? 'bg-fairway-800 text-cream-50'
        : 'border border-cream-300 text-fairway-800 hover:border-fairway-400'
    }`

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button onClick={() => setTab('campos')} className={tabClass('campos')}>
            Campos
          </button>
          <button onClick={() => setTab('productos')} className={tabClass('productos')}>
            Productos
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-cream-300 px-3 py-1.5 text-xs text-fairway-600 transition hover:border-fairway-400"
        >
          Cerrar sesión de admin
        </button>
      </div>
      {tab === 'campos' ? <CoursesPage /> : <ProductsAdminPage />}
    </div>
  )
}
