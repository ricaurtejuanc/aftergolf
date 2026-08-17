import { DEFAULT_SHIPPING_TIME, type Product } from '../data/products'
import { localImagesFor } from '../data/productImages'
import type { PrintfulProductDetail } from './printful'
import { supabase } from './supabaseClient'

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
  has_back_design: boolean | null
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
    hasBackDesign: row.has_back_design ?? false,
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
    has_back_design: input.hasBackDesign ?? false,
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
      has_back_design: patch.hasBackDesign ?? false,
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
    .select('id, has_back_design, colors, images')
    .eq('printful_id', detail.printfulId)
    .maybeSingle()

  if (existing) {
    // Deliberately excludes description and shipping_time — those are
    // editorial fields the admin may have customized, and re-importing
    // shouldn't clobber them. When photos are managed manually (front/back
    // per color via the "Fotos" panel), the color/size metadata still
    // stays in sync with Printful but the uploaded photos themselves are
    // kept instead of being replaced by Printful's single auto photo.
    const hasBackDesign = existing.has_back_design ?? false
    const existingColors = (existing.colors as Product['colors']) ?? null

    const colors =
      detail.colors && detail.colors.length
        ? hasBackDesign
          ? detail.colors.map((c) => ({
              ...c,
              images: existingColors?.find((ec) => ec.name === c.name)?.images ?? [],
            }))
          : detail.colors
        : null
    const images = hasBackDesign
      ? (existing.images as string[] | null) ?? null
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

// No file extension in the path — keeps the public URL for a given
// product/color/slot stable across re-uploads (upsert just replaces the
// bytes), regardless of the original file type, so re-uploading a photo
// never needs to touch its position in the images array.
function photoPath(productId: string, colorName: string | null, slot: 'front' | 'back'): string {
  return `manual/${productId}/${colorName ? slugify(colorName) : 'unico'}/${slot}`
}

// The deterministic public URL for one product/color's front or back
// photo, whether or not it has actually been uploaded yet — lets the
// admin UI know which of a color's images[] entries is "the front photo"
// independent of display order.
export function getColorPhotoUrl(productId: string, colorName: string | null, slot: 'front' | 'back'): string {
  return supabase.storage.from(MOCKUP_BUCKET).getPublicUrl(photoPath(productId, colorName, slot)).data.publicUrl
}

// Manually-uploaded product photo for one slot (front/back) of one color —
// the reliable alternative to Printful's Mockup Generator, which produced
// inconsistent results. `colorName` is null for a product with no color
// variants, in which case this sets the product's own top-level images.
export async function uploadColorPhoto(
  productId: string,
  colorName: string | null,
  slot: 'front' | 'back',
  file: File,
): Promise<Product[]> {
  const path = photoPath(productId, colorName, slot)
  const { error: uploadError } = await supabase.storage
    .from(MOCKUP_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' })
  if (uploadError) throw uploadError
  const url = getColorPhotoUrl(productId, colorName, slot)

  const { data, error: fetchError } = await supabase
    .from('products')
    .select('colors, images')
    .eq('id', productId)
    .maybeSingle()
  if (fetchError) throw fetchError
  if (!data) throw new Error('Producto no encontrado')

  if (colorName) {
    const colors = (data.colors as Product['colors']) ?? []
    const next = colors.map((c) => {
      if (c.name !== colorName) return c
      return { ...c, images: c.images.includes(url) ? c.images : [...c.images, url] }
    })
    const { error } = await supabase.from('products').update({ colors: next }).eq('id', productId)
    if (error) throw error
  } else {
    const current = (data.images as string[] | null) ?? []
    const images = current.includes(url) ? current : [...current, url]
    const { error } = await supabase.from('products').update({ images }).eq('id', productId)
    if (error) throw error
  }
  return loadProducts()
}

// Reorders a color's (or product's) photos so the chosen front/back slot
// comes first — that's the one used as the Shop thumbnail and default
// gallery photo. No-op if that slot hasn't been uploaded yet.
export async function setMainColorPhoto(
  productId: string,
  colorName: string | null,
  slot: 'front' | 'back',
): Promise<Product[]> {
  const url = getColorPhotoUrl(productId, colorName, slot)

  const { data, error: fetchError } = await supabase
    .from('products')
    .select('colors, images')
    .eq('id', productId)
    .maybeSingle()
  if (fetchError) throw fetchError
  if (!data) throw new Error('Producto no encontrado')

  function reorder(images: string[]): string[] {
    return images.includes(url) ? [url, ...images.filter((i) => i !== url)] : images
  }

  if (colorName) {
    const colors = (data.colors as Product['colors']) ?? []
    const next = colors.map((c) => (c.name === colorName ? { ...c, images: reorder(c.images) } : c))
    const { error } = await supabase.from('products').update({ colors: next }).eq('id', productId)
    if (error) throw error
  } else {
    const images = reorder((data.images as string[] | null) ?? [])
    const { error } = await supabase.from('products').update({ images }).eq('id', productId)
    if (error) throw error
  }
  return loadProducts()
}
