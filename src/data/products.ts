import viceGolf1 from '../assets/ViceGolf1.jpg'
import viceGolf2 from '../assets/ViceGolf2.webp'
import viceGolf3 from '../assets/ViceGolf3.webp'
import viceGolf4 from '../assets/ViceGolf4.webp'
import poloFront from '../assets/polo/polo-front.webp'
import poloBack from '../assets/polo/polo-back.webp'
import poloModel1 from '../assets/polo/polo-model-1.webp'
import poloModel2 from '../assets/polo/polo-model-2.webp'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  /** Product photos, imported as Vite asset URLs. First image is the default. */
  images?: string[]
  /** Emoji shown as a placeholder while there are no product photos yet. */
  placeholderEmoji?: string
  /** Bullet-point spec list shown below the description. */
  specs?: string[]
  /** Available sizes; when set, a size must be picked before adding to cart. */
  sizes?: string[]
}

export const CLOTHING_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

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
  {
    id: 'polo-aftergolf',
    name: 'Polo Sport Adidas',
    description:
      'Renueva tu vestuario deportivo con el polo deportivo de adidas, una mezcla de rendimiento y estilo de primera calidad. Confeccionado con piqué de poliéster 100% reciclado con acabado hidrófilo, este polo ligero garantiza que te mantengas seco durante los entrenamientos y actividades diarias. Ideal tanto para uso personal como de complemento premium para tu tienda online.',
    specs: [
      '100% piqué de poliéster reciclado',
      'Peso del tejido: 145,79 g/m² (4.3 oz./yd.²)',
      'Acabado hidrófilo',
      'Corte holgado',
      'Cuello de canalé con solapa de tres botones',
      'Logo de adidas contrastado en la manga derecha',
      'Producto base procedente de Vietnam',
    ],
    price: 39.99,
    category: 'Ropa',
    images: [poloFront, poloBack, poloModel1, poloModel2],
    sizes: CLOTHING_SIZES,
  },
  {
    id: 'camiseta-aftergolf',
    name: 'Camiseta AfterGolf',
    description:
      'Camiseta de algodón suave con el logo AfterGolf estampado. Fabricada bajo demanda (Printful), disponible en varias tallas.',
    price: 24.99,
    category: 'Ropa',
    placeholderEmoji: '👕',
    sizes: CLOTHING_SIZES,
  },
  {
    id: 'gorro-aftergolf',
    name: 'Gorro AfterGolf',
    description:
      'Gorra ajustable bordada con el escudo AfterGolf. Fabricada bajo demanda (Printful).',
    price: 19.99,
    category: 'Ropa',
    placeholderEmoji: '🧢',
  },
]
