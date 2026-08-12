import viceGolf1 from '../assets/ViceGolf1.jpg'
import viceGolf2 from '../assets/ViceGolf2.webp'
import viceGolf3 from '../assets/ViceGolf3.webp'
import viceGolf4 from '../assets/ViceGolf4.webp'
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
import gorroPescadorModel from '../assets/gorro-pescador/gorro-pescador-model.webp'
import gorroPescadorAngle from '../assets/gorro-pescador/gorro-pescador-angle.webp'
import gorroPescadorInside from '../assets/gorro-pescador/gorro-pescador-inside.webp'

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
  'gorro-invierno-aftergolf': [gorroInviernoFlat, gorroInviernoModel1, gorroInviernoModel2, gorroInviernoDetail],
  'gorro-pescador-aftergolf': [gorroPescadorFlat, gorroPescadorModel, gorroPescadorAngle, gorroPescadorInside],
}
