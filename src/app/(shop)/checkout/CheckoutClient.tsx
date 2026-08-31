'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import FadeIn from '@/components/FadeIn'
import { cartSubtotal, useCart } from '@/store/cart'
import { formatPrice, shippingFor } from '@/lib/format'
import type { PaymentMethod, ShopSettings } from '@/types'

const field =
  'w-full rounded-xl border border-gold/30 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-gold'
const labelClass = 'block text-sm tracking-[0.3em] uppercase text-gold mb-2'

export default function CheckoutClient({
  settings,
  stripeEnabled,
}: {
  settings: ShopSettings
  stripeEnabled: boolean
}) {
  const router = useRouter()
  const { lines, remove, clear } = useCart()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [delivery, setDelivery] = useState<'post' | 'pickup'>('post')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [method, setMethod] = useState<PaymentMethod>(stripeEnabled ? 'stripe' : 'fps')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const subtotal = cartSubtotal(lines)
  const shipping = delivery === 'pickup' ? 0 : shippingFor(subtotal, settings)
  const total = subtotal + shipping

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          delivery_method: delivery,
          shipping_address: address,
          customer_note: note,
          payment_method: method,
          product_ids: lines.map((l) => l.id),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        // A piece someone else bought first is dropped from the bag so the
        // shopper can finish with what is left instead of starting over.
        if (Array.isArray(data.unavailable_ids)) {
          for (const id of data.unavailable_ids) remove(id)
        }
        setError(data.error ?? '結帳失敗，請再試一次')
        setSubmitting(false)
        return
      }

      clear()
      if (data.url) {
        window.location.href = data.url
      } else {
        router.push(`/checkout/success?order=${data.order_number}`)
      }
    } catch {
      setError('連線失敗，請檢查網絡再試')
      setSubmitting(false)
    }
  }

  if (!mounted) {
    return <div className="mx-auto max-w-6xl px-5 py-24" />
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-24 text-center">
        <h1 className="font-display text-4xl text-ink mb-3">
          Checkout <span className="text-gold">結帳</span>
        </h1>
        <p className="text-base text-ink/55 mb-8">
          Your bag is empty. 購物袋仲係空嘅。
        </p>
        <Link
          href="/shop"
          className="rounded-xl bg-gold px-7 py-3 text-base text-white transition-colors hover:bg-bronze"
        >
          去揀水晶
        </Link>
      </div>
    )
  }

  const methods: Array<{ value: PaymentMethod; label: string; hint: string; show: boolean }> = [
    {
      value: 'stripe',
      label: 'Credit card 信用卡',
      hint: '按「確認落單」後會跳去 Stripe 安全付款頁。',
      show: stripeEnabled,
    },
    {
      value: 'fps',
      label: 'FPS 轉數快',
      hint: '落單後會顯示轉帳資料，轉完 WhatsApp 畀我哋張截圖。',
      show: true,
    },
    {
      value: 'payme',
      label: 'PayMe',
      hint: '落單後會顯示 PayMe 連結，付款後 WhatsApp 畀我哋張截圖。',
      show: true,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <FadeIn>
        <h1 className="font-display text-5xl text-ink mb-2">
          Checkout <span className="text-gold">結帳</span>
        </h1>
        <p className="text-base text-ink/60 mb-10">
          每件水晶都獨一無二，落單後我哋會即刻為你保留。
        </p>
      </FadeIn>

      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <FadeIn>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Name 姓名
                </label>
                <input
                  id="name"
                  className={field}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone 電話
                </label>
                <input
                  id="phone"
                  className={field}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email 電郵
              </label>
              <input
                id="email"
                type="email"
                className={field}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <fieldset>
              <legend className={labelClass}>Delivery 收貨方式</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ['post', '香港郵政寄送', '全港派送，會提供追蹤編號'],
                    ['pickup', '親自面交', '約時間面交，免運費'],
                  ] as const
                ).map(([value, label, hint]) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-xl border px-4 py-3 transition-colors ${
                      delivery === value
                        ? 'border-gold bg-gold/10'
                        : 'border-gold/25 hover:border-gold/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={value}
                      checked={delivery === value}
                      onChange={() => setDelivery(value)}
                      className="sr-only"
                    />
                    <span className="block text-base text-ink">{label}</span>
                    <span className="block text-sm text-ink/50">{hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {delivery === 'post' && (
              <div>
                <label htmlFor="address" className={labelClass}>
                  Address 收件地址
                </label>
                <textarea
                  id="address"
                  rows={3}
                  className={`${field} resize-none`}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="請填寫完整香港地址"
                />
              </div>
            )}

            <div>
              <label htmlFor="note" className={labelClass}>
                Note 備註（可留空）
              </label>
              <textarea
                id="note"
                rows={2}
                className={`${field} resize-none`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <fieldset>
              <legend className={labelClass}>Payment 付款方式</legend>
              <div className="space-y-3">
                {methods
                  .filter((m) => m.show)
                  .map((m) => (
                    <label
                      key={m.value}
                      className={`block cursor-pointer rounded-xl border px-4 py-3 transition-colors ${
                        method === m.value
                          ? 'border-gold bg-gold/10'
                          : 'border-gold/25 hover:border-gold/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.value}
                        checked={method === m.value}
                        onChange={() => setMethod(m.value)}
                        className="sr-only"
                      />
                      <span className="block text-base text-ink">{m.label}</span>
                      <span className="block text-sm text-ink/50">{m.hint}</span>
                    </label>
                  ))}
              </div>
              {!stripeEnabled && (
                <p className="mt-3 text-sm text-ink/45">
                  信用卡付款仲未開通，暫時用 FPS 或 PayMe。
                </p>
              )}
            </fieldset>

            {error && (
              <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-base text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gold px-7 py-4 text-base text-white transition-colors hover:bg-bronze disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? '處理緊…' : `確認落單 · ${formatPrice(total)}`}
            </button>
          </form>
        </FadeIn>

        <FadeIn delay={0.1}>
          <aside className="rounded-xl border border-gold/20 bg-white/60 p-6">
            <p className="font-display text-2xl text-ink mb-5">
              Your Bag <span className="text-gold">購物袋</span>
            </p>
            <ul className="divide-y divide-gold/15">
              {lines.map((l) => (
                <li key={l.id} className="flex gap-4 py-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
                    <Image src={l.image} alt="" fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base text-ink">{l.name_en}</p>
                    <p className="truncate text-sm text-ink/55">{l.name_zh}</p>
                  </div>
                  <p className="text-base text-gold">{formatPrice(l.price_hkd)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2 border-t border-gold/20 pt-5 text-base">
              <div className="flex justify-between text-ink/60">
                <span>Subtotal 小計</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink/60">
                <span>Shipping 運費</span>
                <span>{shipping === 0 ? '免費 Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between pt-2 text-xl text-ink">
                <span>Total 總額</span>
                <span className="text-gold">{formatPrice(total)}</span>
              </div>
            </div>
          </aside>
        </FadeIn>
      </div>
    </div>
  )
}
