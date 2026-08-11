import viceGolf1 from '../assets/ViceGolf1.jpg'
import viceGolf2 from '../assets/ViceGolf2.webp'
import viceGolf3 from '../assets/ViceGolf3.webp'
import viceGolf4 from '../assets/ViceGolf4.webp'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  /** Product photos, imported as Vite asset URLs. First image is the default. */
  images?: string[]
}

export const PRODUCTS: Product[] = [
  {
    id: 'vice-pro-docena',
    name: 'Docena de Bolas de Golf Vice Pro',
    description:
      'Bola de 3 capas con núcleo de alta energía y cubierta de uretano moldeado (Cast Urethane) para máximo control y spin en el juego corto. Compresión 90, pensada para velocidades de swing medias, con menor spin en salida y hierros largos frente a la Pro Plus — trayectoria más plana y más distancia.',
    price: 44.99,
    category: 'Equipación',
    images: [viceGolf1, viceGolf2, viceGolf3, viceGolf4],
  },
]
