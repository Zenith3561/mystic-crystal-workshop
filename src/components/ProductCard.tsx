'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { formatPrice, type Product } from '@/lib/data'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden bg-white shadow-sm mb-3">
        <Image
          src={product.image}
          alt={`${product.nameEn} ${product.nameZh}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {product.isNew && (
          <span className="absolute top-3 left-3 rounded-full bg-gold px-3 py-1 text-[10px] tracking-wider text-white">
            NEW 新上架
          </span>
        )}
      </div>
      <h3 className="text-sm text-ink leading-snug mb-1">
        {product.nameEn} {product.nameZh}
      </h3>
      <p className="text-sm text-gold">{formatPrice(product.priceHkd)}</p>
    </motion.article>
  )
}
