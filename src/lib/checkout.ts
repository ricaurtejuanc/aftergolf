import type { CartItem } from './cart'
import { SUPABASE_URL, supabase } from './supabaseClient'

export interface ShippingAddressInput {
  name: string
  line1: string
  postalCode: string
  city: string
}

export interface BizumOrderResult {
  orderId: string
  reference: string
  bizumPhone: string
  amountTotal: number
}

export async function createBizumOrder(
  items: CartItem[],
  address: ShippingAddressInput,
): Promise<BizumOrderResult> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Inicia sesión para continuar con el pedido')

  const response = await fetch(`${SUPABASE_URL}/functions/v1/bizum-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items, address }),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result?.error ?? 'No se pudo registrar el pedido')
  return result
}

export async function confirmBizumOrder(orderId: string): Promise<void> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Inicia sesión de administrador para confirmar el pedido')

  const response = await fetch(`${SUPABASE_URL}/functions/v1/confirm-bizum-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderId }),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result?.error ?? 'No se pudo confirmar el pedido')
}
