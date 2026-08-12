import { useEffect, useState } from 'react'
import type { Product } from '../data/products'
import { loadProducts } from '../lib/productStore'
import { FREE_SHIPPING_THRESHOLD, useCart } from '../context/CartContext'

function formatPrice(value: number) {
  return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

function ProductLightbox({
  product,
  images,
  active,
  onClose,
  onNavigate,
}: {
  product: Product
  images: string[]
  active: number
  onClose: () => void
  onNavigate: (idx: number) => void
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onNavigate((active - 1 + images.length) % images.length)
      if (e.key === 'ArrowRight') onNavigate((active + 1) % images.length)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, images.length, onClose, onNavigate])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-3xl leading-none text-white/80 transition hover:text-white"
        aria-label="Cerrar"
      >
        ✕
      </button>
      <img
        src={images[active]}
        alt={product.name}
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-full rounded-lg object-contain"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNavigate((active - 1 + images.length) % images.length)
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl leading-none text-white/80 transition hover:text-white"
            aria-label="Foto anterior"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onNavigate((active + 1) % images.length)
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl leading-none text-white/80 transition hover:text-white"
            aria-label="Foto siguiente"
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}

function ProductGallery({ product }: { product: Product }) {
  const images = product.images ?? []
  const [active, setActive] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

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
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="block aspect-square w-full cursor-zoom-in overflow-hidden rounded-xl bg-cream-100"
        aria-label={`Ampliar foto de ${product.name}`}
      >
        <img
          src={images[active]}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </button>
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

      {lightboxOpen && (
        <ProductLightbox
          product={product}
          images={images}
          active={active}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setActive}
        />
      )}
    </div>
  )
}

function ProductCard({
  product,
  onAdd,
}: {
  product: Product
  onAdd: (size?: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [size, setSize] = useState('')
  const needsSize = Boolean(product.sizes)

  return (
    <div className="flex flex-col rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
      <div className="mb-3">
        <ProductGallery product={product} />
      </div>
      <div className="text-xs font-semibold uppercase tracking-wide text-gold-600">
        {product.category}
      </div>
      <h2 className="mt-1 font-semibold text-fairway-900">{product.name}</h2>

      <div className="mt-2 flex-1">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-medium text-fairway-600 underline-offset-2 hover:underline"
        >
          {expanded ? 'Ocultar información' : 'Información de producto'}
        </button>

        {expanded && (
          <div className="mt-2">
            <p className="text-sm text-fairway-600">{product.description}</p>
            {product.specs && (
              <ul className="mt-2 space-y-1 text-xs text-fairway-600">
                {product.specs.map((spec) => (
                  <li key={spec} className="flex gap-1.5">
                    <span className="text-gold-600" aria-hidden>
                      •
                    </span>
                    {spec}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {needsSize && (
        <div className="mt-3">
          <label className="block text-xs font-medium text-fairway-700 mb-1">Talla</label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full rounded-lg border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
          >
            <option value="" disabled>
              Selecciona talla
            </option>
            {product.sizes!.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-semibold text-fairway-900">
          {formatPrice(product.price)}
        </span>
        <button
          onClick={() => onAdd(needsSize ? size : undefined)}
          disabled={needsSize && !size}
          className="rounded-lg bg-fairway-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-fairway-800 disabled:cursor-not-allowed disabled:bg-fairway-300"
        >
          {needsSize && !size ? 'Selecciona talla' : 'Añadir'}
        </button>
      </div>
    </div>
  )
}

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    loadProducts().then(setProducts)
  }, [])
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

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-fairway-900">Shop</h1>
        <p className="mt-1 text-sm text-fairway-600">
          Aquí puedes ver el catálogo de merchandising de AfterGolf.
        </p>
      </div>

      <div className="rounded-xl border border-gold-400 bg-gold-400/10 p-4 text-sm text-fairway-800">
        <span className="font-semibold">En breve podrás realizar tus pedidos.</span>{' '}
        Estamos terminando de configurar el pago online — mientras tanto puedes
        explorar el catálogo y guardar productos en el carrito.
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={(size) => addItem(product.id, size)}
            />
          ))}
        </div>

        <div className="order-first h-fit rounded-2xl border border-cream-300 bg-white p-5 shadow-sm lg:order-none lg:sticky lg:top-6">
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
                    key={`${item.productId}-${item.size ?? ''}`}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="flex-1">
                      <div className="text-fairway-900">{product.name}</div>
                      <div className="text-xs text-fairway-500">
                        {item.size && <>Talla {item.size} · </>}
                        {formatPrice(product.price)} c/u
                      </div>
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        setQuantity(item.productId, Number(e.target.value), item.size)
                      }
                      className="w-14 rounded-md border border-cream-300 px-1.5 py-1 text-center"
                    />
                    <button
                      onClick={() => removeItem(item.productId, item.size)}
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
                className="w-full cursor-not-allowed rounded-lg bg-gold-300 px-4 py-2.5 text-sm font-semibold text-white opacity-70"
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
      </div>
    </div>
  )
}
