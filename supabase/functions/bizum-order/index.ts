import { createClient } from 'npm:@supabase/supabase-js@2'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

// Auto-provided in every Supabase Edge Function — no manual secret needed.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const BIZUM_PHONE = Deno.env.get('BIZUM_PHONE')
// Same secret already used by the printful edge function.
const PRINTFUL_API_KEY = Deno.env.get('PRINTFUL_API_KEY')

// Same mailbox/secret already used by the contact form and confirm-bizum-order.
const SMTP_HOST = 'smtp.hostinger.com'
const SMTP_PORT = 465
const SMTP_USER = 'info@aftergolf.es'
const SMTP_PASSWORD = Deno.env.get('CONTACT_SMTP_PASSWORD')

// Fallback values, only used if the shop_settings row is somehow missing —
// the admin-editable values live in the shop_settings table (see
// src/lib/shopSettingsStore.ts), read fresh on every order below so a
// changed setting takes effect immediately without redeploying.
const DEFAULT_SHIPPING_COST = 4.99
const DEFAULT_FREE_SHIPPING_THRESHOLD = 100

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
  phone?: string
  line1?: string
  postalCode?: string
  city?: string
}

interface OrderItem {
  name: string
  quantity: number
  unitAmount: number
}

interface PrintfulVariant {
  syncVariantId: number
  size: string | null
  color: string | null
}

function euros(cents: number) {
  return `${(cents / 100).toFixed(2)} €`
}

// Matches a cart line (size/color) against a product's imported Printful
// sync variants to find the sync_variant_id its Orders API needs. Falls
// back to the only variant when the product has just one (no size/color
// options), since there's nothing to disambiguate.
function resolveSyncVariantId(
  variants: PrintfulVariant[] | null | undefined,
  size?: string,
  color?: string,
): number | null {
  if (!variants || variants.length === 0) return null
  const norm = (s?: string | null) => (s ?? '').trim().toLowerCase()
  const match = variants.find((v) => norm(v.size) === norm(size) && norm(v.color) === norm(color))
  if (match) return match.syncVariantId
  return variants.length === 1 ? variants[0].syncVariantId : null
}

// Creates a draft order in Printful — NOT submitted for production or
// charged until manually confirmed from the Printful dashboard. Best
// effort: a failure here (missing variant mapping, API error, missing
// secret) never blocks the AfterGolf order itself, which is the source of
// truth either way.
async function createPrintfulDraftOrder(params: {
  recipientName: string
  recipientPhone: string
  address1: string
  city: string
  zip: string
  items: { syncVariantId: number; quantity: number }[]
}): Promise<string | null> {
  if (!PRINTFUL_API_KEY) {
    console.error('PRINTFUL_API_KEY secret is not set — skipping Printful draft order')
    return null
  }
  try {
    const res = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: {
          name: params.recipientName,
          phone: params.recipientPhone,
          address1: params.address1,
          city: params.city,
          zip: params.zip,
          country_code: 'ES',
        },
        items: params.items.map((i) => ({ sync_variant_id: i.syncVariantId, quantity: i.quantity })),
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      console.error('Printful draft order creation failed', data)
      return null
    }
    return data.result?.id != null ? String(data.result.id) : null
  } catch (err) {
    console.error('Printful draft order creation error', err)
    return null
  }
}

async function sendPendingPaymentEmail(params: {
  customerEmail: string
  items: OrderItem[]
  amountTotal: number
  reference: string
}) {
  if (!SMTP_PASSWORD) {
    console.error('CONTACT_SMTP_PASSWORD secret is not set — skipping pending-payment email')
    return
  }

  const client = new SMTPClient({
    connection: {
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      tls: true,
      auth: { username: SMTP_USER, password: SMTP_PASSWORD },
    },
  })

  const lines = params.items
    .map((i) => `- ${i.quantity}x ${i.name} (${euros(i.unitAmount)} c/u)`)
    .join('\n')

  try {
    await client.send({
      from: `AfterGolf <${SMTP_USER}>`,
      to: params.customerEmail,
      subject: 'Completa el pago de tu pedido en AfterGolf con Bizum',
      content: `¡Gracias por tu pedido!\n\nPara confirmarlo, haz un Bizum de ${euros(Math.round(params.amountTotal * 100))} al número ${BIZUM_PHONE}, indicando esta referencia en el concepto:\n\n${params.reference}\n\nResumen del pedido:\n\n${lines}\n\nEn cuanto verifiquemos el pago te lo confirmaremos por correo y tu pedido pasará a producción.\n\nUn saludo,\nAfterGolf`,
    })
  } catch (err) {
    console.error('Failed to send pending-payment email', err)
  } finally {
    await client.close()
  }
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
  if (
    !address.name?.trim() ||
    !address.phone?.trim() ||
    !address.line1?.trim() ||
    !address.postalCode?.trim() ||
    !address.city?.trim()
  ) {
    return jsonResponse({ error: 'Falta la dirección de envío' }, 400)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, price, printful_variants')
    .in(
      'id',
      items.map((i) => i.productId),
    )

  const { data: shopSettings } = await supabase
    .from('shop_settings')
    .select('shipping_cost, free_shipping_threshold')
    .eq('id', 1)
    .maybeSingle()
  const shippingCostSetting = shopSettings?.shipping_cost ?? DEFAULT_SHIPPING_COST
  const freeShippingThreshold = shopSettings?.free_shipping_threshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD

  if (productsError || !products) {
    console.error('Failed to load products for bizum order', productsError)
    return jsonResponse({ error: 'No se pudieron cargar los productos' }, 500)
  }

  const orderItems: { productId: string; name: string; quantity: number; unitAmount: number }[] = []
  const printfulItems: { syncVariantId: number; quantity: number }[] = []
  let printfulResolved = true
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

    const syncVariantId = resolveSyncVariantId(product.printful_variants, item.size, item.color)
    if (syncVariantId === null) {
      printfulResolved = false
    } else {
      printfulItems.push({ syncVariantId, quantity: item.quantity })
    }
  }

  if (orderItems.length === 0) {
    return jsonResponse({ error: 'Ninguno de los productos del carrito existe ya' }, 400)
  }

  const shippingCost = subtotal >= freeShippingThreshold ? 0 : shippingCostSetting
  const amountTotal = subtotal + shippingCost

  const { data: order, error: insertError } = await supabase
    .from('orders')
    .insert({
      user_id: claims.sub,
      payment_method: 'bizum',
      customer_email: claims.email,
      shipping_address: {
        name: address.name.trim(),
        phone: address.phone.trim(),
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

  const reference = order.id.slice(0, 8).toUpperCase()

  if (printfulResolved && printfulItems.length > 0) {
    const printfulOrderId = await createPrintfulDraftOrder({
      recipientName: address.name.trim(),
      recipientPhone: address.phone.trim(),
      address1: address.line1.trim(),
      city: address.city.trim(),
      zip: address.postalCode.trim(),
      items: printfulItems,
    })
    if (printfulOrderId) {
      await supabase.from('orders').update({ printful_order_id: printfulOrderId }).eq('id', order.id)
    }
  } else {
    console.error(`Skipping Printful draft order for ${order.id} — missing variant mapping`)
  }

  await sendPendingPaymentEmail({
    customerEmail: claims.email,
    items: orderItems,
    amountTotal,
    reference,
  })

  return jsonResponse({
    orderId: order.id,
    reference,
    bizumPhone: BIZUM_PHONE,
    amountTotal,
  })
})
