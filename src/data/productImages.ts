import viceGolf1 from '../assets/vice-golf/ViceGolf1.jpg'
import viceGolf2 from '../assets/vice-golf/ViceGolf2.webp'
import viceGolf3 from '../assets/vice-golf/ViceGolf3.webp'
import viceGolf4 from '../assets/vice-golf/ViceGolf4.webp'
import poloFront from '../assets/polo/polo-front.webp'
import poloBack from '../assets/polo/polo-back.webp'
import poloModel1 from '../assets/polo/polo-model-1.webp'
import poloModel2 from '../assets/polo/polo-model-2.webp'
import camisetaFlat from '../assets/camiseta/camiseta-flat.webp'
import camisetaModel1 from '../assets/camiseta/camiseta-model-1.webp'
import camisetaModel2 from '../assets/camiseta/camiseta-model-2.webp'
import camisetaModel3 from '../assets/camiseta/camiseta-model-3.webp'
import camisetaDetail from '../assets/camiseta/camiseta-detail.webp'
import gorroInviernoFlat from '../assets/gorro-invierno/gorro-invierno-flat.webp'
import gorroInviernoModel1 from '../assets/gorro-invierno/gorro-invierno-model-1.webp'
import gorroInviernoModel2 from '../assets/gorro-invierno/gorro-invierno-model-2.webp'
import gorroInviernoDetail from '../assets/gorro-invierno/gorro-invierno-detail.webp'
import gorroPescadorFlat from '../assets/gorro-pescador/gorro-pescador-flat.webp'
import gorroPescadorModel1 from '../assets/gorro-pescador/gorro-pescador-model-1.webp'
import gorroPescadorModel2 from '../assets/gorro-pescador/gorro-pescador-model-2.webp'
import gorroPescadorAngle from '../assets/gorro-pescador/gorro-pescador-angle.webp'

/**
 * Photos for products that already have them, keyed by product id.
 * Supabase Storage isn't wired up yet, so these stay bundled as local Vite
 * assets and get merged onto the DB record client-side (see productStore.ts)
 * instead of living in the products.images column.
 */
export const LOCAL_PRODUCT_IMAGES: Record<string, string[]> = {
  'vice-pro-docena': [viceGolf1, viceGolf2, viceGolf3, viceGolf4],
  'polo-aftergolf': [poloFront, poloBack, poloModel1, poloModel2],
  'camiseta-aftergolf': [camisetaFlat, camisetaModel1, camisetaModel2, camisetaModel3, camisetaDetail],
}

// Products created later from the admin panel get an id auto-generated from
// whatever the admin typed as the name, so it can't be predicted reliably —
// match by a keyword in the name instead of relying on the exact id.
const LOCAL_PRODUCT_IMAGES_BY_KEYWORD: { keyword: string; images: string[] }[] = [
  { keyword: 'invierno', images: [gorroInviernoFlat, gorroInviernoModel1, gorroInviernoModel2, gorroInviernoDetail] },
  { keyword: 'pescador', images: [gorroPescadorFlat, gorroPescadorModel1, gorroPescadorModel2, gorroPescadorAngle] },
]

export function localImagesFor(id: string, name: string): string[] | undefined {
  if (LOCAL_PRODUCT_IMAGES[id]) return LOCAL_PRODUCT_IMAGES[id]
  const normalized = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
  return LOCAL_PRODUCT_IMAGES_BY_KEYWORD.find((m) => normalized.includes(m.keyword))?.images
}
