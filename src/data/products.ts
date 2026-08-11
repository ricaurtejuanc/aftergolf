export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
}

export const PRODUCTS: Product[] = [
  {
    id: 'gorra-classic',
    name: 'Gorra AfterGolf Classic',
    description: 'Gorra ajustable bordada con el escudo AfterGolf.',
    price: 24.9,
    category: 'Complementos',
  },
  {
    id: 'polo-verde',
    name: 'Polo AfterGolf Verde Fairway',
    description: 'Polo técnico transpirable con el escudo bordado en el pecho.',
    price: 44.9,
    category: 'Ropa',
  },
  {
    id: 'jarra-19-hoyo',
    name: 'Jarra "19º Hoyo"',
    description: 'Jarra de cristal con el escudo AfterGolf, para el after de la ronda.',
    price: 16.9,
    category: 'Accesorios',
  },
  {
    id: 'bolas-pack',
    name: 'Pack 6 bolas AfterGolf',
    description: 'Bolas de golf de competición con el logo AfterGolf.',
    price: 29.9,
    category: 'Equipación',
  },
  {
    id: 'sudadera-crest',
    name: 'Sudadera Crest',
    description: 'Sudadera con capucha y el escudo AfterGolf serigrafiado.',
    price: 54.9,
    category: 'Ropa',
  },
  {
    id: 'marcador-bola',
    name: 'Marcador de bola + clip',
    description: 'Marcador metálico esmaltado con el escudo AfterGolf.',
    price: 12.9,
    category: 'Accesorios',
  },
]
