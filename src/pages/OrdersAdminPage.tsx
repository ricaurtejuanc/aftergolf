import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { formatPrice } from '../lib/format'
import { confirmBizumOrder } from '../lib/checkout'

interface OrderItem {
  productId: string | null
  name: string | null
  quantity: number | null
  unitAmount: number | null
}

interface ShippingAddress {
  name?: string | null
  phone?: string | null
  line1?: string | null
  line2?: string | null
  postal_code?: string | null
  city?: string | null
  country?: string | null
}

interface Order {
  id: string
  customer_email: string
  payment_method: string
  shipping_address: ShippingAddress | null
  items: OrderItem[]
  amount_total: number
  currency: string
  status: string
  printful_order_id: string | null
  created_at: string
}

function formatAddress(address: ShippingAddress | null): string {
  if (!address) return 'Sin dirección'
  return [
    address.name,
    address.phone,
    address.line1,
    address.line2,
    address.postal_code,
    address.city,
    address.country,
  ]
    .filter(Boolean)
    .join(', ')
}

export function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  function loadOrders() {
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message)
          return
        }
        setOrders((data as Order[]) ?? [])
      })
  }

  useEffect(loadOrders, [])

  async function handleConfirm(orderId: string) {
    setConfirmingId(orderId)
    setError(null)
    try {
      await confirmBizumOrder(orderId)
      loadOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo confirmar el pedido')
    } finally {
      setConfirmingId(null)
    }
  }

  function toggleSelected(orderId: string) {
    setSelectedIds((ids) => {
      const next = new Set(ids)
      if (next.has(orderId)) next.delete(orderId)
      else next.add(orderId)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedIds((ids) =>
      orders && ids.size === orders.length ? new Set() : new Set(orders?.map((o) => o.id)),
    )
  }

  async function handleDeleteSelected() {
    if (selectedIds.size === 0) return
    if (!window.confirm(`¿Borrar ${selectedIds.size} pedido(s)? Esta acción no se puede deshacer.`)) {
      return
    }
    setDeleting(true)
    setError(null)
    try {
      const { error } = await supabase.from('orders').delete().in('id', Array.from(selectedIds))
      if (error) throw error
      setSelectedIds(new Set())
      loadOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron borrar los pedidos')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-fairway-900">Pedidos</h1>
        <p className="mt-1 text-sm text-fairway-600">
          Los pedidos por Bizum quedan "pending" hasta que confirmas que te ha llegado el
          pago. Créalos en Printful manualmente para producirlos y enviarlos.
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {orders === null && !error ? (
        <p className="text-sm text-fairway-500">Cargando pedidos...</p>
      ) : orders && orders.length === 0 ? (
        <p className="text-sm text-fairway-500">Todavía no hay pedidos.</p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-2 text-fairway-700">
              <input
                type="checkbox"
                checked={Boolean(orders?.length) && selectedIds.size === orders?.length}
                onChange={toggleSelectAll}
              />
              Seleccionar todos
            </label>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.size === 0 || deleting}
              className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {deleting ? 'Borrando...' : `Borrar seleccionados (${selectedIds.size})`}
            </button>
          </div>

          {orders?.map((order) => (
            <div
              key={order.id}
              className="space-y-2 rounded-xl border border-cream-300 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(order.id)}
                    onChange={() => toggleSelected(order.id)}
                    aria-label={`Seleccionar pedido de ${order.customer_email}`}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-fairway-900">{order.customer_email}</div>
                    <div className="text-xs text-fairway-500">
                      {new Date(order.created_at).toLocaleString('es-ES')} ·{' '}
                      {order.payment_method === 'bizum' ? 'Bizum' : 'Stripe'} · ref.{' '}
                      {order.id.slice(0, 8).toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-fairway-900">
                    {formatPrice(order.amount_total)}
                  </div>
                  <div className="text-xs uppercase tracking-wide text-gold-600">
                    {order.status}
                  </div>
                </div>
              </div>

              <ul className="space-y-0.5 text-sm text-fairway-700">
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.quantity ?? 1}× {item.name ?? item.productId ?? 'Producto'}
                  </li>
                ))}
              </ul>

              <p className="text-xs text-fairway-500">
                Envío a: {formatAddress(order.shipping_address)}
              </p>
              <p className="text-xs text-fairway-500">
                {order.printful_order_id
                  ? `Borrador creado en Printful (ID ${order.printful_order_id})`
                  : 'Sin borrador en Printful — créalo a mano'}
              </p>

              {order.status === 'pending' && order.payment_method === 'bizum' && (
                <button
                  onClick={() => handleConfirm(order.id)}
                  disabled={confirmingId === order.id}
                  className="rounded-md bg-fairway-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-fairway-800 disabled:opacity-60"
                >
                  {confirmingId === order.id ? 'Confirmando...' : 'Confirmar pago recibido'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
