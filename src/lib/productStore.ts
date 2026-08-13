import type { Product } from '../data/products'
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
    .select('id')
    .eq('printful_id', detail.printfulId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('products')
      .update({
        name: detail.name,
        price: detail.price,
        sizes: detail.sizes.length ? detail.sizes : null,
        images: detail.images.length ? detail.images : null,
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
