'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { formatPrice } from '@/lib/format'
import type { FulfillmentStatus, Order, OrderItem, PaymentStatus } from '@/types'

const field =
  'w-full rounded-xl border border-gold/30 bg-white px-4 py-2.5 text-base outline-none transition-colors focus:border-gold'

const PAYMENT: Array<{ value: PaymentStatus; label: string }> = [
  { value: 'pending', label: '未收錢' },
  { value: 'paid', label: '已收錢' },
  { value: 'failed', label: '付款失敗' },
  { value: 'refunded', label: '已退款' },
]

const FULFILLMENT: Array<{ value: FulfillmentStatus; label: string }> = [
  { value: 'pending', label: '待處理' },
  { value: 'processing', label: '執緊貨' },
  { value: 'shipped', label: '已寄出' },
  { value: 'delivered', label: '已送達' },
  { value: 'cancelled', label: '已取消' },
]

const METHOD_LABEL: Record<string, string> = {
  stripe: '信用卡（Stripe）',
  fps: 'FPS 轉數快',
  payme: 'PayMe',
}

export default function OrderDetail({
  order,
  items,
}: {
  order: Order
  items: OrderItem[]
}) {
  const router = useRouter()
  const [payment, setPayment] = useState<PaymentStatus>(order.payment_status)
  const [fulfillment, setFulfillment] = useState<FulfillmentStatus>(order.fulfillment_status)
  const [tracking, setTracking] = useState(order.tracking_number ?? '')
  const [ref, setRef] = useState(order.payment_ref ?? '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function save() {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_status: payment,
          fulfillment_status: fulfillment,
          tracking_number: tracking,
          payment_ref: ref,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? '更新失敗')
      } else {
        setMessage(
          payment === 'paid'
            ? '已更新。呢張單嘅水晶已標記為售出。'
            : '已更新。'
        )
        router.refresh()
      }
    } catch {
      setError('連線失敗，請再試一次')
    }
    setBusy(false)
  }

  const whatsappHref = `https://wa.me/${order.customer_phone.replace(/\D/g, '')}`

  return (
    <div className="mt-3 max-w-4xl">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">{order.order_number}</h1>
          <p className="text-base text-ink/50">
            {new Date(order.created_at).toLocaleString('zh-HK', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </p>
        </div>
        <p className="font-display text-3xl text-gold">{formatPrice(order.total_hkd)}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-gold/20 bg-white/60 p-5">
          <p className="mb-4 font-display text-xl text-ink">客人</p>
          <dl className="space-y-2 text-base">
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">姓名</dt>
              <dd className="text-right text-ink">{order.customer_name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">電話</dt>
              <dd className="text-right">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-bronze"
                >
                  {order.customer_phone}
                </a>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">電郵</dt>
              <dd className="break-all text-right">
                <a href={`mailto:${order.customer_email}`} className="text-gold hover:text-bronze">
                  {order.customer_email}
                </a>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink/50">收貨</dt>
              <dd className="text-right text-ink">
                {order.delivery_method === 'pickup' ? '親自面交' : '香港郵政寄送'}
              </dd>
            </div>
            {order.shipping_address && (
              <div>
                <dt className="text-ink/50">地址</dt>
                <dd className="mt-1 whitespace-pre-wrap text-ink">{order.shipping_address}</dd>
              </div>
            )}
            {order.customer_note && (
              <div>
                <dt className="text-ink/50">備註</dt>
                <dd className="mt-1 whitespace-pre-wrap text-ink">{order.customer_note}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="rounded-xl border border-gold/20 bg-white/60 p-5">
          <p className="mb-4 font-display text-xl text-ink">貨品</p>
          <ul className="divide-y divide-gold/15">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-3">
                {i.image_url && (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
                    <Image src={i.image_url} alt="" fill className="object-cover" sizes="48px" />
                  </div>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base text-ink">{i.name_zh}</span>
                  <span className="block truncate text-sm text-ink/50">{i.name_en}</span>
                </span>
                <span className="text-base text-gold">{formatPrice(i.unit_price_hkd)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 border-t border-gold/20 pt-3 text-base">
            <div className="flex justify-between text-ink/55">
              <span>小計</span>
              <span>{formatPrice(order.subtotal_hkd)}</span>
            </div>
            <div className="flex justify-between text-ink/55">
              <span>運費</span>
              <span>
                {Number(order.shipping_hkd) === 0 ? '免費' : formatPrice(order.shipping_hkd)}
              </span>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-gold/20 bg-white/60 p-5">
        <p className="mb-1 font-display text-xl text-ink">處理呢張單</p>
        <p className="mb-5 text-sm text-ink/50">
          付款方式：{METHOD_LABEL[order.payment_method] ?? order.payment_method}。
          改成「已收錢」會自動將呢張單嘅水晶標記為售出；改成「已取消」或「已退款」會放返上架。
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="payment" className="mb-1.5 block text-sm text-ink/60">
              收錢狀態
            </label>
            <select
              id="payment"
              className={field}
              value={payment}
              onChange={(e) => setPayment(e.target.value as PaymentStatus)}
            >
              {PAYMENT.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fulfillment" className="mb-1.5 block text-sm text-ink/60">
              發貨狀態
            </label>
            <select
              id="fulfillment"
              className={field}
              value={fulfillment}
              onChange={(e) => setFulfillment(e.target.value as FulfillmentStatus)}
            >
              {FULFILLMENT.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ref" className="mb-1.5 block text-sm text-ink/60">
              付款參考（FPS／PayMe 交易編號）
            </label>
            <input
              id="ref"
              className={field}
              value={ref}
              onChange={(e) => setRef(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="tracking" className="mb-1.5 block text-sm text-ink/60">
              郵政追蹤編號
            </label>
            <input
              id="tracking"
              className={field}
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="mt-4 text-base text-red-600">{error}</p>}
        {message && <p className="mt-4 text-base text-green-700">{message}</p>}

        <button
          onClick={save}
          disabled={busy}
          className="mt-5 rounded-xl bg-gold px-7 py-3 text-base text-white transition-colors hover:bg-bronze disabled:opacity-60"
        >
          {busy ? '儲存緊…' : '儲存'}
        </button>
      </section>
    </div>
  )
}
