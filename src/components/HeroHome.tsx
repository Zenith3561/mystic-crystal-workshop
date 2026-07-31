'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { brand } from '@/lib/data'

export default function HeroHome() {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-14 pb-20 grid items-center gap-10 md:grid-cols-[1.1fr_1fr]">
      <div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-xs tracking-[0.35em] uppercase text-gold mb-6"
        >
          Hong Kong crystal boutique 香港水晶專門店
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12, ease: 'easeOut' }}
          className="font-display text-5xl md:text-6xl leading-[1.08] text-ink mb-4"
        >
          {brand.taglineEn}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.24, ease: 'easeOut' }}
          className="font-display text-xl text-bronze mb-8"
        >
          {brand.taglineZh}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.36, ease: 'easeOut' }}
          className="flex flex-wrap gap-4"
        >
          <Link
            href="/shop"
            className="rounded-xl bg-gold px-7 py-3 text-sm text-white hover:bg-bronze transition-colors"
          >
            shop crystals 選購水晶
          </Link>
          <Link
            href="/about"
            className="rounded-xl border border-gold/50 px-7 py-3 text-sm text-gold hover:bg-gold/10 transition-colors"
          >
            our story 品牌故事
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg shadow-gold/15"
      >
        <Image
          src="/images/hero.png"
          alt="Rose quartz and amethyst crystals 粉晶與紫水晶"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 45vw"
        />
      </motion.div>
    </section>
  )
}
