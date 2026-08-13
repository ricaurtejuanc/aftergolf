import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Product } from '../data/products'
import { loadProducts } from '../lib/productStore'
import { loadCart, saveCart, type CartItem } from '../lib/cart'
import { loadShopSettings } from '../lib/settings'

export const SHIPPING_COST = 4.99
export const FREE_SHIPPING_THRESHOLD = 100
const DEFAULT_SHIPPING_TIME = 'Entregas en España en 3-5 días laborables.'

interface CartContextValue {
  items: CartItem[]
  products: Product[]
  addItem: (productId: string, size?: string, color?: string) => void
  removeItem: (productId: string, size?: string, color?: string) => void
  setQuantity: (productId: string, quantity: number, size?: string, color?: string) => void
  clear: () => void
  totalCount: number
  totalPrice: number
  shippingCost: number
  orderTotal: number
  shippingTime: string
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart())
  const [products, setProducts] = useState<Product[]>([])
  const [shippingTime, setShippingTime] = useState(DEFAULT_SHIPPING_TIME)

  useEffect(() => {
    saveCart(items)
  }, [items])

  useEffect(() => {
    loadProducts().then(setProducts)
    loadShopSettings().then((s) => setShippingTime(s.shippingTime))
  }, [])

  function addItem(productId: string, size?: string, color?: string) {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === productId && i.size === size && i.color === color,
      )
      if (existing) {
        return prev.map((i) =>
          i.productId === productId && i.size === size && i.color === color
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        )
      }
      return [...prev, { productId, quantity: 1, size, color }]
    })
  }

  function removeItem(productId: string, size?: string, color?: string) {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.size === size && i.color === color)),
    )
  }

  function setQuantity(productId: string, quantity: number, size?: string, color?: string) {
    if (quantity <= 0) {
      removeItem(productId, size, color)
      return
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.size === size && i.color === color
          ? { ...i, quantity }
          : i,
      ),
    )
  }

  function clear() {
    setItems([])
  }

  const { totalCount, totalPrice } = useMemo(() => {
    let count = 0
    let price = 0
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) continue
      count += item.quantity
      price += product.price * item.quantity
    }
    return { totalCount: count, totalPrice: price }
  }, [items, products])

  const shippingCost = totalCount === 0 || totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const orderTotal = totalPrice + shippingCost

  return (
    <CartContext.Provider
      value={{
        items,
        products,
        addItem,
        removeItem,
        setQuantity,
        clear,
        totalCount,
        totalPrice,
        shippingCost,
        orderTotal,
        shippingTime,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
