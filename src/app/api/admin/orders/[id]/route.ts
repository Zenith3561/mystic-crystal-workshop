import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/auth'
import type { FulfillmentStatus, PaymentStatus } from '@/types'

const PAYMENT: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded']
const FULFILLMENT: FulfillmentStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  const { id } = await params
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '無效的請求' }, { status: 400 })
  }

  const patch: Record<string, unknown> = {}

  if ('payment_status' in body) {
    const value = String(body.payment_status) as PaymentStatus
    if (!PAYMENT.includes(value)) {
      return NextResponse.json({ error: '付款狀態唔啱' }, { status: 400 })
    }
    patch.payment_status = value
  }
  if ('fulfillment_status' in body) {
    const value = String(body.fulfillment_status) as FulfillmentStatus
    if (!FULFILLMENT.includes(value)) {
      return NextResponse.json({ error: '發貨狀態唔啱' }, { status: 400 })
    }
    patch.fulfillment_status = value
  }
  if ('tracking_number' in body) patch.tracking_number = String(body.tracking_number ?? '')
  if ('payment_ref' in body) patch.payment_ref = String(body.payment_ref ?? '')
  if ('payment_proof_url' in body) {
    patch.payment_proof_url = body.payment_proof_url ? String(body.payment_proof_url) : null
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: '冇嘢要更新' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('crystal_orders').update(patch).eq('id', id)
  if (error) {
    console.error('update order:', error.message)
    return NextResponse.json({ error: '更新失敗' }, { status: 500 })
  }

  // The pieces on an order follow the order. Marking it paid sells them for
  // good; cancelling it puts them back on the shelf.
  const { data: items } = await supabase
    .from('crystal_order_items')
    .select('product_id')
    .eq('order_id', id)
  const productIds = (items ?? [])
    .map((i) => i.product_id)
    .filter((pid): pid is string => Boolean(pid))

  if (productIds.length > 0) {
    if (patch.payment_status === 'paid') {
      await supabase.from('crystal_products').update({ status: 'sold_out' }).in('id', productIds)
    } else if (
      patch.fulfillment_status === 'cancelled' ||
      patch.payment_status === 'failed' ||
      patch.payment_status === 'refunded'
    ) {
      await supabase
        .from('crystal_products')
        .update({ status: 'active' })
        .in('id', productIds)
        .neq('status', 'hidden')
    }
  }

  return NextResponse.json({ ok: true })
}
