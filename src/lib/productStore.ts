import { DEFAULT_SHIPPING_TIME, type Product } from '../data/products'
import { localImagesFor } from '../data/productImages'
import type { PrintfulProductDetail } from './printful'
import { SUPABASE_URL, supabase } from './supabaseClient'

// A manually-uploaded photo (via the "Fotos" panel) lives in our own
// Storage bucket rather than Printful's CDN — used to tell reimports which
// photos are safe to refresh from Printful and which ones the admin set on
// purpose and should be left alone.
function isManualPhoto(url: string | undefined | null): boolean {
  return Boolean(url && url.startsWith(`${SUPABASE_URL}/storage/v1/object/public/product-mockups/manual/`))
}

interface ProductRow {
  id: string
  name: string
  description: string
  price: number
  category: string
  placeholder_emoji: string | null
  images: string[] | null
  specs: string[] | null
  sizes: string[] | null
  colors: Product['colors'] | null
  shipping_time: string | null
}

function fromRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    placeholderEmoji: row.placeholder_emoji ?? undefined,
    // Photos already committed as local assets take priority over the DB
    // column (which is empty until Supabase Storage is wired up).
    images: localImagesFor(row.id, row.name) ?? row.images ?? undefined,
    specs: row.specs ?? undefined,
    sizes: row.sizes ?? undefined,
    colors: row.colors ?? undefined,
    shippingTime: row.shipping_time ?? undefined,
  }
}

export async function loadProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('position')
  if (error || !data) return []
  return (data as ProductRow[]).map(fromRow)
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'producto'
  )
}

async function uniqueProductId(name: string): Promise<string> {
  const baseId = slugify(name)
  let id = baseId
  let n = 2
  for (;;) {
    const { data } = await supabase.from('products').select('id').eq('id', id).maybeSingle()
    if (!data) return id
    id = `${baseId}-${n++}`
  }
}

export async function addProduct(input: Omit<Product, 'id'>): Promise<Product[]> {
  const id = await uniqueProductId(input.name)
  const { count } = await supabase.from('products').select('id', { count: 'exact', head: true })
  const { error } = await supabase.from('products').insert({
    id,
    name: input.name,
    description: input.description,
    price: input.price,
    category: input.category,
    placeholder_emoji: input.placeholderEmoji ?? null,
    specs: input.specs ?? null,
    sizes: input.sizes ?? null,
    shipping_time: input.shippingTime || null,
    position: count ?? 0,
  })
  if (error) throw error
  return loadProducts()
}

export async function updateProduct(id: string, patch: Omit<Product, 'id'>): Promise<Product[]> {
  const { error } = await supabase
    .from('products')
    .update({
      name: patch.name,
      description: patch.description,
      price: patch.price,
      category: patch.category,
      placeholder_emoji: patch.placeholderEmoji ?? null,
      specs: patch.specs ?? null,
      sizes: patch.sizes ?? null,
      shipping_time: patch.shippingTime || null,
      colors: patch.colors ?? null,
    })
    .eq('id', id)
  if (error) throw error
  return loadProducts()
}

export async function deleteProduct(id: string): Promise<Product[]> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
  return loadProducts()
}

export async function importPrintfulProduct(detail: PrintfulProductDetail): Promise<Product[]> {
  const { data: existing } = await supabase
    .from('products')
    .select('id, colors, images')
    .eq('printful_id', detail.printfulId)
    .maybeSingle()

  if (existing) {
    // Deliberately excludes description and shipping_time — those are
    // editorial fields the admin may have customized, and re-importing
    // shouldn't clobber them. Any color/product photo the admin uploaded
    // manually (via the "Fotos" panel) is kept instead of being replaced by
    // Printful's photo — checked per photo, so manually-set photos survive
    // a reimport.
    const existingColors = (existing.colors as Product['colors']) ?? null
    const existingImages = (existing.images as string[] | null) ?? null

    const colors =
      detail.colors && detail.colors.length
        ? detail.colors.map((c) => {
            const existingColor = existingColors?.find((ec) => ec.name === c.name)
            return isManualPhoto(existingColor?.images[0]) ? { ...c, images: existingColor!.images } : c
          })
        : null
    const images = isManualPhoto(existingImages?.[0])
      ? existingImages
      : detail.images.length
        ? detail.images
        : null

    const { error } = await supabase
      .from('products')
      .update({
        name: detail.name,
        price: detail.price,
        sizes: detail.sizes.length ? detail.sizes : null,
        images,
        colors,
        printful_variants: detail.variants.length ? detail.variants : null,
      })
      .eq('id', existing.id)
    if (error) throw error
  } else {
    const id = await uniqueProductId(detail.name)
    const { count } = await supabase.from('products').select('id', { count: 'exact', head: true })
    const { error } = await supabase.from('products').insert({
      id,
      name: detail.name,
      description: 'Importado desde Printful — edita esta descripción.',
      price: detail.price,
      category: 'Ropa',
      sizes: detail.sizes.length ? detail.sizes : null,
      images: detail.images.length ? detail.images : null,
      colors: detail.colors && detail.colors.length ? detail.colors : null,
      printful_variants: detail.variants.length ? detail.variants : null,
      shipping_time: DEFAULT_SHIPPING_TIME,
      printful_id: detail.printfulId,
      position: count ?? 0,
    })
    if (error) throw error
  }
  return loadProducts()
}

