const PRINTFUL_API_KEY = Deno.env.get('PRINTFUL_API_KEY')
const ADMIN_EMAIL = 'ricaurtejuanc@gmail.com'
const PRINTFUL_BASE = 'https://api.printful.com'
const KNOWN_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']

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

async function printfulFetch(path: string) {
  // Printful retired Basic auth with the legacy API key in favor of OAuth
  // 2.0 tokens sent as a Bearer token (same v1 REST endpoints, new auth
  // scheme) — see https://help.printful.com/hc/en-us/articles/4632388335260
  const res = await fetch(`${PRINTFUL_BASE}${path}`, {
    headers: { Authorization: `Bearer ${PRINTFUL_API_KEY}` },
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `Printful respondió ${res.status}`)
  }
  return data.result
}

function guessSize(variantName: string): string | null {
  const tail = variantName
    .split(/[-/]/)
    .map((s) => s.trim())
    .pop()
  const upper = tail?.toUpperCase() ?? ''
  return KNOWN_SIZES.find((s) => s === upper) ?? null
}

interface PrintfulFile {
  type: string
  preview_url?: string
}

interface PrintfulSyncVariant {
  name: string
  retail_price: string
  files?: PrintfulFile[]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (!PRINTFUL_API_KEY) {
    console.error('PRINTFUL_API_KEY secret is not set')
    return jsonResponse({ error: 'Printful no está configurado' }, 500)
  }

  if (callerEmail(req) !== ADMIN_EMAIL) {
    return jsonResponse({ error: 'No autorizado' }, 403)
  }

  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  try {
    if (action === 'list') {
      const result = (await printfulFetch('/store/products')) as {
        id: number
        name: string
        thumbnail_url: string | null
      }[]
      return jsonResponse({
        products: result.map((p) => ({ id: p.id, name: p.name, thumbnail: p.thumbnail_url })),
      })
    }

    if (action === 'get') {
      const id = url.searchParams.get('id')
      if (!id) return jsonResponse({ error: 'Falta id' }, 400)

      const result = (await printfulFetch(`/store/products/${id}`)) as {
        sync_product: { id: number; name: string; thumbnail_url: string | null }
        sync_variants: PrintfulSyncVariant[]
      }
      const { sync_product: syncProduct, sync_variants: syncVariants } = result

      const prices = syncVariants
        .map((v) => Number(v.retail_price))
        .filter((n) => !Number.isNaN(n))
      const price = prices.length ? Math.min(...prices) : 0

      const sizes = Array.from(
        new Set(
          syncVariants.map((v) => guessSize(v.name)).filter((s): s is string => s !== null),
        ),
      )

      const images = Array.from(
        new Set(
          [
            syncProduct.thumbnail_url,
            ...syncVariants.flatMap((v) =>
              (v.files ?? [])
                .filter((f) => f.type === 'preview' || f.type === 'default')
                .map((f) => f.preview_url),
            ),
          ].filter((src): src is string => Boolean(src)),
        ),
      )

      return jsonResponse({
        printfulId: syncProduct.id,
        name: syncProduct.name,
        price,
        sizes,
        images,
      })
    }

    return jsonResponse({ error: 'Acción desconocida' }, 400)
  } catch (err) {
    console.error('Printful API error', err)
    return jsonResponse({ error: err instanceof Error ? err.message : 'Error de Printful' }, 502)
  }
})
