import Stripe from 'npm:stripe@17'
import { createClient } from 'npm:@supabase/supabase-js@2'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
// Auto-provided in every Supabase Edge Function — no manual secret needed.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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

    const items = lineItems.data.map((li) => {
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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { error } = await supabase.from('orders').insert({
      user_id: session.client_reference_id ?? session.metadata?.user_id ?? null,
      stripe_session_id: session.id,
      customer_email: session.customer_details?.email ?? session.customer_email ?? '',
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
  } catch (err) {
    console.error('Error processing checkout.session.completed', err)
    return new Response('Error processing event', { status: 500 })
  }

  return new Response('ok', { status: 200 })
})
