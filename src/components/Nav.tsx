'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { brand } from '@/lib/data'
import CartButton from '@/components/CartButton'
import CartDrawer from '@/components/CartDrawer'

const links = [
  { href: '/', en: 'Home', zh: '主頁' },
  { href: '/shop', en: 'Shop', zh: '選購水晶' },
  { href: '/about', en: 'About', zh: '關於我們' },
  { href: '/contact', en: 'Contact', zh: '聯絡我們' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 bg-cream/90 backdrop-blur border-b border-gold/20"
    >
      <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="font-display text-xl tracking-wide text-ink">{brand.nameEn}</span>
          <span className="text-[11px] tracking-[0.3em] text-gold">{brand.nameZh}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-base text-ink/80 hover:text-gold transition-colors"
            >
              {l.en} <span className="text-gold/80">{l.zh}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <CartButton />
          <button
            className="md:hidden text-gold text-2xl leading-none"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-gold/20 bg-cream px-5 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-base text-ink/80"
            >
              {l.en} <span className="text-gold/80">{l.zh}</span>
            </Link>
          ))}
        </nav>
      )}
      <CartDrawer />
    </motion.header>
  )
}
