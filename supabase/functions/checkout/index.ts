import Stripe from 'npm:stripe@17'
import { createClient } from 'npm:@supabase/supabase-js@2'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

// Must match src/context/CartContext.tsx — there's no shared package between
// the Vite app and these Deno functions, so these are duplicated on purpose.
const SHIPPING_COST = 4.99
const FREE_SHIPPING_THRESHOLD = 100

const ALLOWED_ORIGINS = ['https://aftergolf.es', 'https://www.aftergolf.es']
const DEFAULT_ORIGIN = 'https://www.aftergolf.es'

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  if (!STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY secret is not set')
    return jsonResponse({ error: 'Los pagos no están configurados' }, 500)
  }

  const claims = callerClaims(req)
  if (!claims) {
    return jsonResponse({ error: 'No autorizado' }, 401)
  }

  let body: { items?: CartItemInput[]; origin?: string }
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'JSON inválido' }, 400)
  }

  const items = (body.items ?? []).filter((i) => i.productId && i.quantity > 0)
  if (items.length === 0) {
    return jsonResponse({ error: 'El carrito está vacío' }, 400)
  }

  const origin = ALLOWED_ORIGINS.includes(body.origin ?? '') ? body.origin! : DEFAULT_ORIGIN

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, price')
    .in(
      'id',
      items.map((i) => i.productId),
    )

  if (productsError || !products) {
    console.error('Failed to load products for checkout', productsError)
    return jsonResponse({ error: 'No se pudieron cargar los productos' }, 500)
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
  let subtotal = 0

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)
    if (!product) continue
    subtotal += product.price * item.quantity
    const variantLabel = [item.color, item.size && `Talla ${item.size}`].filter(Boolean).join(' / ')
    lineItems.push({
      quantity: item.quantity,
      price_data: {
        currency: 'eur',
        unit_amount: Math.round(product.price * 100),
        product_data: {
          name: variantLabel ? `${product.name} — ${variantLabel}` : product.name,
          metadata: { product_id: product.id },
        },
      },
    })
  }

  if (lineItems.length === 0) {
    return jsonResponse({ error: 'Ninguno de los productos del carrito existe ya' }, 400)
  }

  const shippingAmount = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST

  try {
    const stripe = new Stripe(STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: claims.email,
      client_reference_id: claims.sub,
      metadata: { user_id: claims.sub },
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ['ES'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: Math.round(shippingAmount * 100), currency: 'eur' },
            display_name: shippingAmount === 0 ? 'Envío gratis' : 'Envío estándar',
          },
        },
      ],
      success_url: `${origin}/#/shop?checkout=success`,
      cancel_url: `${origin}/#/shop?checkout=cancelled`,
    })

    if (!session.url) {
      return jsonResponse({ error: 'No se pudo crear la sesión de pago' }, 502)
    }
    return jsonResponse({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout session creation failed', err)
    return jsonResponse({ error: 'No se pudo iniciar el pago' }, 502)
  }
})
