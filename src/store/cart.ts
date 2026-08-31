'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types'

/**
 * Each crystal is a single piece, so the cart is a set, not a tally:
 * a product is either in it once or not at all.
 */
export interface CartLine {
  id: string
  slug: string
  name_en: string
  name_zh: string
  price_hkd: number
  image: string
}

interface CartState {
  lines: CartLine[]
  open: boolean
  add: (product: Product) => void
  remove: (id: string) => void
  clear: () => void
  has: (id: string) => boolean
  setOpen: (open: boolean) => void
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      open: false,
      add: (product) =>
        set((state) =>
          state.lines.some((l) => l.id === product.id)
            ? { open: true }
            : {
                open: true,
                lines: [
                  ...state.lines,
                  {
                    id: product.id,
                    slug: product.slug,
                    name_en: product.name_en,
                    name_zh: product.name_zh,
                    price_hkd: product.price_hkd,
                    image: product.images[0],
                  },
                ],
              }
        ),
      remove: (id) =>
        set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [] }),
      has: (id) => get().lines.some((l) => l.id === id),
      setOpen: (open) => set({ open }),
    }),
    { name: 'mcw-crystal-cart', partialize: (s) => ({ lines: s.lines }) }
  )
)

export const cartSubtotal = (lines: CartLine[]) =>
  lines.reduce((sum, l) => sum + l.price_hkd, 0)
