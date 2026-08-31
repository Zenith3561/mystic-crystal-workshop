'use client'
import Image from 'next/image'
import { useState } from 'react'

export default function ProductGallery({
  images,
  alt,
  sold,
}: {
  images: string[]
  alt: string
  sold: boolean
}) {
  const [active, setActive] = useState(0)
  const main = images[active] ?? images[0]

  return (
    <div>
      <div className="relative aspect-square rounded-xl overflow-hidden bg-white shadow-sm">
        <Image
          src={main}
          alt={alt}
          fill
          priority
          className={`object-cover ${sold ? 'opacity-60' : ''}`}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {sold && (
          <span className="absolute top-4 left-4 rounded-full bg-ink/80 px-4 py-1.5 text-xs tracking-wider text-cream">
            SOLD 已售出
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-3">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              aria-label={`檢視第 ${i + 1} 張相片`}
              className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 transition-colors ${
                i === active ? 'border-gold' : 'border-transparent hover:border-gold/40'
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
