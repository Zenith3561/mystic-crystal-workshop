'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ProductImages from '@/components/admin/ProductImages'
import type { Collection, Product, ProductStatus } from '@/types'

const field =
  'w-full rounded-xl border border-gold/30 bg-white px-4 py-2.5 text-base outline-none transition-colors focus:border-gold'
const labelClass = 'mb-1.5 block text-sm text-ink/60'

const STATUSES: Array<{ value: ProductStatus; label: string }> = [
  { value: 'active', label: '可以賣' },
  { value: 'reserved', label: '已為客人保留' },
  { value: 'sold_out', label: '已售出' },
  { value: 'hidden', label: '收起（唔喺網店顯示）' },
]

export default function ProductForm({
  product,
  collections,
}: {
  product?: Product
  collections: Collection[]
}) {
  const router = useRouter()
  const editing = Boolean(product)

  const [form, setForm] = useState({
    name_en: product?.name_en ?? '',
    name_zh: product?.name_zh ?? '',
    desc_en: product?.desc_en ?? '',
    desc_zh: product?.desc_zh ?? '',
    collection_slug: product?.collection_slug ?? '',
    price_hkd: product ? String(product.price_hkd) : '',
    compare_price_hkd: product?.compare_price_hkd ? String(product.compare_price_hkd) : '',
    weight_g: product?.weight_g !== undefined && product?.weight_g !== null ? String(product.weight_g) : '',
    size_cm: product?.size_cm ?? '',
    origin_en: product?.origin_en ?? '',
    origin_zh: product?.origin_zh ?? '',
    status: (product?.status ?? 'active') as ProductStatus,
    is_new: product?.is_new ?? true,
    featured: product?.featured ?? false,
    sort_order: product ? String(product.sort_order) : '0',
  })

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)

    const payload = {
      ...form,
      collection_slug: form.collection_slug || null,
      price_hkd: Number(form.price_hkd),
      compare_price_hkd: form.compare_price_hkd === '' ? null : Number(form.compare_price_hkd),
      weight_g: form.weight_g === '' ? null : Number(form.weight_g),
      size_cm: form.size_cm || null,
      sort_order: Number(form.sort_order) || 0,
    }

    try {
      const res = await fetch(
        editing ? `/api/admin/products/${product!.id}` : '/api/admin/products',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error ?? '儲存失敗')
        setBusy(false)
        return
      }

      if (editing) {
        setSaved(true)
        setBusy(false)
        router.refresh()
      } else {
        // A new piece goes straight to its own page so photos can be added.
        router.replace(`/admin/products/${data.id}`)
      }
    } catch {
      setError('連線失敗，請再試一次')
      setBusy(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name_zh" className={labelClass}>
              中文名 *
            </label>
            <input
              id="name_zh"
              className={field}
              value={form.name_zh}
              onChange={(e) => set('name_zh', e.target.value)}
              required
              placeholder="紫水晶晶洞"
            />
          </div>
          <div>
            <label htmlFor="name_en" className={labelClass}>
              English name *
            </label>
            <input
              id="name_en"
              className={field}
              value={form.name_en}
              onChange={(e) => set('name_en', e.target.value)}
              required
              placeholder="Amethyst Geode Cave"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="desc_zh" className={labelClass}>
              中文介紹
            </label>
            <textarea
              id="desc_zh"
              rows={4}
              className={`${field} resize-none`}
              value={form.desc_zh}
              onChange={(e) => set('desc_zh', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="desc_en" className={labelClass}>
              English description
            </label>
            <textarea
              id="desc_en"
              rows={4}
              className={`${field} resize-none`}
              value={form.desc_en}
              onChange={(e) => set('desc_en', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="price" className={labelClass}>
              售價 HK$ *
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="1"
              className={field}
              value={form.price_hkd}
              onChange={(e) => set('price_hkd', e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="compare" className={labelClass}>
              原價 HK$（會打橫線，可留空）
            </label>
            <input
              id="compare"
              type="number"
              min="0"
              step="1"
              className={field}
              value={form.compare_price_hkd}
              onChange={(e) => set('compare_price_hkd', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="collection" className={labelClass}>
              系列
            </label>
            <select
              id="collection"
              className={field}
              value={form.collection_slug ?? ''}
              onChange={(e) => set('collection_slug', e.target.value)}
            >
              <option value="">（唔屬於任何系列）</option>
              {collections.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name_zh} {c.name_en}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="size" className={labelClass}>
              尺寸
            </label>
            <input
              id="size"
              className={field}
              value={form.size_cm}
              onChange={(e) => set('size_cm', e.target.value)}
              placeholder="12 × 8 × 6 cm"
            />
          </div>
          <div>
            <label htmlFor="weight" className={labelClass}>
              重量（克）
            </label>
            <input
              id="weight"
              type="number"
              min="0"
              step="0.1"
              className={field}
              value={form.weight_g}
              onChange={(e) => set('weight_g', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="origin_zh" className={labelClass}>
              產地（中）
            </label>
            <input
              id="origin_zh"
              className={field}
              value={form.origin_zh}
              onChange={(e) => set('origin_zh', e.target.value)}
              placeholder="烏拉圭"
            />
          </div>
          <div>
            <label htmlFor="origin_en" className={labelClass}>
              產地（英）
            </label>
            <input
              id="origin_en"
              className={field}
              value={form.origin_en}
              onChange={(e) => set('origin_en', e.target.value)}
              placeholder="Uruguay"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="status" className={labelClass}>
              狀態
            </label>
            <select
              id="status"
              className={field}
              value={form.status}
              onChange={(e) => set('status', e.target.value as ProductStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sort" className={labelClass}>
              排序（細數字排前面）
            </label>
            <input
              id="sort"
              type="number"
              className={field}
              value={form.sort_order}
              onChange={(e) => set('sort_order', e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-base text-ink/75">
            <input
              type="checkbox"
              checked={form.is_new}
              onChange={(e) => set('is_new', e.target.checked)}
              className="h-4 w-4 accent-[#b69249]"
            />
            標示為「新上架」
          </label>
          <label className="flex items-center gap-2 text-base text-ink/75">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set('featured', e.target.checked)}
              className="h-4 w-4 accent-[#b69249]"
            />
            首頁精選
          </label>
        </div>

        {error && <p className="text-base text-red-600">{error}</p>}
        {saved && <p className="text-base text-green-700">已儲存。</p>}

        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-gold px-7 py-3 text-base text-white transition-colors hover:bg-bronze disabled:opacity-60"
        >
          {busy ? '儲存緊…' : editing ? '儲存改動' : '建立，然後加相'}
        </button>
      </form>

      {editing && (
        <div className="mt-12 border-t border-gold/20 pt-8">
          <ProductImages productId={product!.id} />
        </div>
      )}
    </div>
  )
}
