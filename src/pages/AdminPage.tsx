import { useState } from 'react'
import { RegisterGate } from '../components/RegisterGate'
import { useAuth } from '../context/AuthContext'
import { ADMIN_EMAIL } from '../lib/admin'
import { CoursesPage } from './CoursesPage'
import { ProductsAdminPage } from './ProductsAdminPage'
import { OrdersAdminPage } from './OrdersAdminPage'
import { DashboardAdminPage } from './DashboardAdminPage'

export function AdminPage() {
  const [tab, setTab] = useState<'resumen' | 'campos' | 'productos' | 'pedidos'>('resumen')
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return <p className="py-12 text-center text-sm text-fairway-500">Cargando...</p>
  }

  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="mx-auto max-w-sm space-y-4 py-12">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-fairway-900">Panel de administrador</h1>
          <p className="mt-1 text-sm text-fairway-600">
            Inicia sesión como {ADMIN_EMAIL} para acceder.
          </p>
        </div>
        <RegisterGate />
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
          <button onClick={() => setTab('resumen')} className={tabClass('resumen')}>
            Resumen
          </button>
          <button onClick={() => setTab('campos')} className={tabClass('campos')}>
            Campos
          </button>
          <button onClick={() => setTab('productos')} className={tabClass('productos')}>
            Productos
          </button>
          <button onClick={() => setTab('pedidos')} className={tabClass('pedidos')}>
            Pedidos
          </button>
        </div>
        <button
          onClick={() => void signOut()}
          className="rounded-lg border border-cream-300 px-3 py-1.5 text-xs text-fairway-600 transition hover:border-fairway-400"
        >
          Cerrar sesión de {ADMIN_EMAIL}
        </button>
      </div>
      {tab === 'resumen' ? (
        <DashboardAdminPage />
      ) : tab === 'campos' ? (
        <CoursesPage />
      ) : tab === 'productos' ? (
        <ProductsAdminPage />
      ) : (
        <OrdersAdminPage />
      )}
    </div>
  )
}
