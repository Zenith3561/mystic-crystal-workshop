import type { Metadata } from 'next'
import FadeIn from '@/components/FadeIn'
import ContactForm from '@/components/ContactForm'
import { getSettings } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'contact 聯絡我們 | Mystic Crystal Workshop 神秘水晶工坊',
  description: '聯絡 Mystic Crystal Workshop — WhatsApp 即時查詢或留言給我們。',
}

export default async function ContactPage() {
  const settings = await getSettings()
  const whatsapp = settings.whatsapp_number
  const email = settings.contact_email

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <FadeIn>
        <h1 className="font-display text-5xl text-ink mb-2">
          Contact <span className="text-gold">聯絡我們</span>
        </h1>
        <p className="text-base text-ink/60 mb-12">
          Questions about a crystal? We reply fast. 想查詢任何一件水晶，歡迎隨時聯絡。
        </p>
      </FadeIn>

      <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
        <FadeIn delay={0.1}>
          <div className="space-y-6">
            <div>
              <p className="text-sm tracking-[0.3em] uppercase text-gold mb-2">WhatsApp</p>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-xl bg-gold px-6 py-3 text-base text-white hover:bg-bronze transition-colors"
              >
                WhatsApp 即時查詢
              </a>
            </div>
            <div>
              <p className="text-sm tracking-[0.3em] uppercase text-gold mb-2">Email</p>
              <a href={`mailto:${email}`} className="text-base text-ink/75 hover:text-gold transition-colors">
                {email}
              </a>
            </div>
            <div>
              <p className="text-sm tracking-[0.3em] uppercase text-gold mb-2">Hours 營業時間</p>
              <p className="text-base text-ink/75">Mon–Sun 10:00–20:00（網上商店全日營業）</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <ContactForm whatsapp={whatsapp} />
        </FadeIn>
      </div>
    </div>
  )
}
