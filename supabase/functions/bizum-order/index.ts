import { createClient } from 'npm:@supabase/supabase-js@2'

// Auto-provided in every Supabase Edge Function — no manual secret needed.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const BIZUM_PHONE = Deno.env.get('BIZUM_PHONE')

// Must match src/context/CartContext.tsx — there's no shared package between
// the Vite app and these Deno functions, so these are duplicated on purpose.
const SHIPPING_COST = 4.99
const FREE_SHIPPING_THRESHOLD = 100

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// The platform already verifies this JWT (verify_jwt is on for this
// function, so only logged-in callers reach here) — we just need to read
// the email/sub claims out of it.
function callerClaims(req: Request): { sub: string; email: string } | null {
  const auth = req.headers.get('Authorization') ?? ''
  const token = auth.replace(/^Bearer\s+/i, '')
  const payloadSegment = token.split('.')[1]
  if (!payloadSegment) return null
  try {
    const payload = JSON.parse(atob(payloadSegment.replace(/-/g, '+').replace(/_/g, '/')))
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') return null
    return { sub: payload.sub, email: payload.email }
  } catch {
    return null
  }
}

interface CartItemInput {
  productId: string
  quantity: number
  size?: string
  color?: string
}

interface ShippingAddressInput {
  name?: string
  line1?: string
  postalCode?: string
  city?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  if (!BIZUM_PHONE) {
    console.error('BIZUM_PHONE secret is not set')
    return jsonResponse({ error: 'El pago por Bizum no está configurado' }, 500)
  }

  const claims = callerClaims(req)
  if (!claims) {
    return jsonResponse({ error: 'No autorizado' }, 401)
  }

  let body: { items?: CartItemInput[]; address?: ShippingAddressInput }
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'JSON inválido' }, 400)
  }

  const items = (body.items ?? []).filter((i) => i.productId && i.quantity > 0)
  if (items.length === 0) {
    return jsonResponse({ error: 'El carrito está vacío' }, 400)
  }

  const address = body.address ?? {}
  if (!address.name?.trim() || !address.line1?.trim() || !address.postalCode?.trim() || !address.city?.trim()) {
    return jsonResponse({ error: 'Falta la dirección de envío' }, 400)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, price')
    .in(
      'id',
      items.map((i) => i.productId),
    )

  if (productsError || !products) {
    console.error('Failed to load products for bizum order', productsError)
    return jsonResponse({ error: 'No se pudieron cargar los productos' }, 500)
  }

  const orderItems: { productId: string; name: string; quantity: number; unitAmount: number }[] = []
  let subtotal = 0

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)
    if (!product) continue
    subtotal += product.price * item.quantity
    const variantLabel = [item.color, item.size && `Talla ${item.size}`].filter(Boolean).join(' / ')
    orderItems.push({
      productId: product.id,
      name: variantLabel ? `${product.name} — ${variantLabel}` : product.name,
      quantity: item.quantity,
      unitAmount: Math.round(product.price * 100),
    })
  }

  if (orderItems.length === 0) {
    return jsonResponse({ error: 'Ninguno de los productos del carrito existe ya' }, 400)
  }

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const amountTotal = subtotal + shippingCost

  const { data: order, error: insertError } = await supabase
    .from('orders')
    .insert({
      user_id: claims.sub,
      payment_method: 'bizum',
      customer_email: claims.email,
      shipping_address: {
        name: address.name.trim(),
        line1: address.line1.trim(),
        postal_code: address.postalCode.trim(),
        city: address.city.trim(),
        country: 'ES',
      },
      items: orderItems,
      amount_total: amountTotal,
      currency: 'eur',
      status: 'pending',
    })
    .select('id')
    .single()

  if (insertError || !order) {
    console.error('Failed to insert bizum order', insertError)
    return jsonResponse({ error: 'No se pudo registrar el pedido' }, 500)
  }

  return jsonResponse({
    orderId: order.id,
    reference: order.id.slice(0, 8).toUpperCase(),
    bizumPhone: BIZUM_PHONE,
    amountTotal,
  })
})
