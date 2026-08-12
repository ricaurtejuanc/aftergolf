import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  let body: { name?: string; email?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'JSON inválido' }, 400)
  }

  const name = body.name?.trim()
  const email = body.email?.trim()
  const message = body.message?.trim()

  if (!name || !email || !message) {
    return jsonResponse({ error: 'Faltan campos obligatorios' }, 400)
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: 'Email inválido' }, 400)
  }

  if (!SMTP_PASSWORD) {
    console.error('CONTACT_SMTP_PASSWORD secret is not set')
    return jsonResponse({ error: 'El envío de correo no está configurado' }, 500)
  }

  const client = new SMTPClient({
    connection: {
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      tls: true,
      auth: { username: SMTP_USER, password: SMTP_PASSWORD },
    },
  })

  try {
    await client.send({
      from: `AfterGolf <${SMTP_USER}>`,
      to: SMTP_USER,
      replyTo: email,
      subject: `Contacto AfterGolf — ${name}`,
      content: `${message}\n\nDe: ${name} (${email})`,
    })
  } catch (err) {
    console.error('Failed to send contact email', err)
    return jsonResponse({ error: 'No se pudo enviar el mensaje' }, 500)
  } finally {
    await client.close()
  }

  return jsonResponse({ ok: true })
})
