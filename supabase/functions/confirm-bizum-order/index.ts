import { createClient } from 'npm:@supabase/supabase-js@2'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

const ADMIN_EMAIL = 'ricaurtejuanc@gmail.com'
// Auto-provided in every Supabase Edge Function — no manual secret needed.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Same mailbox/secret already used by the contact form.
const SMTP_HOST = 'smtp.hostinger.com'
const SMTP_PORT = 465
const SMTP_USER = 'info@aftergolf.es'
const SMTP_PASSWORD = Deno.env.get('CONTACT_SMTP_PASSWORD')

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

// Only the site admin may call this — decode the caller's Supabase JWT
// (already verified by the platform since verify_jwt is on for this
// function) and check the email claim rather than trusting anything client
// side.
function callerEmail(req: Request): string | null {
  const auth = req.headers.get('Authorization') ?? ''
  const token = auth.replace(/^Bearer\s+/i, '')
  const payloadSegment = token.split('.')[1]
  if (!payloadSegment) return null
  try {
    const payload = JSON.parse(atob(payloadSegment.replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.email === 'string' ? payload.email : null
  } catch {
    return null
  }
}

interface OrderItem {
  name: string | null
  quantity: number | null
  unitAmount: number | null
}

interface Address {
  name?: string | null
  phone?: string | null
  line1?: string | null
  line2?: string | null
  postal_code?: string | null
  city?: string | null
  country?: string | null
}

function euros(cents: number | null | undefined) {
  return `${((cents ?? 0) / 100).toFixed(2)} €`
}

function formatAddress(address: Address | null): string {
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

async function sendConfirmationEmail(params: {
  customerEmail: string
  items: OrderItem[]
  amountTotal: number
  address: Address | null
}) {
  if (!SMTP_PASSWORD) {
    console.error('CONTACT_SMTP_PASSWORD secret is not set — skipping confirmation email')
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
    .map((i) => `- ${i.quantity ?? 1}x ${i.name} (${euros(i.unitAmount)} c/u)`)
    .join('\n')

  try {
    await client.send({
      from: `AfterGolf <${SMTP_USER}>`,
      to: params.customerEmail,
      subject: 'Tu pedido en AfterGolf está confirmado',
      content: `¡Hemos recibido tu pago!\n\nTu pedido ya está confirmado y pasa a producción. Este es el resumen:\n\n${lines}\n\nTotal: ${euros(Math.round(params.amountTotal * 100))}\nEnvío a: ${formatAddress(params.address)}\n\nUn saludo,\nAfterGolf`,
    })
  } catch (err) {
    console.error('Failed to send confirmation email', err)
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

  if (callerEmail(req) !== ADMIN_EMAIL) {
    return jsonResponse({ error: 'No autorizado' }, 403)
  }

  let body: { orderId?: string }
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'JSON inválido' }, 400)
  }

  if (!body.orderId) {
    return jsonResponse({ error: 'Falta orderId' }, 400)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { data: order, error: loadError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', body.orderId)
    .maybeSingle()

  if (loadError || !order) {
    return jsonResponse({ error: 'Pedido no encontrado' }, 404)
  }

  if (order.status === 'paid') {
    return jsonResponse({ ok: true })
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', body.orderId)

  if (updateError) {
    console.error('Failed to confirm order', updateError)
    return jsonResponse({ error: 'No se pudo confirmar el pedido' }, 500)
  }

  await sendConfirmationEmail({
    customerEmail: order.customer_email,
    items: order.items,
    amountTotal: order.amount_total,
    address: order.shipping_address,
  })

  return jsonResponse({ ok: true })
})
