import { PRODUCTS as SEED_PRODUCTS, type Product } from '../data/products'

const PRODUCTS_KEY = 'aftergolf.products'

export function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY)
    if (raw) return JSON.parse(raw) as Product[]
  } catch {
    // fall through to seed
  }
  saveProducts(SEED_PRODUCTS)
  return SEED_PRODUCTS
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
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

export function addProduct(input: Omit<Product, 'id'>): Product[] {
  const products = loadProducts()
  const baseId = slugify(input.name)
  let id = baseId
  let n = 2
  while (products.some((p) => p.id === id)) {
    id = `${baseId}-${n++}`
  }
  const updated = [...products, { ...input, id }]
  saveProducts(updated)
  return updated
}

export function updateProduct(id: string, patch: Omit<Product, 'id'>): Product[] {
  const updated = loadProducts().map((p) => (p.id === id ? { ...patch, id } : p))
  saveProducts(updated)
  return updated
}

export function deleteProduct(id: string): Product[] {
  const updated = loadProducts().filter((p) => p.id !== id)
  saveProducts(updated)
  return updated
}
