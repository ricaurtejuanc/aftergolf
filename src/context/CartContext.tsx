import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Product } from '../data/products'
import { loadProducts } from '../lib/productStore'
import { loadCart, saveCart, type CartItem } from '../lib/cart'

export const SHIPPING_COST = 4.99
export const FREE_SHIPPING_THRESHOLD = 100

interface CartContextValue {
  items: CartItem[]
  addItem: (productId: string, size?: string) => void
  removeItem: (productId: string, size?: string) => void
  setQuantity: (productId: string, quantity: number, size?: string) => void
  clear: () => void
  totalCount: number
  totalPrice: number
  shippingCost: number
  orderTotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart())
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    saveCart(items)
  }, [items])

  useEffect(() => {
    loadProducts().then(setProducts)
  }, [])

  function addItem(productId: string, size?: string) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId && i.size === size)
      if (existing) {
        return prev.map((i) =>
          i.productId === productId && i.size === size ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prev, { productId, quantity: 1, size }]
    })
  }

  function removeItem(productId: string, size?: string) {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)))
  }

  function setQuantity(productId: string, quantity: number, size?: string) {
    if (quantity <= 0) {
      removeItem(productId, size)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId && i.size === size ? { ...i, quantity } : i)),
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
        addItem,
        removeItem,
        setQuantity,
        clear,
        totalCount,
        totalPrice,
        shippingCost,
        orderTotal,
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
