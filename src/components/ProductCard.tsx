'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/types'

export default function ProductCard({ product }: { product: Product }) {
  const sold = product.status === 'sold_out' || product.status === 'reserved'

  return (
    <motion.article whileHover={{ y: sold ? 0 : -6 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="group">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-white shadow-sm mb-3">
          <Image
            src={product.images[0]}
            alt={`${product.name_en} ${product.name_zh}`}
            fill
            className={`object-cover transition-transform duration-500 ${
              sold ? 'opacity-60' : 'group-hover:scale-105'
            }`}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {sold ? (
            <span className="absolute top-3 left-3 rounded-full bg-ink/80 px-3 py-1 text-[10px] tracking-wider text-cream">
              SOLD 已售出
            </span>
          ) : (
            product.is_new && (
              <span className="absolute top-3 left-3 rounded-full bg-gold px-3 py-1 text-[10px] tracking-wider text-white">
                NEW 新上架
              </span>
            )
          )}
        </div>
        <h3 className="text-base text-ink leading-snug mb-1">
          {product.name_en} {product.name_zh}
        </h3>
        <p className="text-base text-gold">{formatPrice(product.price_hkd)}</p>
      </Link>
    </motion.article>
  )
}