export async function reorderProduct(
  orderedIds: string[],
  id: string,
  direction: 'up' | 'down',
): Promise<Product[]> {
  const idx = orderedIds.indexOf(id)
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (idx === -1 || swapIdx < 0 || swapIdx >= orderedIds.length) return loadProducts()

  const newOrder = [...orderedIds]
  ;[newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]]

  await Promise.all(
    newOrder.map((productId, position) =>
      supabase.from('products').update({ position }).eq('id', productId),
    ),
  )
  return loadProducts()
}

const MOCKUP_BUCKET = 'product-mockups'

function randomFileId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID().slice(0, 8)
  return Math.random().toString(36).slice(2, 10)
}

async function readImages(productId: string, colorName: string | null): Promise<string[]> {
  const { data, error } = await supabase.from('products').select('colors, images').eq('id', productId).maybeSingle()
  if (error) throw error
  if (!data) throw new Error('Producto no encontrado')
  if (colorName) {
    const colors = (data.colors as Product['colors']) ?? []
    return colors.find((c) => c.name === colorName)?.images ?? []
  }
  return (data.images as string[] | null) ?? []
}

async function writeImages(productId: string, colorName: string | null, images: string[]): Promise<Product[]> {
  if (colorName) {
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('colors')
      .eq('id', productId)
      .maybeSingle()
    if (fetchError) throw fetchError
    if (!data) throw new Error('Producto no encontrado')
    const colors = (data.colors as Product['colors']) ?? []
    const next = colors.map((c) => (c.name === colorName ? { ...c, images } : c))
    const { error } = await supabase.from('products').update({ colors: next }).eq('id', productId)
    if (error) throw error
  } else {
    const { error } = await supabase.from('products').update({ images }).eq('id', productId)
    if (error) throw error
  }
  return loadProducts()
}

// Adds one more photo to a color's (or, when colorName is null, the
// product's own) gallery — a reliable alternative to Printful's Mockup
// Generator, which produced inconsistent results. Each upload gets its own
// random path, so a failed or retried upload never touches a photo that's
// already showing: the DB row is only updated after the file is confirmed
// stored, and if that fails partway through, nothing changes.
export async function addColorPhoto(productId: string, colorName: string | null, file: File): Promise<Product[]> {
  const path = `manual/${productId}/${colorName ? slugify(colorName) : 'unico'}/${randomFileId()}`
  const { error: uploadError } = await supabase.storage
    .from(MOCKUP_BUCKET)
    .upload(path, file, { contentType: file.type || 'image/jpeg' })
  if (uploadError) throw uploadError
  const url = supabase.storage.from(MOCKUP_BUCKET).getPublicUrl(path).data.publicUrl

  const images = await readImages(productId, colorName)
  return writeImages(productId, colorName, [...images, url])
}

// Removes a photo from the gallery (and best-effort deletes the underlying
// file — a failure there shouldn't block removing it from the product).
export async function deleteColorPhoto(
  productId: string,
  colorName: string | null,
  url: string,
): Promise<Product[]> {
  const images = await readImages(productId, colorName)
  const marker = `/${MOCKUP_BUCKET}/`
  const markerIndex = url.indexOf(marker)
  if (markerIndex !== -1) {
    const path = url.slice(markerIndex + marker.length)
    await supabase.storage.from(MOCKUP_BUCKET).remove([path])
  }
  return writeImages(
    productId,
    colorName,
    images.filter((i) => i !== url),
  )
}

// Moves a photo one step earlier/later in the gallery. The first photo is
// the one used as the Shop thumbnail and default gallery image, so moving
// a photo to the front also makes it "the shop photo".
export async function reorderColorPhoto(
  productId: string,
  colorName: string | null,
  url: string,
  direction: 'up' | 'down',
): Promise<Product[]> {
  const images = await readImages(productId, colorName)
  const idx = images.indexOf(url)
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1
  if (idx === -1 || swapIdx < 0 || swapIdx >= images.length) return loadProducts()
  const next = [...images]
  ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
  return writeImages(productId, colorName, next)
}
