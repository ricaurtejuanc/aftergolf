export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  /** Optional product photo, imported as a Vite asset URL. */
  image?: string
}

export const PRODUCTS: Product[] = [
  {
    id: 'vice-pro-docena',
    name: 'Docena de Bolas de Golf Vice Pro',
    description:
      'Bola de 3 capas con núcleo de alta energía y cubierta de uretano moldeado (Cast Urethane) para máximo control y spin en el juego corto. Compresión 90, pensada para velocidades de swing medias, con menor spin en salida y hierros largos frente a la Pro Plus — trayectoria más plana y más distancia.',
    price: 36.99,
    category: 'Equipación',
  },
]
