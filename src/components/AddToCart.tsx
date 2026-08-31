'use client'
import { useCart } from '@/store/cart'
import type { Product } from '@/types'

export default function AddToCart({
  product,
  whatsapp,
}: {
  product: Product
  whatsapp: string
}) {
  const add = useCart((s) => s.add)
  const inCart = useCart((s) => s.lines.some((l) => l.id === product.id))
  const sold = product.status === 'sold_out' || product.status === 'reserved'

  if (sold) {
    return (
      <div>
        <button
          disabled
          className="w-full cursor-not-allowed rounded-xl border border-ink/20 px-7 py-3.5 text-base text-ink/40"
        >
          Sold out 已售出
        </button>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
              `你好，想問下【${product.name_zh}】仲有冇類似嘅水晶？`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-center text-base text-gold hover:text-bronze transition-colors"
          >
            想搵類似嘅？WhatsApp 問下我哋 →
          </a>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => add(product)}
      className="w-full rounded-xl bg-gold px-7 py-3.5 text-base text-white transition-colors hover:bg-bronze"
    >
      {inCart ? 'In your bag 已喺購物袋 — 再睇一次' : 'Add to bag 加入購物袋'}
    </button>
  )
}
