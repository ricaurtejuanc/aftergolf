import { FREE_SHIPPING_THRESHOLD, useCart } from '../context/CartContext'
import { formatPrice } from '../lib/format'

export function CartPanel({ className = '' }: { className?: string }) {
  const {
    items,
    products,
    removeItem,
    setQuantity,
    totalCount,
    totalPrice,
    shippingCost,
    orderTotal,
    clear,
  } = useCart()

  return (
    <div className={className}>
      <h2 className="font-semibold text-fairway-900">
        Carrito {totalCount > 0 && `(${totalCount})`}
      </h2>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-fairway-500">Tu carrito está vacío.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {items.map((item) => {
            const product = products.find((p) => p.id === item.productId)
            if (!product) return null
            return (
              <div
                key={`${item.productId}-${item.size ?? ''}-${item.color ?? ''}`}
                className="flex items-center gap-2 text-sm"
              >
                <div className="flex-1">
                  <div className="text-fairway-900">{product.name}</div>
                  <div className="text-xs text-fairway-500">
                    {item.color && <>{item.color} · </>}
                    {item.size && <>Talla {item.size} · </>}
                    {formatPrice(product.price)} c/u
                  </div>
                  {product.shippingTime && (
                    <div className="text-xs text-fairway-400">{product.shippingTime}</div>
                  )}
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    setQuantity(item.productId, Number(e.target.value), item.size, item.color)
                  }
                  className="w-14 rounded-md border border-cream-300 px-1.5 py-1 text-center"
                />
                <button
                  onClick={() => removeItem(item.productId, item.size, item.color)}
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
            disabled
            title="El pago online todavía no está disponible."
            className="w-full cursor-not-allowed rounded-lg bg-gold-400 px-4 py-2.5 text-sm font-semibold text-white opacity-70"
          >
            Finalizar pedido (próximamente)
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
  )
}
