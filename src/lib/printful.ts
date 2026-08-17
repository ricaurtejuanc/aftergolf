import { SUPABASE_URL, supabase } from './supabaseClient'

export interface PrintfulListItem {
  id: number
  name: string
  thumbnail: string | null
}

export interface PrintfulProductColor {
  name: string
  /** Hex swatch color from Printful's catalog, when available. */
  code?: string | null
  images: string[]
  sizes: string[]
}

export interface PrintfulProductVariant {
  syncVariantId: number
  size: string | null
  color: string | null
}

export interface PrintfulProductDetail {
  printfulId: number
  name: string
  price: number
  sizes: string[]
  images: string[]
  colors?: PrintfulProductColor[]
  variants: PrintfulProductVariant[]
}

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function callFunction<T>(query: string): Promise<T> {
  const headers = await authHeaders()
  const response = await fetch(`${SUPABASE_URL}/functions/v1/printful?${query}`, { headers })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error ?? 'Error al conectar con Printful')
  return data
}

export async function listPrintfulProducts(): Promise<PrintfulListItem[]> {
  const data = await callFunction<{ products: PrintfulListItem[] }>('action=list')
  return data.products
}

export async function getPrintfulProduct(id: number): Promise<PrintfulProductDetail> {
  return callFunction<PrintfulProductDetail>(`action=get&id=${id}`)
}

// Renders the full multi-angle Mockup Generator gallery for one color
// (~45s-2min) and saves it directly onto the product row server-side.
// `color` is omitted for a colorless product's single implicit color.
export async function generateColorMockup(id: number, color: string | null): Promise<{ images: string[] }> {
  const colorParam = color ? `&color=${encodeURIComponent(color)}` : ''
  return callFunction<{ images: string[] }>(`action=generate-color&id=${id}${colorParam}`)
}
