'use client'
import { useEffect, useState } from 'react'
import { useCart } from '@/store/cart'

export default function CartButton() {
  const count = useCart((s) => s.lines.length)
  const setOpen = useCart((s) => s.setOpen)
  // The cart is restored from localStorage after hydration; showing the
  // count only once mounted keeps server and client markup identical.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="打開購物袋"
      className="relative text-ink/80 transition-colors hover:text-gold"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 7h12l-1 13H7L6 7Z" strokeLinejoin="round" />
        <path d="M9 7a3 3 0 0 1 6 0" strokeLinecap="round" />
      </svg>
      {mounted && count > 0 && (
        <span className="absolute -right-2 -top-1.5 min-w-[18px] rounded-full bg-gold px-1 text-center text-[11px] leading-[18px] text-white">
          {count}
        </span>
      )}
    </button>
  )
}
