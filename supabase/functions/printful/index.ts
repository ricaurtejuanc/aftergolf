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

async function printfulFetch(path: string, init?: RequestInit) {
  // Printful retired Basic auth with the legacy API key in favor of OAuth
  // 2.0 tokens sent as a Bearer token (same v1 REST endpoints, new auth
  // scheme) — see https://help.printful.com/hc/en-us/articles/4632388335260
  const res = await fetch(`${PRINTFUL_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${PRINTFUL_API_KEY}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
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
  product_id?: number
  size?: string | null
  color?: string | null
  color_code?: string | null
}

// Temporary: doesn't throw, returns the raw status + body so we can inspect
// Printful's validation error details while probing the Mockup Generator
// API's request shape (its docs aren't reachable from this environment).
async function printfulFetchRaw(path: string, init?: RequestInit) {
  const res = await fetch(`${PRINTFUL_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${PRINTFUL_API_KEY}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })
  const data = await res.json().catch(() => null)
  return { status: res.status, data }
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

      // Temporary: compact summary (not the full files array, which gets
      // truncated in the logs) — confirms whether any variant actually has
      // more than one "preview"-type file.
      console.log(
        `Printful preview counts for product ${id}`,
        JSON.stringify(
          syncVariants.map((v) => ({
            name: v.name,
            previewCount: (v.files ?? []).filter((f) => f.type === 'preview').length,
            previewUrls: (v.files ?? []).filter((f) => f.type === 'preview').map((f) => f.preview_url),
          })),
        ),
      )

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

      // Each variant's files include design/embroidery placement closeups
      // (e.g. "embroidery_chest_left", "back") alongside the actual garment
      // photo, which is always type "preview" — only that one is a real
      // product photo, the rest are flat, backgroundless design previews.
      // "preview" is also regenerated per size (same garment, near-identical
      // photo), so only the first size's preview is kept per color instead
      // of piling up near-duplicates from every size.
      function previewFor(variant: PrintfulSyncVariant): string | null {
        return variant.files?.find((f) => f.type === 'preview')?.preview_url ?? null
      }

      const colorOrder: string[] = []
      const colorGroups = new Map<string, { code: string | null; images: string[]; sizes: Set<string> }>()
      syncVariants.forEach((variant, i) => {
        const catalog = catalogVariants[i]
        const color = catalog?.color?.trim() || guessColor(variant.name)
        if (!color) return
        if (!colorGroups.has(color)) {
          const preview = previewFor(variant)
          colorGroups.set(color, {
            code: catalog?.color_code ?? null,
            images: preview ? [preview] : [],
            sizes: new Set(),
          })
          colorOrder.push(color)
        }
        const group = colorGroups.get(color)!
        const size = catalog?.size ?? guessSize(variant.name)
        if (size) group.sizes.add(size)
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
                images: group.images,
                sizes: Array.from(group.sizes),
              }
            })
          : undefined

      const images = Array.from(
        new Set(
          [syncProduct.thumbnail_url, previewFor(syncVariants[0])].filter(
            (src): src is string => Boolean(src),
          ),
        ),
      )

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

    if (action === 'mockup-debug') {
      const id = url.searchParams.get('id')
      if (!id) return jsonResponse({ error: 'Falta id' }, 400)

      const syncResult = (await printfulFetch(`/store/products/${id}`)) as {
        sync_variants: PrintfulSyncVariant[]
      }
      const firstVariant = syncResult.sync_variants[0]
      const catalogRaw = await printfulFetchRaw(`/products/variant/${firstVariant.variant_id}`)
      console.log('mockup-debug catalog variant', JSON.stringify(catalogRaw))

      const catalogProductId = catalogRaw.data?.result?.variant?.product_id
      if (!catalogProductId) {
        return jsonResponse({ error: 'No product_id in catalog variant', catalogRaw })
      }

      const taskRaw = await printfulFetchRaw(`/mockup-generator/create-task/${catalogProductId}`, {
        method: 'POST',
        body: JSON.stringify({ variant_ids: [firstVariant.variant_id] }),
      })
      console.log('mockup-debug create-task', JSON.stringify(taskRaw))

      return jsonResponse({ catalogProductId, catalogRaw, taskRaw })
    }

    return jsonResponse({ error: 'Acción desconocida' }, 400)
  } catch (err) {
    console.error('Printful API error', err)
    return jsonResponse({ error: err instanceof Error ? err.message : 'Error de Printful' }, 502)
  }
})
