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

// Printful sync variant names typically look like "Product name - Color / Size".
// With three or more segments the middle one is the color; two-segment names
// (no color set on the product) have nothing to guess. Only used as a
// fallback when the authoritative catalog lookup below fails.
function guessColor(variantName: string): string | null {
  const parts = variantName
    .split(/[-/]/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length < 3) return null
  return parts[parts.length - 2]
}

interface PrintfulFile {
  type: string
  preview_url?: string
}

interface PrintfulSyncVariant {
  id: number
  name: string
  retail_price: string
  variant_id: number
  files?: PrintfulFile[]
}

interface PrintfulCatalogVariant {
  size?: string | null
  color?: string | null
  color_code?: string | null
}

// The sync API (what /store/products returns) only gives us a free-text
// variant name to parse. The catalog API knows the real color name and its
// hex code for the underlying Printful variant, so look that up per variant
// instead of guessing — falls back to text-guessing if a lookup fails (e.g.
// a discontinued catalog variant) so one bad variant doesn't break the import.
async function fetchCatalogVariant(variantId: number): Promise<PrintfulCatalogVariant | null> {
  try {
    const result = (await printfulFetch(`/products/variant/${variantId}`)) as {
      variant: PrintfulCatalogVariant
    }
    return result.variant
  } catch (err) {
    console.error(`Printful catalog lookup failed for variant ${variantId}`, err)
    return null
  }
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

      const catalogVariants = await Promise.all(
        syncVariants.map((v) => fetchCatalogVariant(v.variant_id)),
      )

      const sizes = Array.from(
        new Set(
          syncVariants
            .map((v, i) => catalogVariants[i]?.size ?? guessSize(v.name))
            .filter((s): s is string => Boolean(s)),
        ),
      )

      // Every file with a preview_url is a renderable mockup — Printful
      // generates one per print placement (front, back, sleeve, ...), each
      // with its own "type" value. Filtering to just "preview"/"default"
      // dropped all the others, leaving only a single image per product.
      const images = Array.from(
        new Set(
          [
            syncProduct.thumbnail_url,
            ...syncVariants.flatMap((v) => (v.files ?? []).map((f) => f.preview_url)),
          ].filter((src): src is string => Boolean(src)),
        ),
      )

      const colorOrder: string[] = []
      const colorGroups = new Map<
        string,
        { code: string | null; images: Set<string>; sizes: Set<string> }
      >()
      syncVariants.forEach((variant, i) => {
        const catalog = catalogVariants[i]
        const color = catalog?.color?.trim() || guessColor(variant.name)
        if (!color) return
        if (!colorGroups.has(color)) {
          colorGroups.set(color, { code: catalog?.color_code ?? null, images: new Set(), sizes: new Set() })
          colorOrder.push(color)
        }
        const group = colorGroups.get(color)!
        const size = catalog?.size ?? guessSize(variant.name)
        if (size) group.sizes.add(size)
        for (const file of variant.files ?? []) {
          if (file.preview_url) {
            group.images.add(file.preview_url)
          }
        }
      })
      // Only worth surfacing as a color picker when the product actually has
      // more than one color — a single guessed "color" is usually noise.
      const colors =
        colorOrder.length > 1
          ? colorOrder.map((name) => {
              const group = colorGroups.get(name)!
              return {
                name,
                code: group.code,
                images: Array.from(group.images),
                sizes: Array.from(group.sizes),
              }
            })
          : undefined

      // Needed to place orders through Printful's Orders API later on
      // (sync_variant_id per line item) — kept separate from the
      // size/color display data above since it's only used server-side.
      const variants = syncVariants.map((variant, i) => {
        const catalog = catalogVariants[i]
        return {
          syncVariantId: variant.id,
          size: catalog?.size ?? guessSize(variant.name) ?? null,
          color: catalog?.color?.trim() || guessColor(variant.name) || null,
        }
      })

      return jsonResponse({
        printfulId: syncProduct.id,
        name: syncProduct.name,
        price,
        sizes,
        images,
        colors,
        variants,
      })
    }

    return jsonResponse({ error: 'Acción desconocida' }, 400)
  } catch (err) {
    console.error('Printful API error', err)
    return jsonResponse({ error: err instanceof Error ? err.message : 'Error de Printful' }, 502)
  }
})
