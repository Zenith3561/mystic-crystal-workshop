'use client'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { cartSubtotal, useCart } from '@/store/cart'
import { formatPrice } from '@/lib/format'

export default function CartDrawer() {
  const { lines, open, setOpen, remove } = useCart()
  const subtotal = cartSubtotal(lines)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-ink/40"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-sm flex-col bg-cream shadow-xl"
          >
            <header className="flex items-center justify-between border-b border-gold/20 px-5 py-4">
              <p className="font-display text-xl text-ink">
                Your Bag <span className="text-gold">購物袋</span>
              </p>
              <button
                onClick={() => setOpen(false)}
                aria-label="閂埋購物袋"
                className="text-2xl leading-none text-gold"
              >
                ✕
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-base text-ink/50">
                  Your bag is empty.
                  <br />
                  購物袋仲係空嘅。
                </p>
                <Link
                  href="/shop"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-gold/50 px-6 py-2.5 text-base text-gold transition-colors hover:bg-gold hover:text-white"
                >
                  Start shopping 去揀水晶
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-gold/15 overflow-y-auto px-5">
                  {lines.map((l) => (
                    <li key={l.id} className="flex gap-4 py-4">
                      <Link
                        href={`/shop/${l.slug}`}
                        onClick={() => setOpen(false)}
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white"
                      >
                        <Image src={l.image} alt="" fill className="object-cover" sizes="80px" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base text-ink">{l.name_en}</p>
                        <p className="truncate text-sm text-ink/55">{l.name_zh}</p>
                        <p className="mt-1 text-base text-gold">{formatPrice(l.price_hkd)}</p>
                      </div>
                      <button
                        onClick={() => remove(l.id)}
                        className="self-start text-sm text-ink/40 transition-colors hover:text-gold"
                      >
                        移除
                      </button>
                    </li>
                  ))}
                </ul>

                <footer className="border-t border-gold/20 px-5 py-5">
                  <div className="mb-1 flex justify-between text-base">
                    <span className="text-ink/60">Subtotal 小計</span>
                    <span className="text-ink">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="mb-4 text-sm text-ink/45">運費喺結帳頁計算。</p>
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl bg-gold px-7 py-3.5 text-center text-base text-white transition-colors hover:bg-bronze"
                  >
                    Checkout 去結帳
                  </Link>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
