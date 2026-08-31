import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import FadeIn from '@/components/FadeIn'
import ProductGallery from '@/components/ProductGallery'
import AddToCart from '@/components/AddToCart'
import { formatPrice } from '@/lib/format'
import { getCollections, getProductBySlug, getSettings } from '@/lib/queries'

export const revalidate = 0

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Not found | Mystic Crystal Workshop' }
  return {
    title: `${product.name_en} ${product.name_zh} | Mystic Crystal Workshop 神秘水晶工坊`,
    description: product.desc_zh || product.desc_en || undefined,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [product, collections, settings] = await Promise.all([
    getProductBySlug(slug),
    getCollections(),
    getSettings(),
  ])

  if (!product) notFound()

  const collection = collections.find((c) => c.slug === product.collection_slug)
  const sold = product.status === 'sold_out' || product.status === 'reserved'
  const whatsapp = settings.whatsapp_number

  const details: Array<[string, string]> = []
  if (product.size_cm) details.push(['Size 尺寸', product.size_cm])
  if (product.weight_g !== null) details.push(['Weight 重量', `${product.weight_g} g`])
  if (product.origin_en || product.origin_zh)
    details.push(['Origin 產地', [product.origin_en, product.origin_zh].filter(Boolean).join(' ')])

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
      <nav className="mb-8 text-sm text-ink/45">
        <Link href="/shop" className="hover:text-gold transition-colors">
          Shop 選購水晶
        </Link>
        {collection && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/shop?collection=${collection.slug}`}
              className="hover:text-gold transition-colors"
            >
              {collection.name_en} {collection.name_zh}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <FadeIn>
          <ProductGallery
            images={product.images}
            alt={`${product.name_en} ${product.name_zh}`}
            sold={sold}
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-sm tracking-[0.35em] uppercase text-gold mb-4">
            One of a kind 獨一無二
          </p>
          <h1 className="font-display text-4xl text-ink leading-tight mb-1">
            {product.name_en}
          </h1>
          <p className="font-display text-2xl text-bronze mb-6">{product.name_zh}</p>

          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-3xl text-gold">{formatPrice(product.price_hkd)}</span>
            {product.compare_price_hkd !== null &&
              product.compare_price_hkd > product.price_hkd && (
                <span className="text-base text-ink/40 line-through">
                  {formatPrice(product.compare_price_hkd)}
                </span>
              )}
          </div>

          {(product.desc_en || product.desc_zh) && (
            <div className="space-y-2 mb-8 text-base text-ink/70 leading-relaxed">
              {product.desc_en && <p>{product.desc_en}</p>}
              {product.desc_zh && <p>{product.desc_zh}</p>}
            </div>
          )}

          {details.length > 0 && (
            <dl className="mb-8 divide-y divide-gold/15 border-y border-gold/15">
              {details.map(([label, value]) => (
                <div key={label} className="flex justify-between py-3 text-base">
                  <dt className="text-ink/50">{label}</dt>
                  <dd className="text-ink/80">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          <AddToCart product={product} whatsapp={whatsapp} />

          <p className="mt-6 text-sm text-ink/45 leading-relaxed">
            每件水晶都係天然原礦，紋理、顏色同大小會有輕微差異，相片以實物拍攝。
            <br />
            Each piece is natural and unique; the photo is of the exact piece you receive.
          </p>
        </FadeIn>
      </div>
    </div>
  )
}
