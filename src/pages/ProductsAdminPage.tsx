import { useEffect, useState } from 'react'
import { CLOTHING_SIZES, DEFAULT_SHIPPING_TIME, type Product } from '../data/products'
import {
  addProduct,
  deleteProduct,
  importPrintfulProduct,
  loadProducts,
  reorderProduct,
  updateProduct,
} from '../lib/productStore'
import { getPrintfulProduct, listPrintfulProducts, type PrintfulListItem } from '../lib/printful'

interface ProductDraft {
  name: string
  description: string
  priceInput: string
  category: string
  hasSizes: boolean
  sizesInput: string
  placeholderEmoji: string
  shippingTime: string
}

function toDraft(p?: Product): ProductDraft {
  return {
    name: p?.name ?? '',
    description: p?.description ?? '',
    priceInput: p ? String(p.price) : '',
    category: p?.category ?? 'Ropa',
    hasSizes: Boolean(p?.sizes),
    sizesInput: (p?.sizes ?? CLOTHING_SIZES).join(', '),
    placeholderEmoji: p?.placeholderEmoji ?? '🏌️',
    shippingTime: p?.shippingTime ?? DEFAULT_SHIPPING_TIME,
  }
}

function draftToProduct(draft: ProductDraft, existing?: Product): Omit<Product, 'id'> {
  return {
    name: draft.name.trim(),
    description: draft.description.trim(),
    price: Number(draft.priceInput) || 0,
    category: draft.category.trim() || 'Ropa',
    sizes: draft.hasSizes
      ? draft.sizesInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined,
    images: existing?.images,
    specs: existing?.specs,
    placeholderEmoji: draft.placeholderEmoji || undefined,
    shippingTime: draft.shippingTime.trim() || undefined,
  }
}

