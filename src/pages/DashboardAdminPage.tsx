import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabaseClient'
import { formatPrice } from '../lib/format'
import { listAdminUsers, type AdminUser } from '../lib/adminUsers'

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-cream-300 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-fairway-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-fairway-900">{value}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-fairway-900">{title}</h2>
      {children}
    </section>
  )
}

interface VisitStats {
  total: number
  today: number
  last7Days: number
}

interface OrderStats {
  total: number
  pending: number
  paid: number
  revenue: number
}

export function DashboardAdminPage() {
  const [visits, setVisits] = useState<VisitStats | null>(null)
  const [visitsError, setVisitsError] = useState<string | null>(null)
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [usersError, setUsersError] = useState<string | null>(null)

  useEffect(() => {
    async function loadVisits() {
      const startOfToday = new Date()
      startOfToday.setHours(0, 0, 0, 0)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      const [totalRes, todayRes, last7Res] = await Promise.all([
        supabase.from('page_views').select('*', { count: 'exact', head: true }),
        supabase
          .from('page_views')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfToday.toISOString()),
        supabase
          .from('page_views')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString()),
      ])

      const firstError = totalRes.error ?? todayRes.error ?? last7Res.error
      if (firstError) {
        setVisitsError(firstError.message)
        return
      }
      setVisits({
        total: totalRes.count ?? 0,
        today: todayRes.count ?? 0,
        last7Days: last7Res.count ?? 0,
      })
    }

    async function loadOrders() {
      const { data, error } = await supabase.from('orders').select('amount_total, status')
      if (error) {
        setOrdersError(error.message)
        return
      }
      const rows = data ?? []
      const paid = rows.filter((o) => o.status === 'paid')
      setOrderStats({
        total: rows.length,
        pending: rows.filter((o) => o.status === 'pending').length,
        paid: paid.length,
        revenue: paid.reduce((sum, o) => sum + o.amount_total, 0),
      })
    }

    async function loadUsers() {
      try {
        const result = await listAdminUsers()
        setUsers(result.users)
      } catch (err) {
        setUsersError(err instanceof Error ? err.message : 'No se pudieron cargar los usuarios')
      }
    }

    loadVisits()
    loadOrders()
    loadUsers()
  }, [])

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-fairway-900">Resumen</h1>
        <p className="mt-1 text-sm text-fairway-600">
          Visitas, usuarios registrados y pedidos, de un vistazo.
        </p>
      </div>

      <Section title="Visitas">
        {visitsError ? (
          <p className="text-sm text-red-500">{visitsError}</p>
        ) : !visits ? (
          <p className="text-sm text-fairway-500">Cargando...</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Hoy" value={String(visits.today)} />
            <StatCard label="Últimos 7 días" value={String(visits.last7Days)} />
            <StatCard label="Total" value={String(visits.total)} />
          </div>
        )}
      </Section>

      <Section title="Usuarios registrados">
        {usersError ? (
          <p className="text-sm text-red-500">{usersError}</p>
        ) : !users ? (
          <p className="text-sm text-fairway-500">Cargando...</p>
        ) : (
          <>
            <StatCard label="Total" value={String(users.length)} />
            {users.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-cream-300 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-cream-200 text-xs uppercase tracking-wide text-fairway-500">
                      <th className="px-4 py-2 font-medium">Email</th>
                      <th className="px-4 py-2 font-medium">Registrado</th>
                      <th className="px-4 py-2 font-medium">Último acceso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 20).map((u) => (
                      <tr key={u.id} className="border-b border-cream-100 last:border-0">
                        <td className="px-4 py-2 text-fairway-900">{u.email ?? '—'}</td>
                        <td className="px-4 py-2 text-fairway-600">
                          {new Date(u.createdAt).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-2 text-fairway-600">
                          {u.lastSignInAt
                            ? new Date(u.lastSignInAt).toLocaleDateString('es-ES')
                            : 'Nunca'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length > 20 && (
                  <p className="border-t border-cream-200 px-4 py-2 text-xs text-fairway-500">
                    Mostrando los 20 más recientes de {users.length}.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </Section>

      <Section title="Pedidos">
        {ordersError ? (
          <p className="text-sm text-red-500">{ordersError}</p>
        ) : !orderStats ? (
          <p className="text-sm text-fairway-500">Cargando...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total" value={String(orderStats.total)} />
            <StatCard label="Pendientes" value={String(orderStats.pending)} />
            <StatCard label="Pagados" value={String(orderStats.paid)} />
            <StatCard label="Ingresos" value={formatPrice(orderStats.revenue)} />
          </div>
        )}
      </Section>
    </div>
  )
}
