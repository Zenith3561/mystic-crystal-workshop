import Image from 'next/image'
import Link from 'next/link'
import HeroHome from '@/components/HeroHome'
import FadeIn from '@/components/FadeIn'
import ProductCard from '@/components/ProductCard'
import { products, collections, philosophy } from '@/lib/data'

export default function Home() {
  const newArrivals = products.filter((p) => p.isNew)
  const featured = collections[0]

  return (
    <>
      <HeroHome />

      {/* New arrivals */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <FadeIn>
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display text-4xl text-ink">
              New Arrivals <span className="text-gold">最新上架</span>
            </h2>
            <Link href="/shop" className="text-base text-gold hover:text-bronze transition-colors">
              View All 檢視全部 →
            </Link>
          </div>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {newArrivals.map((p, i) => (
            <FadeIn key={p.id} delay={i * 0.08}>
              <ProductCard product={p} />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Featured collection banner */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <FadeIn>
          <div className="relative overflow-hidden rounded-xl bg-ink text-cream md:grid md:grid-cols-2">
            <div className="relative aspect-[4/3] md:aspect-auto">
              <Image
                src="/images/rose-quartz-sphere.png"
                alt={`${featured.nameEn} ${featured.nameZh}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="p-10 md:p-14 flex flex-col justify-center">
              <p className="text-sm tracking-[0.35em] uppercase text-gold mb-4">Featured Collection 精選系列</p>
              <h2 className="font-display text-4xl mb-3">
                【{featured.nameEn} {featured.nameZh}】
              </h2>
              <p className="text-base text-cream/70 leading-relaxed mb-2">{featured.descEn}</p>
              <p className="text-base text-cream/70 leading-relaxed mb-8">{featured.descZh}</p>
              <Link
                href={`/shop?collection=${featured.slug}`}
                className="self-start rounded-xl border border-gold/60 px-6 py-2.5 text-base text-gold hover:bg-gold hover:text-white transition-colors"
              >
                Explore 探索系列
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Philosophy */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <FadeIn>
          <h2 className="font-display text-4xl text-ink text-center mb-12">
            Our Philosophy <span className="text-gold">品牌理念</span>
          </h2>
        </FadeIn>
        <div className="grid gap-8 md:grid-cols-3">
          {philosophy.map((item, i) => (
            <FadeIn key={item.titleEn} delay={i * 0.1}>
              <div className="text-center px-4">
                <h3 className="font-display text-2xl text-bronze mb-1">{item.titleEn}</h3>
                <p className="text-sm tracking-[0.3em] text-gold mb-4">{item.titleZh}</p>
                <p className="text-base text-ink/65 leading-relaxed">{item.bodyEn}</p>
                <p className="text-base text-ink/65 leading-relaxed mt-1">{item.bodyZh}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </>
  )
}
