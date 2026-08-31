import Link from 'next/link'
import { brand } from '@/lib/data'
import { getCollections, getSettings } from '@/lib/queries'

export default async function Footer() {
  const [collections, settings] = await Promise.all([
    getCollections(),
    getSettings(),
  ])
  const whatsapp = settings.whatsapp_number
  const email = settings.contact_email

  return (
    <footer className="border-t border-gold/20 bg-cream mt-24">
      <div className="mx-auto max-w-6xl px-5 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <p className="font-display text-lg text-ink mb-1">{brand.nameEn}</p>
          <p className="text-xs tracking-[0.3em] text-gold mb-4">{brand.nameZh}</p>
          <p className="text-base text-ink/60 leading-relaxed">
            Nature&apos;s art, pure and simple.<br />自然之美，渾然天成。
          </p>
        </div>

        <div>
          <p className="text-base font-medium text-gold mb-4">Collections 系列</p>
          <ul className="space-y-2">
            {collections.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/shop?collection=${c.slug}`}
                  className="text-base text-ink/70 hover:text-gold transition-colors"
                >
                  {c.name_en} {c.name_zh}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-base font-medium text-gold mb-4">Contact 聯絡</p>
          <ul className="space-y-2 text-base text-ink/70">
            {whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  WhatsApp 查詢
                </a>
              </li>
            )}
            {email && (
              <li>
                <a href={`mailto:${email}`} className="hover:text-gold transition-colors">
                  {email}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-gold/10 py-5 text-center text-sm text-ink/40">
        © {new Date().getFullYear()} {brand.nameEn} {brand.nameZh}
      </div>
    </footer>
  )
}
