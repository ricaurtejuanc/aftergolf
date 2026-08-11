import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PRODUCTS } from '../data/products'
import { loadCart, saveCart, type CartItem } from '../lib/cart'

interface CartContextValue {
  items: CartItem[]
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clear: () => void
  totalCount: number
  totalPrice: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart())

  useEffect(() => {
    saveCart(items)
  }, [items])

  function addItem(productId: string) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prev, { productId, quantity: 1 }]
    })
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  function setQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)))
  }

  function clear() {
    setItems([])
  }

  const { totalCount, totalPrice } = useMemo(() => {
    let count = 0
    let price = 0
    for (const item of items) {
      const product = PRODUCTS.find((p) => p.id === item.productId)
      if (!product) continue
      count += item.quantity
      price += product.price * item.quantity
    }
    return { totalCount: count, totalPrice: price }
  }, [items])

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, setQuantity, clear, totalCount, totalPrice }}
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
