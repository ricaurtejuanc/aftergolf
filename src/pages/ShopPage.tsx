import { useState } from 'react'
import { PRODUCTS, type Product } from '../data/products'
import { FREE_SHIPPING_THRESHOLD, useCart } from '../context/CartContext'

const STORE_EMAIL = 'ricaurtejuanc@gmail.com'

function formatPrice(value: number) {
  return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

function ProductGallery({ product }: { product: Product }) {
  const images = product.images ?? []
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-cream-100">
        <span className="text-5xl" aria-hidden>
          {product.placeholderEmoji ?? '🏌️'}
        </span>
      </div>
    )
  }

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-xl bg-cream-100">
        <img
          src={images[active]}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex gap-2">
          {images.map((src, idx) => (
            <button
              key={src}
              onClick={() => setActive(idx)}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                idx === active ? 'border-fairway-600' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              aria-label={`Foto ${idx + 1} de ${product.name}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ShopPage() {
  const {
    items,
    addItem,
    removeItem,
    setQuantity,
    totalCount,
    totalPrice,
    shippingCost,
    orderTotal,
    clear,
  } = useCart()

  function checkoutMailto() {
    const lines = items.map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.productId)
      if (!product) return null
      return `- ${product.name} x${item.quantity} — ${formatPrice(product.price * item.quantity)}`
    })
    const body = [
      'Quiero hacer este pedido en AfterGolf Shop:',
      '',
      ...lines,
      '',
      `Subtotal: ${formatPrice(totalPrice)}`,
      `Envío: ${shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}`,
      `Total: ${formatPrice(orderTotal)}`,
      '',
      '(Nombre, dirección de envío y teléfono:)',
    ].join('\n')
    const url = `mailto:${STORE_EMAIL}?subject=${encodeURIComponent('Pedido AfterGolf Shop')}&body=${encodeURIComponent(body)}`
    window.location.href = url
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-fairway-900">Shop</h1>
        <p className="mt-1 text-sm text-fairway-600">
          Merchandising AfterGolf. El pago con tarjeta todavía no está
          conectado — al finalizar el pedido se prepara un email con el
          detalle para confirmarlo manualmente.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="flex flex-col rounded-2xl border border-cream-300 bg-white p-5 shadow-sm"
            >
              <div className="mb-3">
                <ProductGallery product={product} />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                {product.category}
              </div>
              <h2 className="mt-1 font-semibold text-fairway-900">{product.name}</h2>
              <p className="mt-1 flex-1 text-sm text-fairway-600">{product.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-semibold text-fairway-900">
                  {formatPrice(product.price)}
                </span>
                <button
                  onClick={() => addItem(product.id)}
                  className="rounded-lg bg-fairway-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-fairway-800"
                >
                  Añadir
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-cream-300 bg-white p-5 shadow-sm lg:sticky lg:top-6">
          <h2 className="font-semibold text-fairway-900">
            Carrito {totalCount > 0 && `(${totalCount})`}
          </h2>

          {items.length === 0 ? (
            <p className="mt-3 text-sm text-fairway-500">Tu carrito está vacío.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {items.map((item) => {
                const product = PRODUCTS.find((p) => p.id === item.productId)
                if (!product) return null
                return (
                  <div key={item.productId} className="flex items-center gap-2 text-sm">
                    <div className="flex-1">
                      <div className="text-fairway-900">{product.name}</div>
                      <div className="text-xs text-fairway-500">
                        {formatPrice(product.price)} c/u
                      </div>
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                      className="w-14 rounded-md border border-cream-300 px-1.5 py-1 text-center"
                    />
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-xs text-fairway-400 hover:text-red-500"
                      aria-label={`Quitar ${product.name}`}
                    >
                      ✕
                    </button>
                  </div>
                )
              })}

              <div className="space-y-1.5 border-t border-cream-200 pt-3 text-sm">
                <div className="flex items-center justify-between text-fairway-700">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-fairway-700">
                  <span>Envío</span>
                  <span>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-fairway-500">
                    Envío gratis en pedidos superiores a {formatPrice(FREE_SHIPPING_THRESHOLD)}.
                  </p>
                )}
                <div className="flex items-center justify-between pt-1 font-semibold text-fairway-900">
                  <span>Total</span>
                  <span>{formatPrice(orderTotal)}</span>
                </div>
              </div>

              <button
                onClick={checkoutMailto}
                className="w-full rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gold-600"
              >
                Finalizar pedido
              </button>
              <button
                onClick={clear}
                className="w-full rounded-lg border border-cream-300 px-4 py-2 text-xs text-fairway-500 transition hover:text-red-500"
              >
                Vaciar carrito
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
