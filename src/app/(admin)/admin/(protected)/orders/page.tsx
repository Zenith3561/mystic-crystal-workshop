import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice } from '@/lib/format'
import type { Order } from '@/types'

export const dynamic = 'force-dynamic'

const PAYMENT_LABEL: Record<string, { text: string; className: string }> = {
  pending: { text: '未收錢', className: 'text-amber-700 bg-amber-50' },
  paid: { text: '已收錢', className: 'text-green-700 bg-green-50' },
  failed: { text: '付款失敗', className: 'text-red-700 bg-red-50' },
  refunded: { text: '已退款', className: 'text-ink/60 bg-ink/5' },
}

const FULFILLMENT_LABEL: Record<string, string> = {
  pending: '待處理',
  processing: '執緊貨',
  shipped: '已寄出',
  delivered: '已送達',
  cancelled: '已取消',
}

const METHOD_LABEL: Record<string, string> = {
  stripe: '信用卡',
  fps: 'FPS',
  payme: 'PayMe',
}

export default async function AdminOrdersPage() {
  const { data } = await createAdminClient()
    .from('crystal_orders')
    .select('*')
    .order('created_at', { ascending: false })

  const orders = (data ?? []) as Order[]

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-2">訂單</h1>
      <p className="mb-8 text-base text-ink/50">合共 {orders.length} 張</p>

      {orders.length === 0 ? (
        <p className="rounded-xl border border-gold/20 bg-white/60 py-16 text-center text-base text-ink/45">
          仲未有訂單。
        </p>
      ) : (
        <ul className="space-y-2">
          {orders.map((o) => {
            const payment = PAYMENT_LABEL[o.payment_status] ?? PAYMENT_LABEL.pending
            return (
              <li key={o.id}>
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-gold/20 bg-white/60 p-4 transition-colors hover:border-gold/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-base text-ink">{o.customer_name}</p>
                    <p className="text-sm text-ink/45">
                      {o.order_number} ·{' '}
                      {new Date(o.created_at).toLocaleString('zh-HK', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                  <span className="text-sm text-ink/55">
                    {METHOD_LABEL[o.payment_method] ?? o.payment_method}
                  </span>
                  <span className="text-sm text-ink/55">
                    {FULFILLMENT_LABEL[o.fulfillment_status] ?? o.fulfillment_status}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-sm ${payment.className}`}>
                    {payment.text}
                  </span>
                  <span className="w-24 text-right text-base text-gold">
                    {formatPrice(o.total_hkd)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
