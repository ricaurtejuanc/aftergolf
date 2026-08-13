import type { CartItem } from './cart'
import { SUPABASE_URL, supabase } from './supabaseClient'

// Set once ShopPage force-reloads the page after Stripe's redirect back
// (works around a first-paint hiccup on some mobile browsers), so it only
// does that once per checkout attempt rather than looping. Cleared here
// before starting a new checkout so each trip to Stripe gets its own
// allowance.
export const CHECKOUT_RELOADED_KEY = 'aftergolf.checkoutReloaded'

export async function createCheckoutSession(items: CartItem[]): Promise<{ url: string }> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Inicia sesión para continuar con el pedido')

  const response = await fetch(`${SUPABASE_URL}/functions/v1/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items, origin: window.location.origin }),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result?.error ?? 'No se pudo iniciar el pago')
  return result
}
