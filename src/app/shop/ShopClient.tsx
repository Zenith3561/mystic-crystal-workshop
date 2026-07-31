'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import FadeIn from '@/components/FadeIn'
import ProductCard from '@/components/ProductCard'
import { products, collections } from '@/lib/data'

export default function ShopClient() {
  const params = useSearchParams()
  const router = useRouter()
  const active = params.get('collection')
  const shown = active ? products.filter((p) => p.collection === active) : products

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <FadeIn>
        <h1 className="font-display text-4xl text-ink mb-2">
          shop <span className="text-gold">選購水晶</span>
        </h1>
        <p className="text-sm text-ink/60 mb-10">
          Every piece hand-selected. 每一件都經人手挑選。
        </p>
      </FadeIn>

      <div className="flex flex-wrap gap-3 mb-10">
        <button
          onClick={() => router.push('/shop')}
          className={`rounded-full px-5 py-2 text-sm transition-colors ${
            !active ? 'bg-gold text-white' : 'border border-gold/40 text-gold hover:bg-gold/10'
          }`}
        >
          all 全部
        </button>
        {collections.map((c) => (
          <button
            key={c.slug}
            onClick={() => router.push(`/shop?collection=${c.slug}`)}
            className={`rounded-full px-5 py-2 text-sm transition-colors ${
              active === c.slug ? 'bg-gold text-white' : 'border border-gold/40 text-gold hover:bg-gold/10'
            }`}
          >
            {c.nameEn} {c.nameZh}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {shown.map((p, i) => (
          <FadeIn key={p.id} delay={i * 0.05}>
            <ProductCard product={p} />
          </FadeIn>
        ))}
      </div>

      {shown.length === 0 && (
        <p className="text-center text-ink/50 py-20">No products found. 此系列暫時沒有貨品。</p>
      )}
    </div>
  )
}
