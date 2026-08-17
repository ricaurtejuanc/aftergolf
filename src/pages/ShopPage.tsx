import { useEffect, useState } from 'react'
import { DEFAULT_SHIPPING_TIME, type Product } from '../data/products'
import { loadProducts } from '../lib/productStore'
import { useCart } from '../context/CartContext'
import { CartPanel } from '../components/CartPanel'
import { formatPrice } from '../lib/format'
import { colorNameToHex } from '../lib/colorSwatches'

function ProductLightbox({
  alt,
  images,
  active,
  onClose,
  onNavigate,
}: {
  alt: string
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
      <div
        className="max-h-full max-w-full overflow-hidden rounded-lg bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={images[active]} alt={alt} className="max-h-[85vh] max-w-[90vw] object-contain" />
      </div>
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

function ProductGallery({
  images,
  name,
  placeholderEmoji,
}: {
  images: string[]
  name: string
  placeholderEmoji?: string
}) {
  const [active, setActive] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Reset to the first photo whenever the image set changes (e.g. switching
  // color), so we never point past the end of a shorter set.
  useEffect(() => {
    setActive(0)
  }, [images])

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-cream-100">
        <span className="text-5xl" aria-hidden>
          {placeholderEmoji ?? '🏌️'}
        </span>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="block w-full cursor-zoom-in"
        aria-label={`Ampliar foto de ${name}`}
      >
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-white">
          <img
            src={images[active]}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
      </button>
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, idx) => (
            <button
              key={src}
              onClick={() => setActive(idx)}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition ${
                idx === active ? 'border-fairway-600' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              aria-label={`Foto ${idx + 1} de ${name}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <ProductLightbox
          alt={name}
          images={images}
          active={active}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setActive}
        />
      )}
    </div>
  )
}

function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const thumbnail = product.images?.[0] ?? product.colors?.[0]?.images[0]

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col overflow-hidden rounded-2xl border border-cream-300 bg-white text-left shadow-sm transition hover:border-fairway-400 hover:shadow-md"
    >
      <div
        className={`flex aspect-square w-full items-center justify-center overflow-hidden ${thumbnail ? 'bg-white' : 'bg-cream-100'}`}
      >
        {thumbnail ? (
          <img src={thumbnail} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-5xl" aria-hidden>
            {product.placeholderEmoji ?? '🏌️'}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-gold-600">
          {product.category}
        </div>
        <h2 className="mt-1 font-semibold text-fairway-900">{product.name}</h2>
        <div className="mt-auto pt-3">
          <span className="block text-lg font-semibold text-fairway-900">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs font-medium text-fairway-600">Ver detalles</span>
        </div>
      </div>
    </button>
  )
}

function ProductDetailModal({
  product,
  onClose,
  onAdd,
}: {
  product: Product
  onClose: () => void
  onAdd: (size?: string, color?: string) => void
}) {
  const [size, setSize] = useState('')
  const [colorIdx, setColorIdx] = useState(0)

  const hasColors = Boolean(product.colors?.length)
  const activeColor = hasColors ? product.colors![colorIdx] : undefined
  const availableSizes = (activeColor?.sizes.length ? activeColor.sizes : product.sizes) ?? []
  const needsSize = availableSizes.length > 0
  const galleryImages = activeColor?.images.length ? activeColor.images : (product.images ?? [])

  function selectColor(idx: number) {
    setColorIdx(idx)
    setSize('')
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Without this, the page behind the modal can still scroll — on mobile a
  // scroll gesture that starts inside the modal (e.g. scrolling down to
  // reach the size selector) can "leak" into the page once the modal's own
  // content hits its scroll limit. Plain `overflow: hidden` on body doesn't
  // reliably stop that on iOS Safari (it still lets the page rubber-band),
  // so instead the body is taken out of flow entirely with `position:
  // fixed` at its current scroll offset, and restored to that same
  // position on close.
  useEffect(() => {
    const scrollY = window.scrollY
    const { style } = document.body
    const previous = {
      position: style.position,
      top: style.top,
      left: style.left,
      right: style.right,
      width: style.width,
    }
    style.position = 'fixed'
    style.top = `-${scrollY}px`
    style.left = '0'
    style.right = '0'
    style.width = '100%'
    return () => {
      style.position = previous.position
      style.top = previous.top
      style.left = previous.left
      style.right = previous.right
      style.width = previous.width
      window.scrollTo(0, scrollY)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/50 p-4"
      onClick={onClose}
    >
      {/* Fixed to the viewport (not the scrolling backdrop), so it's always
          reachable without scrolling back up — needed on mobile Safari,
          where the address bar can cover an in-flow close button. */}
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="fixed right-4 top-4 z-[60] flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl leading-none text-fairway-600 shadow-md transition hover:text-fairway-900"
      >
        ✕
      </button>

      <div
        className="mx-auto my-8 w-full max-w-2xl rounded-2xl bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gold-600">
            {product.category}
          </div>
          <h2 className="mt-1 pr-10 text-xl font-semibold text-fairway-900">{product.name}</h2>
        </div>

        <div className="mt-4">
          <ProductGallery
            images={galleryImages}
            name={product.name}
            placeholderEmoji={product.placeholderEmoji}
          />
        </div>

        <p className="mt-4 text-sm text-fairway-600">{product.description}</p>
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

        {hasColors && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-fairway-700 mb-1">
              Color: <span className="font-normal text-fairway-600">{activeColor!.name}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {product.colors!.map((c, idx) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => selectColor(idx)}
                  title={c.name}
                  aria-label={c.name}
                  aria-pressed={idx === colorIdx}
                  className={`h-7 w-7 rounded-md border-2 transition ${
                    idx === colorIdx ? 'border-fairway-600' : 'border-cream-300 hover:border-fairway-400'
                  }`}
                  style={{ backgroundColor: c.code || colorNameToHex(c.name) }}
                />
              ))}
            </div>
          </div>
        )}

        {needsSize && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-fairway-700 mb-1">Talla</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full rounded-lg border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
            >
              <option value="" disabled>
                Selecciona talla
              </option>
              {availableSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-fairway-900">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={() => onAdd(needsSize ? size : undefined, activeColor?.name)}
            disabled={needsSize && !size}
            className="rounded-lg bg-fairway-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-fairway-800 disabled:cursor-not-allowed disabled:bg-fairway-300"
          >
            {needsSize && !size ? 'Selecciona talla' : 'Añadir'}
          </button>
        </div>

        <p className="mt-3 text-xs text-fairway-500">
          {product.shippingTime || DEFAULT_SHIPPING_TIME}
        </p>
      </div>
    </div>
  )
}

// The admin sets a free-text category per product (default "Ropa"), so the
// Shop's two filters just bucket by whether that text is literally "Ropa"
// or anything else — no separate taxonomy to maintain.
function isClothing(category: string): boolean {
  return category.trim().toLowerCase() === 'ropa'
}

function AddedToast({ message }: { message: string }) {
  return (
    <div className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-6">
      <div className="rounded-lg bg-fairway-800 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
        {message}
      </div>
    </div>
  )
}

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [openProductId, setOpenProductId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<'ropa' | 'articulos'>('ropa')

  useEffect(() => {
    loadProducts().then(setProducts)
  }, [])
  const { addItem } = useCart()
  const openProduct = products.find((p) => p.id === openProductId) ?? null
  const filteredProducts = products.filter((p) =>
    categoryFilter === 'ropa' ? isClothing(p.category) : !isClothing(p.category),
  )

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  function handleAdd(productId: string, size?: string, color?: string) {
    addItem(productId, size, color)
    setOpenProductId(null)
    setToast('Producto añadido al carrito correctamente')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-fairway-900">Shop</h1>
        <p className="mt-1 text-sm text-fairway-600">
          Aquí puedes ver el catálogo de merchandising de AfterGolf.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter('ropa')}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                categoryFilter === 'ropa'
                  ? 'bg-fairway-800 text-cream-50'
                  : 'border border-cream-300 text-fairway-800 hover:border-fairway-400'
              }`}
            >
              Ropa
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('articulos')}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                categoryFilter === 'articulos'
                  ? 'bg-fairway-800 text-cream-50'
                  : 'border border-cream-300 text-fairway-800 hover:border-fairway-400'
              }`}
            >
              Artículos
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <p className="mt-6 text-sm text-fairway-500">Todavía no hay productos en esta categoría.</p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpen={() => setOpenProductId(product.id)}
                />
              ))}
            </div>
          )}
        </div>

        <CartPanel className="hidden h-fit rounded-2xl border border-cream-300 bg-white p-5 shadow-sm lg:block lg:sticky lg:top-6" />
      </div>

      {openProduct && (
        <ProductDetailModal
          product={openProduct}
          onClose={() => setOpenProductId(null)}
          onAdd={(size, color) => handleAdd(openProduct.id, size, color)}
        />
      )}

      {toast && <AddedToast message={toast} />}
    </div>
  )
}
