import type { Metadata } from 'next'
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'
import ProductCard from '@/components/ProductCard'
import { getCollections, getProducts } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'shop 選購水晶 | Mystic Crystal Workshop 神秘水晶工坊',
  description: '選購天然水晶 — 晶洞、晶簇、水晶球、手把件，香港本地發貨。',
}

export const revalidate = 0

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string }>
}) {
  const { collection } = await searchParams
  const [collections, products] = await Promise.all([
    getCollections(),
    getProducts(collection),
  ])

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <FadeIn>
        <h1 className="font-display text-5xl text-ink mb-2">
          Shop <span className="text-gold">選購水晶</span>
        </h1>
        <p className="text-base text-ink/60 mb-10">
          Every piece hand-selected, and one of a kind. 每一件都經人手挑選，獨一無二。
        </p>
      </FadeIn>

      <div className="flex flex-wrap gap-3 mb-10">
        <Link
          href="/shop"
          className={`rounded-full px-5 py-2 text-base transition-colors ${
            !collection ? 'bg-gold text-white' : 'border border-gold/40 text-gold hover:bg-gold/10'
          }`}
        >
          All 全部
        </Link>
        {collections.map((c) => (
          <Link
            key={c.slug}
            href={`/shop?collection=${c.slug}`}
            className={`rounded-full px-5 py-2 text-base transition-colors ${
              collection === c.slug
                ? 'bg-gold text-white'
                : 'border border-gold/40 text-gold hover:bg-gold/10'
            }`}
          >
            {c.name_en} {c.name_zh}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {products.map((p, i) => (
          <FadeIn key={p.id} delay={i * 0.05}>
            <ProductCard product={p} />
          </FadeIn>
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-base text-ink/50 py-20">
          No products found. 此系列暫時沒有貨品。
        </p>
      )}
    </div>
  )
}
