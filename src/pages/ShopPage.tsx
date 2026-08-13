import { useEffect, useState } from 'react'
import type { Product } from '../data/products'
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
      <img
        src={images[active]}
        alt={alt}
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
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-cream-100">
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
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
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

function ProductCard({
  product,
  onAdd,
}: {
  product: Product
  onAdd: (size?: string, color?: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
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

  return (
    <div className="flex flex-col rounded-2xl border border-cream-300 bg-white p-5 shadow-sm">
      <div className="mb-3">
        <ProductGallery
          images={galleryImages}
          name={product.name}
          placeholderEmoji={product.placeholderEmoji}
        />
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

      {hasColors && (
        <div className="mt-3">
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
                style={{ backgroundColor: colorNameToHex(c.name) }}
              />
            ))}
          </div>
        </div>
      )}

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
            {availableSizes.map((s) => (
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
          onClick={() => onAdd(needsSize ? size : undefined, activeColor?.name)}
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
  const { addItem } = useCart()

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
              onAdd={(size, color) => addItem(product.id, size, color)}
            />
          ))}
        </div>

        <CartPanel className="hidden h-fit rounded-2xl border border-cream-300 bg-white p-5 shadow-sm lg:block lg:sticky lg:top-6" />
      </div>
    </div>
  )
}
