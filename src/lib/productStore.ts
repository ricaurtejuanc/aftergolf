import type { Product } from '../data/products'
import { localImagesFor } from '../data/productImages'
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
  const { data, error } = await supabase.from('products').select('*').order('created_at')
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
  const { error } = await supabase.from('products').insert({
    id,
    name: input.name,
    description: input.description,
    price: input.price,
    category: input.category,
    placeholder_emoji: input.placeholderEmoji ?? null,
    specs: input.specs ?? null,
    sizes: input.sizes ?? null,
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
