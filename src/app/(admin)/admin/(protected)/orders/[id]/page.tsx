import Link from 'next/link'
import { notFound } from 'next/navigation'
import OrderDetail from '@/components/admin/OrderDetail'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Order, OrderItem } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data } = await createAdminClient()
    .from('crystal_orders')
    .select('*, crystal_order_items(*)')
    .eq('id', id)
    .maybeSingle()

  if (!data) notFound()

  const order = data as Order & { crystal_order_items: OrderItem[] }

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-gold hover:text-bronze">
        ← 返回訂單清單
      </Link>
      <OrderDetail order={order} items={order.crystal_order_items ?? []} />
    </div>
  )
}
