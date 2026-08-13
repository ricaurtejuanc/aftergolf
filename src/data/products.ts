export interface ProductColor {
  name: string
  /** Photos for this color. First image is the default. */
  images: string[]
  /** Sizes available in this color; falls back to the product's sizes if empty. */
  sizes: string[]
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  /** Product photos. First image is the default. Used when the product has no colors. */
  images?: string[]
  /** Emoji shown as a placeholder while there are no product photos yet. */
  placeholderEmoji?: string
  /** Bullet-point spec list shown below the description. */
  specs?: string[]
  /** Available sizes; when set, a size must be picked before adding to cart. */
  sizes?: string[]
  /** Color variants; when set, a color must be picked and determines the photos shown. */
  colors?: ProductColor[]
}

export const CLOTHING_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
