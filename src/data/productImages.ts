import viceGolf1 from '../assets/ViceGolf1.jpg'
import viceGolf2 from '../assets/ViceGolf2.webp'
import viceGolf3 from '../assets/ViceGolf3.webp'
import viceGolf4 from '../assets/ViceGolf4.webp'
import poloFront from '../assets/polo/polo-front.webp'
import poloBack from '../assets/polo/polo-back.webp'
import poloModel1 from '../assets/polo/polo-model-1.webp'
import poloModel2 from '../assets/polo/polo-model-2.webp'

/**
 * Photos for products that already have them, keyed by product id.
 * Supabase Storage isn't wired up yet, so these stay bundled as local Vite
 * assets and get merged onto the DB record client-side (see productStore.ts)
 * instead of living in the products.images column.
 */
export const LOCAL_PRODUCT_IMAGES: Record<string, string[]> = {
  'vice-pro-docena': [viceGolf1, viceGolf2, viceGolf3, viceGolf4],
  'polo-aftergolf': [poloFront, poloBack, poloModel1, poloModel2],
}
