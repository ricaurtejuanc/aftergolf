export interface CartItem {
  productId: string
  quantity: number
  size?: string
  color?: string
}

const CART_KEY = 'aftergolf.cart'

export function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}
