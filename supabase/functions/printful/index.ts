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
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${PRINTFUL_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
    // Several colors regenerating in parallel right after import can burst
    // past Printful's rate limit — back off and retry a couple of times
    // instead of failing the whole color outright.
    if (res.status === 429 && attempt < 3) {
      const retryAfter = Number(res.headers.get('Retry-After'))
      await new Promise((resolve) => setTimeout(resolve, (Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 2 ** attempt) * 1000))
      continue
    }
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data?.error?.message ?? `Printful respondió ${res.status}`)
    }
    return data.result
  }
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

  for (let attempt = 0; attempt < 40; attempt++) {
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

// The product row is created/updated by the client (importPrintfulProduct)
// right after it receives this function's fast response, so a background
// job that starts generating mockups before that response even lands has to
// wait for the row to actually exist before it can patch it — retries for
// up to ~20s, comfortably longer than that client round-trip ever takes.
async function waitForProductRow(
  admin: ReturnType<typeof createClient>,
  printfulId: number,
): Promise<string | null> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const { data } = await admin.from('products').select('id').eq('printful_id', printfulId).maybeSingle()
    if (data) return data.id as string
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
  return null
}

// Patches just one color's images (or the top-level images, for a
// colorless product) once its mockup gallery is ready — never a bulk
// write of every color at once, so a color that's still rendering (or
// never finishes) doesn't block the ones that already did.
async function patchProductImages(
  admin: ReturnType<typeof createClient>,
  productRowId: string,
  colorName: string | null,
  images: string[],
) {
  if (!colorName) {
    await admin.from('products').update({ images }).eq('id', productRowId)
    return
  }
  const { data } = await admin.from('products').select('colors').eq('id', productRowId).maybeSingle()
  const colors = Array.isArray(data?.colors) ? data.colors : null
  if (!colors) return
  const next = colors.map((c: { name: string }) => (c.name === colorName ? { ...c, images } : c))
  await admin.from('products').update({ colors: next }).eq('id', productRowId)
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

      // Returns immediately with each color's single flat preview photo
      // (the same fast, always-available fallback as before this feature
      // existed) — the client fires one request per color at
      // action=generate-color right after this to fill in the full
      // multi-angle gallery. That used to run here in the background via
      // EdgeRuntime.waitUntil, but a background task is still bound by the
      // same worker wall-clock limit as a normal request — with several
      // colors rendering in parallel for minutes, the worker got recycled
      // before every color finished, silently losing whichever ones
      // hadn't. One request per color keeps each one safely inside its
      // own request lifetime instead.
      const hasColorPicker = colorOrder.length > 1
      const colors = hasColorPicker
        ? colorOrder.map((name) => {
            const group = colorGroups.get(name)!
            return {
              name,
              code: group.code,
              images: group.fallbackImage ? [group.fallbackImage] : [],
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

    // Renders and persists the full mockup gallery for a single color of an
    // already-imported product, and patches it straight into that color's
    // entry (or the top-level images, when `color` is omitted for a
    // colorless product) on the product row. One color per call keeps each
    // request safely within the platform's request wall-clock limit — the
    // client calls this once per color right after importing.
    if (action === 'generate-color') {
      const id = url.searchParams.get('id')
      if (!id) return jsonResponse({ error: 'Falta id' }, 400)
      const color = url.searchParams.get('color')

      const result = (await printfulFetch(`/store/products/${id}`)) as {
        sync_product: { id: number }
        sync_variants: PrintfulSyncVariant[]
      }
      const syncVariants = result.sync_variants

      // Looks up catalog data one variant at a time, stopping as soon as
      // the requested color turns up, instead of fetching every
      // size×color variant up front — with several colors being
      // regenerated in parallel from the client right after import, doing
      // that for all of them at once fires far more requests than
      // Printful's API tolerates in a burst and was getting every color
      // rate-limited into failure.
      let representative: PrintfulSyncVariant | null = null
      let catalogProductId: number | null = null
      for (const variant of syncVariants) {
        const catalog = await fetchCatalogVariant(variant.variant_id)
        if (catalogProductId === null && catalog?.product_id) catalogProductId = catalog.product_id
        if (!color || (catalog?.color?.trim() || guessColor(variant.name)) === color) {
          representative = variant
          if (catalogProductId !== null) break
        }
      }
      if (!catalogProductId) {
        return jsonResponse({ error: 'No se encontró el producto en el catálogo de Printful' }, 502)
      }
      if (!representative) return jsonResponse({ error: 'Color no encontrado' }, 404)

      const urls = await generateMockupsForColor(catalogProductId, representative)
      if (!urls || urls.length === 0) {
        return jsonResponse({ error: 'Printful no devolvió fotos para este color' }, 502)
      }

      const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      const persisted = await persistMockups(admin, result.sync_product.id, color ?? 'unico', urls)
      if (persisted.length === 0) {
        return jsonResponse({ error: 'No se pudieron guardar las fotos generadas' }, 502)
      }

      const productRowId = await waitForProductRow(admin, result.sync_product.id)
      if (productRowId) {
        await patchProductImages(admin, productRowId, color, persisted)
      }

      return jsonResponse({ images: persisted })
    }

    return jsonResponse({ error: 'Acción desconocida' }, 400)
  } catch (err) {
    console.error('Printful API error', err)
    return jsonResponse({ error: err instanceof Error ? err.message : 'Error de Printful' }, 502)
  }
})
