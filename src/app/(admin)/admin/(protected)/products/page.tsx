import Image from 'next/image'
import Link from 'next/link'
import { adminGetCollections, adminGetProducts } from '@/lib/admin-queries'
import { formatPrice } from '@/lib/format'
import type { ProductStatus } from '@/types'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<ProductStatus, { text: string; className: string }> = {
  active: { text: '可以賣', className: 'text-green-700 bg-green-50' },
  reserved: { text: '保留中', className: 'text-amber-700 bg-amber-50' },
  sold_out: { text: '已售出', className: 'text-ink/60 bg-ink/5' },
  hidden: { text: '已收起', className: 'text-ink/45 bg-ink/5' },
}

export default async function AdminProductsPage() {
  const [products, collections] = await Promise.all([
    adminGetProducts(),
    adminGetCollections(),
  ])
  const collectionName = new Map(collections.map((c) => [c.slug, c.name_zh]))

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">水晶貨品</h1>
          <p className="text-base text-ink/50">
            合共 {products.length} 件，其中 {products.filter((p) => p.status === 'active').length}{' '}
            件可以賣
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-xl bg-gold px-6 py-2.5 text-base text-white transition-colors hover:bg-bronze"
        >
          + 加一件水晶
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="rounded-xl border border-gold/20 bg-white/60 py-16 text-center text-base text-ink/45">
          仲未有貨品。撳右上角加第一件。
        </p>
      ) : (
        <ul className="space-y-2">
          {products.map((p) => {
            const status = STATUS_LABEL[p.status]
            return (
              <li key={p.id}>
                <Link
                  href={`/admin/products/${p.id}`}
                  className="flex items-center gap-4 rounded-xl border border-gold/20 bg-white/60 p-3 transition-colors hover:border-gold/50"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
                    <Image src={p.images[0]} alt="" fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base text-ink">{p.name_zh}</p>
                    <p className="truncate text-sm text-ink/50">{p.name_en}</p>
                    <p className="text-sm text-ink/40">
                      {p.collection_slug
                        ? collectionName.get(p.collection_slug) ?? '（系列已刪除）'
                        : '未分系列'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base text-gold">{formatPrice(p.price_hkd)}</p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-sm ${status.className}`}
                    >
                      {status.text}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
