import { createClient } from 'npm:@supabase/supabase-js@2'

const PRINTFUL_API_KEY = Deno.env.get('PRINTFUL_API_KEY')
const ADMIN_EMAIL = 'ricaurtejuanc@gmail.com'
const PRINTFUL_BASE = 'https://api.printful.com'
const KNOWN_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']
const MOCKUP_BUCKET = 'product-mockups'
// Auto-provided in every Supabase Edge Function — no manual secret needed.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'color'
  )
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

interface PrintfulPrintfile {
  printfile_id: number
  width: number
  height: number
}

// Renders the full mockup gallery (every angle/model Printful's Mockup
// Generator offers) for one representative variant of a color, instead of
// the single flat "preview" photo the sync/store API exposes. The
// generator needs the same design file(s) already placed on the product —
// each placement's printable-area size comes from the printfiles endpoint,
// and the design is placed to fill that whole area (matching how the
// product was originally set up). Async on Printful's side (~45-60s), so
// this polls until done or gives up. Returns null (caller falls back to
// the plain preview photo) if anything about the product isn't shaped the
// way we expect, rather than failing the whole import.
async function generateMockupsForColor(
  catalogProductId: number,
  variant: PrintfulSyncVariant,
): Promise<string[] | null> {
  const designFiles = (variant.files ?? []).filter((f) => f.type !== 'preview' && f.preview_url)
  if (designFiles.length === 0) return null

  const printfilesResult = (await printfulFetch(`/mockup-generator/printfiles/${catalogProductId}`)) as {
    printfiles: PrintfulPrintfile[]
    variant_printfiles: { variant_id: number; placements: Record<string, number> }[]
  }
  const printfileById = new Map(printfilesResult.printfiles.map((p) => [p.printfile_id, p]))
  const placements =
    printfilesResult.variant_printfiles.find((v) => v.variant_id === variant.variant_id)?.placements ?? {}

  const files = designFiles
    .map((f) => {
      const printfile = printfileById.get(placements[f.type])
      if (!printfile) return null
      return {
        placement: f.type,
        image_url: f.preview_url,
        position: {
          area_width: printfile.width,
          area_height: printfile.height,
          width: printfile.width,
          height: printfile.height,
          top: 0,
          left: 0,
        },
      }
    })
    .filter((f): f is NonNullable<typeof f> => f !== null)
  if (files.length === 0) return null

  const createResult = (await printfulFetch(`/mockup-generator/create-task/${catalogProductId}`, {
    method: 'POST',
    body: JSON.stringify({ variant_ids: [variant.variant_id], files }),
  })) as { task_key: string }
  const taskKey = createResult.task_key

  for (let attempt = 0; attempt < 25; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    const poll = (await printfulFetch(`/mockup-generator/task?task_key=${taskKey}`)) as {
      status: string
      mockups?: { mockup_url: string; extra?: { url: string }[] }[]
    }
    if (poll.status === 'completed') {
      const urls: string[] = []
      for (const mockup of poll.mockups ?? []) {
        urls.push(mockup.mockup_url)
        for (const extra of mockup.extra ?? []) urls.push(extra.url)
      }
      return urls
    }
    if (poll.status === 'failed') return null
  }
  return null
}

// Printful's generated mockup URLs (an S3 bucket under its control) expire
// ~72h after creation, so download and re-host each one in our own Storage
// bucket for permanent use before saving them on the product row.
async function persistMockups(
  admin: ReturnType<typeof createClient>,
  syncProductId: number,
  colorName: string,
  urls: string[],
): Promise<string[]> {
  const uploaded = await Promise.all(
    urls.map(async (sourceUrl, index) => {
      try {
        const res = await fetch(sourceUrl)
        if (!res.ok) return null
        const bytes = await res.arrayBuffer()
        const path = `printful/${syncProductId}/${slugify(colorName)}/${index}.png`
        const { error } = await admin.storage
          .from(MOCKUP_BUCKET)
          .upload(path, bytes, { contentType: 'image/png', upsert: true })
        if (error) {
          console.error(`Storage upload failed for ${path}`, error)
          return null
        }
        return admin.storage.from(MOCKUP_BUCKET).getPublicUrl(path).data.publicUrl
      } catch (err) {
        console.error(`Mockup download/upload failed for ${sourceUrl}`, err)
        return null
      }
    }),
  )
  return uploaded.filter((u): u is string => Boolean(u))
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
      const catalogProductId = catalogVariants.find((c) => c?.product_id)?.product_id ?? null

      const sizes = Array.from(
        new Set(
          syncVariants
            .map((v, i) => catalogVariants[i]?.size ?? guessSize(v.name))
            .filter((s): s is string => Boolean(s)),
        ),
      )

      // The garment photo Printful attaches directly to each variant
      // ("preview" file) — used as a fallback when the full Mockup
      // Generator gallery below can't be produced for a color in time.
      function previewFor(variant: PrintfulSyncVariant): string | null {
        return variant.files?.find((f) => f.type === 'preview')?.preview_url ?? null
      }

      const colorOrder: string[] = []
      const colorGroups = new Map<
        string,
        { code: string | null; sizes: Set<string>; representative: PrintfulSyncVariant; fallbackImage: string | null }
      >()
      syncVariants.forEach((variant, i) => {
        const catalog = catalogVariants[i]
        const color = catalog?.color?.trim() || guessColor(variant.name)
        if (!color) return
        if (!colorGroups.has(color)) {
          colorGroups.set(color, {
            code: catalog?.color_code ?? null,
            sizes: new Set(),
            representative: variant,
            fallbackImage: previewFor(variant),
          })
          colorOrder.push(color)
        }
        const group = colorGroups.get(color)!
        const size = catalog?.size ?? guessSize(variant.name)
        if (size) group.sizes.add(size)
      })

      const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

      // Render the real multi-angle mockup gallery per color. Best-effort:
      // any color whose generation fails or times out just keeps its single
      // flat preview photo rather than losing an image entirely.
      const mockupSets = await Promise.all(
        colorOrder.map(async (name) => {
          const group = colorGroups.get(name)!
          if (!catalogProductId) return null
          try {
            const urls = await generateMockupsForColor(catalogProductId, group.representative)
            if (!urls || urls.length === 0) return null
            return await persistMockups(admin, syncProduct.id, name, urls)
          } catch (err) {
            console.error(`Mockup generation failed for color "${name}"`, err)
            return null
          }
        }),
      )

      const colors =
        colorOrder.length > 1
          ? colorOrder.map((name, i) => {
              const group = colorGroups.get(name)!
              const generated = mockupSets[i]
              const images = generated?.length ? generated : group.fallbackImage ? [group.fallbackImage] : []
              return { name, code: group.code, images, sizes: Array.from(group.sizes) }
            })
          : undefined

      // Single-color (or colorless) products don't get a color picker, but
      // still benefit from the full gallery for their one implicit color.
      const singleColorMockups = colorOrder.length === 1 ? mockupSets[0] : null
      const images = singleColorMockups?.length
        ? singleColorMockups
        : Array.from(
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

    return jsonResponse({ error: 'Acción desconocida' }, 400)
  } catch (err) {
    console.error('Printful API error', err)
    return jsonResponse({ error: err instanceof Error ? err.message : 'Error de Printful' }, 502)
  }
})
