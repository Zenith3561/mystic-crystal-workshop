import CollectionsManager from '@/components/admin/CollectionsManager'
import { adminGetCollections, adminGetProducts } from '@/lib/admin-queries'

export const dynamic = 'force-dynamic'

export default async function AdminCollectionsPage() {
  const [collections, products] = await Promise.all([
    adminGetCollections(),
    adminGetProducts(),
  ])

  const counts: Record<string, number> = {}
  for (const p of products) {
    if (p.collection_slug) counts[p.collection_slug] = (counts[p.collection_slug] ?? 0) + 1
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-2">系列</h1>
      <p className="mb-8 text-base text-ink/50">
        系列係網店入面嘅分類，客人可以喺選購頁篩選。
      </p>
      <CollectionsManager collections={collections} counts={counts} />
    </div>
  )
}