function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Product
  onSave: (product: Omit<Product, 'id'>) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<ProductDraft>(() => toDraft(initial))

  function update<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function handleSave() {
    if (!draft.name.trim()) return
    onSave(draftToProduct(draft, initial))
  }

  return (
    <div className="space-y-3 rounded-xl border border-fairway-400 bg-white p-4 shadow-sm">
      <div>
        <label className="block text-xs font-medium text-fairway-700 mb-1">Nombre</label>
        <input
          type="text"
          value={draft.name}
          onChange={(e) => update('name', e.target.value)}
          className="w-full rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-fairway-700 mb-1">Descripción</label>
        <textarea
          rows={3}
          value={draft.description}
          onChange={(e) => update('description', e.target.value)}
          className="w-full rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-fairway-700 mb-1">Precio (€)</label>
          <input
            type="number"
            step="0.01"
            value={draft.priceInput}
            onChange={(e) => update('priceInput', e.target.value)}
            className="w-full rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-fairway-700 mb-1">Categoría</label>
          <input
            type="text"
            value={draft.category}
            onChange={(e) => update('category', e.target.value)}
            className="w-full rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-xs font-medium text-fairway-700">
          <input
            type="checkbox"
            checked={draft.hasSizes}
            onChange={(e) => update('hasSizes', e.target.checked)}
          />
          Aplica tallas
        </label>
        {draft.hasSizes && (
          <input
            type="text"
            value={draft.sizesInput}
            onChange={(e) => update('sizesInput', e.target.value)}
            className="mt-1 w-full rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900"
          />
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-fairway-700 mb-1">
          Plazo de envío de este producto
        </label>
        <input
          type="text"
          value={draft.shippingTime}
          onChange={(e) => update('shippingTime', e.target.value)}
          className="w-full rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900"
        />
      </div>

      <div className="rounded-lg border border-gold-400 bg-gold-400/10 p-3 text-xs text-fairway-700">
        Esto se guarda de verdad y ya lo ven tus clientes en la Shop. Si el
        producto ya existe en tu tienda de Printful, mejor usa "Importar
        desde Printful" para traer las fotos automáticamente — desde aquí, sin
        fotos, se muestra con un emoji.
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="rounded-md bg-fairway-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-fairway-800"
        >
          Guardar producto
        </button>
        <button
          onClick={onCancel}
          className="rounded-md border border-cream-300 px-3 py-1.5 text-xs text-fairway-600 transition hover:border-fairway-400"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

function PrintfulImportPanel({
  onImported,
  onClose,
}: {
  onImported: (products: Product[]) => void
  onClose: () => void
}) {
  const [items, setItems] = useState<PrintfulListItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importingId, setImportingId] = useState<number | null>(null)

  useEffect(() => {
    listPrintfulProducts()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al listar productos'))
  }, [])

  async function handleImport(id: number) {
    setImportingId(id)
    setError(null)
    try {
      const detail = await getPrintfulProduct(id)
      onImported(await importPrintfulProduct(detail))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo importar el producto')
    } finally {
      setImportingId(null)
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-fairway-400 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-fairway-900">Importar desde Printful</h3>
        <button
          onClick={onClose}
          className="text-xs text-fairway-500 underline-offset-2 hover:underline"
        >
          Cerrar
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {items === null && !error ? (
        <p className="text-sm text-fairway-500">Cargando catálogo de Printful...</p>
      ) : items && items.length === 0 ? (
        <p className="text-sm text-fairway-500">No hay productos en tu tienda de Printful.</p>
      ) : (
        <div className="space-y-2">
          {items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-cream-300 p-2"
            >
              <div className="flex items-center gap-2">
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="h-10 w-10 rounded object-cover"
                  />
                )}
                <span className="text-sm text-fairway-900">{item.name}</span>
              </div>
              <button
                onClick={() => handleImport(item.id)}
                disabled={importingId === item.id}
                className="shrink-0 rounded-md bg-fairway-700 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-fairway-800 disabled:opacity-60"
              >
                {importingId === item.id ? 'Importando...' : 'Importar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [importingFromPrintful, setImportingFromPrintful] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-fairway-900">Productos del Shop</h1>
        <p className="mt-1 text-sm text-fairway-600">
          {loading ? 'Cargando...' : `${products.length} productos.`} Visibles
          para todos tus clientes; solo tú puedes editarlos. Usa las flechas ▲▼
          para cambiar el orden en el que aparecen en la Shop.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setAdding((v) => !v)}
          className="rounded-lg bg-fairway-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-fairway-800"
        >
          {adding ? 'Cancelar' : '+ Añadir producto'}
        </button>
        <button
          onClick={() => setImportingFromPrintful((v) => !v)}
          className="rounded-lg border border-fairway-400 px-3 py-2 text-sm font-medium text-fairway-800 transition hover:border-fairway-600"
        >
          {importingFromPrintful ? 'Cancelar' : 'Importar desde Printful'}
        </button>
      </div>

      {importingFromPrintful && (
        <PrintfulImportPanel
          onImported={setProducts}
          onClose={() => setImportingFromPrintful(false)}
        />
      )}

      {adding && (
        <ProductForm
          onSave={async (p) => {
            setProducts(await addProduct(p))
            setAdding(false)
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      <div className="space-y-3">
        {products.map((product, idx) =>
          editingId === product.id ? (
            <ProductForm
              key={product.id}
              initial={product}
              onSave={async (p) => {
                setProducts(await updateProduct(product.id, p))
                setEditingId(null)
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-xl border border-cream-300 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={async () =>
                      setProducts(
                        await reorderProduct(
                          products.map((p) => p.id),
                          product.id,
                          'up',
                        ),
                      )
                    }
                    disabled={idx === 0}
                    aria-label={`Subir ${product.name}`}
                    className="rounded border border-cream-300 px-1.5 text-xs text-fairway-600 transition hover:border-fairway-400 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    onClick={async () =>
                      setProducts(
                        await reorderProduct(
                          products.map((p) => p.id),
                          product.id,
                          'down',
                        ),
                      )
                    }
                    disabled={idx === products.length - 1}
                    aria-label={`Bajar ${product.name}`}
                    className="rounded border border-cream-300 px-1.5 text-xs text-fairway-600 transition hover:border-fairway-400 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
                <div>
                  <div className="font-medium text-fairway-900">{product.name}</div>
                  <div className="text-xs text-fairway-500">
                    {product.category} · {product.price.toFixed(2)}€
                    {product.sizes ? ` · Tallas: ${product.sizes.join(', ')}` : ''}
                    {product.colors?.length ? ` · ${product.colors.length} colores` : ''}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setEditingId(product.id)}
                  className="rounded-md border border-cream-300 px-2.5 py-1 text-xs font-medium text-fairway-700 transition hover:border-fairway-400"
                >
                  Editar
                </button>
                <button
                  onClick={async () => setProducts(await deleteProduct(product.id))}
                  className="rounded-md border border-cream-300 px-2.5 py-1 text-xs text-fairway-500 transition hover:border-red-400 hover:text-red-500"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  )
}
