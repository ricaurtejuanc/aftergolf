import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { FREE_SHIPPING_THRESHOLD, useCart } from '../context/CartContext'
import { formatPrice } from '../lib/format'
import { createBizumOrder, type BizumOrderResult } from '../lib/checkout'
import { RegisterGate } from './RegisterGate'
import { TermsModal } from './TermsModal'

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
  const { user } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [address, setAddress] = useState({ name: '', phone: '', line1: '', postalCode: '', city: '' })
  const [bizumResult, setBizumResult] = useState<BizumOrderResult | null>(null)
  const [showTerms, setShowTerms] = useState(false)

  useEffect(() => {
    if (user) setShowLogin(false)
  }, [user])

  function updateAddress<K extends keyof typeof address>(key: K, value: string) {
    setAddress((a) => ({ ...a, [key]: value }))
  }

  async function handleCheckout(e: FormEvent) {
    e.preventDefault()
    if (!user) {
      setShowLogin(true)
      return
    }
    if (!acceptedTerms) return
    setCheckingOut(true)
    setCheckoutError(null)
    try {
      const result = await createBizumOrder(items, address)
      setBizumResult(result)
      clear()
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'No se pudo registrar el pedido')
    } finally {
      setCheckingOut(false)
    }
  }

  if (bizumResult) {
    return (
      <div className={className}>
        <h2 className="font-semibold text-fairway-900">¡Pedido registrado!</h2>
        <div className="mt-3 space-y-2 rounded-lg border border-fairway-400 bg-fairway-50 p-3 text-sm text-fairway-800">
          <p>
            Paga <span className="font-semibold">{formatPrice(bizumResult.amountTotal)}</span> por
            Bizum al número{' '}
            <span className="font-semibold">{bizumResult.bizumPhone}</span>, indicando esta
            referencia en el concepto:
          </p>
          <p className="text-center text-lg font-semibold tracking-wide text-fairway-900">
            {bizumResult.reference}
          </p>
          <p>
            En cuanto verifiquemos el pago te lo confirmaremos por correo y tu pedido pasará a
            producción.
          </p>
        </div>
        <button
          onClick={() => setBizumResult(null)}
          className="mt-3 w-full rounded-lg border border-cream-300 px-4 py-2 text-xs text-fairway-500 transition hover:text-fairway-800"
        >
          Cerrar
        </button>
      </div>
    )
  }

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

          {showLogin ? (
            <div className="space-y-2">
              <p className="text-xs text-fairway-600">
                Inicia sesión para continuar con tu pedido.
              </p>
              <RegisterGate onCancel={() => setShowLogin(false)} />
            </div>
          ) : (
            <form onSubmit={handleCheckout} className="space-y-2 border-t border-cream-200 pt-3">
              <p className="text-xs font-medium text-fairway-700">Dirección de envío</p>
              <input
                type="text"
                required
                placeholder="Nombre completo"
                value={address.name}
                onChange={(e) => updateAddress('name', e.target.value)}
                className="w-full rounded-md border border-cream-300 px-2 py-1.5 text-sm text-fairway-900"
              />
              <input
                type="tel"
                required
                placeholder="Teléfono"
                value={address.phone}
                onChange={(e) => updateAddress('phone', e.target.value)}
                className="w-full rounded-md border border-cream-300 px-2 py-1.5 text-sm text-fairway-900"
              />
              <input
                type="text"
                required
                placeholder="Dirección"
                value={address.line1}
                onChange={(e) => updateAddress('line1', e.target.value)}
                className="w-full rounded-md border border-cream-300 px-2 py-1.5 text-sm text-fairway-900"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Código postal"
                  value={address.postalCode}
                  onChange={(e) => updateAddress('postalCode', e.target.value)}
                  className="w-24 shrink-0 rounded-md border border-cream-300 px-2 py-1.5 text-sm text-fairway-900"
                />
                <input
                  type="text"
                  required
                  placeholder="Ciudad"
                  value={address.city}
                  onChange={(e) => updateAddress('city', e.target.value)}
                  className="min-w-0 flex-1 rounded-md border border-cream-300 px-2 py-1.5 text-sm text-fairway-900"
                />
              </div>

              {checkoutError && <p className="text-xs text-red-500">{checkoutError}</p>}
              <label className="flex items-start gap-2 text-xs text-fairway-600">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 shrink-0"
                />
                <span>
                  He leído y acepto los{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="underline-offset-2 hover:underline"
                  >
                    términos y condiciones
                  </button>
                  .
                </span>
              </label>
              <button
                type="submit"
                disabled={checkingOut || !acceptedTerms}
                className="w-full rounded-lg bg-fairway-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-fairway-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkingOut ? 'Registrando pedido...' : 'Finalizar pedido (pago por Bizum)'}
              </button>
              <button
                type="button"
                onClick={clear}
                className="w-full rounded-lg border border-cream-300 px-4 py-2 text-xs text-fairway-500 transition hover:text-red-500"
              >
                Vaciar carrito
              </button>
            </form>
          )}
        </div>
      )}

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  )
}
