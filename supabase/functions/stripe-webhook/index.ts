import Stripe from 'npm:stripe@17'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
// Auto-provided in every Supabase Edge Function — no manual secret needed.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Same mailbox/secret already used by the contact form — reused here so no
// extra secret has to be set up for order emails.
const SMTP_HOST = 'smtp.hostinger.com'
const SMTP_PORT = 465
const SMTP_USER = 'info@aftergolf.es'
const SMTP_PASSWORD = Deno.env.get('CONTACT_SMTP_PASSWORD')

interface OrderItem {
  productId: string | null
  name: string | null
  quantity: number | null
  unitAmount: number | null
}

function euros(cents: number | null | undefined) {
  return `${((cents ?? 0) / 100).toFixed(2)} €`
}

function formatAddress(address: Stripe.Address | null | undefined): string {
  if (!address) return 'Sin dirección'
  return [address.line1, address.line2, address.postal_code, address.city, address.country]
    .filter(Boolean)
    .join(', ')
}

function itemLines(items: OrderItem[]): string {
  return items.map((i) => `- ${i.quantity ?? 1}x ${i.name} (${euros(i.unitAmount)} c/u)`).join('\n')
}

async function sendOrderEmails(params: {
  customerEmail: string
  items: OrderItem[]
  amountTotalCents: number
  address: Stripe.Address | null | undefined
  sessionId: string
}) {
  if (!SMTP_PASSWORD) {
    console.error('CONTACT_SMTP_PASSWORD secret is not set — skipping order emails')
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

  const lines = itemLines(params.items)
  const address = formatAddress(params.address)
  const total = euros(params.amountTotalCents)

  try {
    await client.send({
      from: `AfterGolf <${SMTP_USER}>`,
      to: params.customerEmail,
      subject: 'Tu pedido en AfterGolf está confirmado',
      content: `¡Gracias por tu compra!\n\nTu pago se ha completado correctamente. Este es el resumen de tu pedido:\n\n${lines}\n\nTotal: ${total}\nEnvío a: ${address}\n\nEn breve nos pondremos en contacto contigo con la información de envío.\n\nUn saludo,\nAfterGolf`,
    })

    await client.send({
      from: `AfterGolf <${SMTP_USER}>`,
      to: SMTP_USER,
      subject: `Nuevo pedido — ${params.customerEmail}`,
      content: `Nuevo pedido pagado, pendiente de crear en Printful:\n\n${lines}\n\nTotal: ${total}\nCliente: ${params.customerEmail}\nEnvío a: ${address}\nStripe session: ${params.sessionId}`,
    })
  } catch (err) {
    console.error('Failed to send order emails', err)
  } finally {
    await client.close()
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET secret is not set')
    return new Response('Not configured', { status: 500 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() })

  // Must verify against the raw body — parsing it first would break the
  // signature check.
  const rawBody = await req.text()
  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Stripe webhook signature verification failed', err)
    return new Response('Invalid signature', { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return new Response('ok', { status: 200 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'],
    })

    const items: OrderItem[] = lineItems.data.map((li) => {
      const product = li.price?.product
      const productId =
        product && typeof product === 'object' && 'metadata' in product
          ? (product.metadata as Record<string, string>).product_id
          : null
      return {
        productId: productId ?? null,
        name: li.description,
        quantity: li.quantity,
        unitAmount: li.price?.unit_amount ?? null,
      }
    })

    const shippingAddress =
      session.shipping_details?.address ?? session.customer_details?.address ?? null
    const customerEmail = session.customer_details?.email ?? session.customer_email ?? ''

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { error } = await supabase.from('orders').insert({
      user_id: session.client_reference_id ?? session.metadata?.user_id ?? null,
      stripe_session_id: session.id,
      customer_email: customerEmail,
      shipping_address: shippingAddress,
      items,
      amount_total: (session.amount_total ?? 0) / 100,
      currency: session.currency ?? 'eur',
      status: 'paid',
    })

    // Unique constraint on stripe_session_id — Stripe can redeliver the same
    // event, and that's harmless here, not an error worth failing the webhook over.
    if (error && error.code !== '23505') {
      console.error('Failed to insert order', error)
      return new Response('Failed to record order', { status: 500 })
    }

    // Only email on a fresh insert — a redelivered event (unique violation)
    // already sent its emails the first time around.
    if (!error && customerEmail) {
      await sendOrderEmails({
        customerEmail,
        items,
        amountTotalCents: session.amount_total ?? 0,
        address: shippingAddress,
        sessionId: session.id,
      })
    }
  } catch (err) {
    console.error('Error processing checkout.session.completed', err)
    return new Response('Error processing event', { status: 500 })
  }

  return new Response('ok', { status: 200 })
})
