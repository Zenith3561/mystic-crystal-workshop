import type { Metadata } from 'next'
import Link from 'next/link'
import Stripe from 'stripe'
import FadeIn from '@/components/FadeIn'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice } from '@/lib/format'
import { getSettings } from '@/lib/queries'
import type { Order, OrderItem } from '@/types'

export const metadata: Metadata = {
  title: '訂單已收到 | Mystic Crystal Workshop 神秘水晶工坊',
  robots: { index: false },
}

export const revalidate = 0

/**
 * Stripe sends the shopper back here with the session id. There is no
 * webhook configured, so this page is where a card payment gets confirmed:
 * we ask Stripe whether the session was actually paid before touching the
 * order. If the shopper closes the tab instead of coming back, the order
 * simply stays pending and the shop owner settles it from the admin.
 */
async function confirmStripePayment(orderId: string, sessionId: string) {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return
  try {
    const stripe = new Stripe(key)
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') return

    const supabase = createAdminClient()
    await supabase
      .from('crystal_orders')
      .update({
        payment_status: 'paid',
        stripe_payment_intent_id:
          typeof session.payment_intent === 'string' ? session.payment_intent : sessionId,
      })
      .eq('id', orderId)
      .eq('payment_status', 'pending')

    const { data: items } = await supabase
      .from('crystal_order_items')
      .select('product_id')
      .eq('order_id', orderId)

    const ids = (items ?? []).map((i) => i.product_id).filter((id): id is string => Boolean(id))
    if (ids.length > 0) {
      await supabase.from('crystal_products').update({ status: 'sold_out' }).in('id', ids)
    }
  } catch (err) {
    console.error('confirmStripePayment:', err)
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; session_id?: string }>
}) {
  const { order: orderNumber, session_id: sessionId } = await searchParams

  if (!orderNumber) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p className="text-base text-ink/60">搵唔到訂單編號。</p>
        <Link href="/shop" className="mt-6 inline-block text-base text-gold hover:text-bronze">
          返去選購 →
        </Link>
      </div>
    )
  }

  const supabase = createAdminClient()
  const { data: found } = await supabase
    .from('crystal_orders')
    .select('*, crystal_order_items(*)')
    .eq('order_number', orderNumber)
    .maybeSingle()

  if (!found) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p className="text-base text-ink/60">搵唔到呢張訂單。</p>
        <Link href="/shop" className="mt-6 inline-block text-base text-gold hover:text-bronze">
          返去選購 →
        </Link>
      </div>
    )
  }

  if (sessionId && found.payment_status === 'pending') {
    await confirmStripePayment(found.id, sessionId)
  }

  const { data: fresh } = await supabase
    .from('crystal_orders')
    .select('*, crystal_order_items(*)')
    .eq('order_number', orderNumber)
    .maybeSingle()

  const order = (fresh ?? found) as Order & { crystal_order_items: OrderItem[] }
  const items = order.crystal_order_items ?? []
  const settings = await getSettings()
  const whatsapp = settings.whatsapp_number

  const paid = order.payment_status === 'paid'

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <FadeIn>
        <p className="text-sm tracking-[0.35em] uppercase text-gold mb-4">
          {paid ? 'Payment received 已收到付款' : 'Order received 已收到訂單'}
        </p>
        <h1 className="font-display text-4xl text-ink mb-3">
          多謝你，{order.customer_name}
        </h1>
        <p className="text-base text-ink/60 mb-2">
          訂單編號 <span className="text-ink">{order.order_number}</span>
        </p>
        <p className="text-base text-ink/60 mb-10">
          確認信會寄去 {order.customer_email}。你揀嘅水晶已經為你保留。
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="rounded-xl border border-gold/20 bg-white/60 p-6 mb-8">
          <ul className="divide-y divide-gold/15">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-base text-ink">{i.name_en}</span>
                  <span className="block truncate text-sm text-ink/55">{i.name_zh}</span>
                </span>
                <span className="text-base text-gold">{formatPrice(i.unit_price_hkd)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1.5 border-t border-gold/20 pt-4 text-base">
            <div className="flex justify-between text-ink/60">
              <span>Subtotal 小計</span>
              <span>{formatPrice(order.subtotal_hkd)}</span>
            </div>
            <div className="flex justify-between text-ink/60">
              <span>Shipping 運費</span>
              <span>
                {Number(order.shipping_hkd) === 0 ? '免費 Free' : formatPrice(order.shipping_hkd)}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-xl text-ink">
              <span>Total 總額</span>
              <span className="text-gold">{formatPrice(order.total_hkd)}</span>
            </div>
          </div>
        </div>
      </FadeIn>

      {!paid && order.payment_method !== 'stripe' && (
        <FadeIn delay={0.15}>
          <div className="rounded-xl border border-gold/40 bg-gold/5 p-6">
            <p className="font-display text-2xl text-ink mb-4">
              下一步：付款 <span className="text-gold">Next: payment</span>
            </p>

            {order.payment_method === 'fps' && (
              <div className="space-y-2 text-base text-ink/75">
                <p>
                  請用轉數快轉 <span className="text-gold">{formatPrice(order.total_hkd)}</span> 到：
                </p>
                <p className="text-lg text-ink">
                  FPS ID：{settings.fps_id || '（店主仲未填，請 WhatsApp 我哋查詢）'}
                </p>
                {settings.bank_note_zh && <p className="text-sm text-ink/60">{settings.bank_note_zh}</p>}
              </div>
            )}

            {order.payment_method === 'payme' && (
              <div className="space-y-2 text-base text-ink/75">
                <p>
                  請用 PayMe 付 <span className="text-gold">{formatPrice(order.total_hkd)}</span>：
                </p>
                {settings.payme_link ? (
                  <a
                    href={settings.payme_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-xl bg-gold px-6 py-3 text-base text-white transition-colors hover:bg-bronze"
                  >
                    開啟 PayMe 付款連結
                  </a>
                ) : (
                  <p>（店主仲未設定 PayMe 連結，請 WhatsApp 我哋查詢）</p>
                )}
              </div>
            )}

            <p className="mt-5 text-base text-ink/70">
              付完款請將截圖同訂單編號 <span className="text-ink">{order.order_number}</span>{' '}
              WhatsApp 畀我哋，我哋確認後就會安排寄出。
            </p>

            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                  `你好，我已經付咗款，訂單編號 ${order.order_number}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-xl border border-gold/60 px-6 py-3 text-base text-gold transition-colors hover:bg-gold hover:text-white"
              >
                WhatsApp send 付款截圖
              </a>
            )}
          </div>
        </FadeIn>
      )}

      <FadeIn delay={0.2}>
        <Link
          href="/shop"
          className="mt-10 inline-block text-base text-gold transition-colors hover:text-bronze"
        >
          繼續選購 Continue shopping →
        </Link>
      </FadeIn>
    </div>
  )
}
