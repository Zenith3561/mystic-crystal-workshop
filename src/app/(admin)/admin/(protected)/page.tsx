import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice } from '@/lib/format'

export const dynamic = 'force-dynamic'

async function getStats() {
  const supabase = createAdminClient()

  const [active, sold, pendingPayment, toShip, orders] = await Promise.all([
    supabase
      .from('crystal_products')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('crystal_products')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'sold_out'),
    supabase
      .from('crystal_orders')
      .select('id', { count: 'exact', head: true })
      .eq('payment_status', 'pending'),
    supabase
      .from('crystal_orders')
      .select('id', { count: 'exact', head: true })
      .eq('payment_status', 'paid')
      .in('fulfillment_status', ['pending', 'processing']),
    supabase
      .from('crystal_orders')
      .select('id, order_number, customer_name, total_hkd, payment_status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return {
    active: active.count ?? 0,
    sold: sold.count ?? 0,
    pendingPayment: pendingPayment.count ?? 0,
    toShip: toShip.count ?? 0,
    recent: orders.data ?? [],
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const tiles = [
    { label: '可以賣', value: stats.active, href: '/admin/products' },
    { label: '已售出', value: stats.sold, href: '/admin/products' },
    { label: '等收錢', value: stats.pendingPayment, href: '/admin/orders' },
    { label: '等出貨', value: stats.toShip, href: '/admin/orders' },
  ]

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-8">概覽</h1>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="rounded-xl border border-gold/20 bg-white/60 p-5 transition-colors hover:border-gold/50"
          >
            <p className="text-sm text-ink/50">{t.label}</p>
            <p className="mt-1 font-display text-3xl text-ink">{t.value}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-gold/20 bg-white/60 p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <p className="font-display text-xl text-ink">最近訂單</p>
          <Link href="/admin/orders" className="text-sm text-gold hover:text-bronze">
            全部 →
          </Link>
        </div>

        {stats.recent.length === 0 ? (
          <p className="py-8 text-center text-base text-ink/45">仲未有訂單。</p>
        ) : (
          <ul className="divide-y divide-gold/15">
            {stats.recent.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between gap-4 py-3 transition-colors hover:text-gold"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-base text-ink">{o.customer_name}</span>
                    <span className="block text-sm text-ink/45">{o.order_number}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-base text-ink">{formatPrice(o.total_hkd)}</span>
                    <span
                      className={`block text-sm ${
                        o.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'
                      }`}
                    >
                      {o.payment_status === 'paid' ? '已收錢' : '未收錢'}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
