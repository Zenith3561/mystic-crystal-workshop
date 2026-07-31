import type { Metadata } from 'next'
import Image from 'next/image'
import FadeIn from '@/components/FadeIn'
import { brand, philosophy } from '@/lib/data'

export const metadata: Metadata = {
  title: 'about 關於我們 | Mystic Crystal Workshop 神秘水晶工坊',
  description: 'Mystic Crystal Workshop 品牌故事 — 不談儀式與傳說，只呈現大自然最純粹的美。',
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <FadeIn>
        <p className="text-xs tracking-[0.35em] uppercase text-gold mb-4 text-center">our story 品牌故事</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink text-center mb-10">
          {brand.taglineEn}
          <span className="block text-2xl text-bronze mt-3">{brand.taglineZh}</span>
        </h1>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-lg shadow-gold/15 mb-12">
          <Image src="/images/hero.png" alt="Our crystals 我們的水晶" fill className="object-cover" sizes="(max-width: 896px) 100vw, 896px" />
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="space-y-5 text-ink/75 leading-relaxed text-[15px] mb-16">
          <p>
            Mystic Crystal Workshop began with a simple belief: crystals do not need myths to be
            magical. Each specimen is millions of years of geology, light and colour — nature&apos;s
            own art, complete in itself.
          </p>
          <p>
            神秘水晶工坊源於一個簡單的信念：水晶不需要傳說加持，本身已經足夠動人。每一件標本都是億萬年地質、
            光線與色彩的結晶——大自然親手完成的藝術品。
          </p>
          <p>
            We hand-select every piece for clarity, colour and character, and deliver across Hong
            Kong with care. 我們親手挑選每一件水晶，並以最細心的包裝送到你手上。
          </p>
        </div>
      </FadeIn>

      <div className="grid gap-8 md:grid-cols-3">
        {philosophy.map((item, i) => (
          <FadeIn key={item.titleEn} delay={i * 0.1}>
            <div className="text-center px-2">
              <h3 className="font-display text-xl text-bronze mb-1">{item.titleEn}</h3>
              <p className="text-xs tracking-[0.3em] text-gold mb-3">{item.titleZh}</p>
              <p className="text-sm text-ink/65 leading-relaxed">{item.bodyZh}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  )
}
