import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Product } from '../data/products'
import { loadProducts } from '../lib/productStore'
import { loadCart, saveCart, type CartItem } from '../lib/cart'
import { DEFAULT_SHOP_SETTINGS, loadShopSettings } from '../lib/shopSettingsStore'

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
  freeShippingThreshold: number
  orderTotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart())
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState(DEFAULT_SHOP_SETTINGS)

  useEffect(() => {
    saveCart(items)
  }, [items])

  useEffect(() => {
    loadProducts().then(setProducts)
    loadShopSettings().then(setSettings)
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
    // The products list is only loaded once on mount, so a product added
    // (or edited) after that wouldn't otherwise resolve here — refresh it
    // whenever something new gets added to the cart so the badge/panel
    // don't silently skip it.
    loadProducts().then(setProducts)
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

  const shippingCost =
    totalCount === 0 || totalPrice >= settings.freeShippingThreshold ? 0 : settings.shippingCost
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
        freeShippingThreshold: settings.freeShippingThreshold,
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
