import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { shippingFor } from '@/lib/format'
import type { PaymentMethod } from '@/types'

interface Body {
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  shipping_address?: string
  delivery_method?: 'post' | 'pickup'
  customer_note?: string
  payment_method?: PaymentMethod
  product_ids?: string[]
}

const METHODS: PaymentMethod[] = ['stripe', 'fps', 'payme']

export async function POST(request: NextRequest) {
  let body: Body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '無效的請求' }, { status: 400 })
  }

  const name = body.customer_name?.trim() ?? ''
  const email = body.customer_email?.trim() ?? ''
  const phone = body.customer_phone?.trim() ?? ''
  const delivery = body.delivery_method === 'pickup' ? 'pickup' : 'post'
  const address = body.shipping_address?.trim() ?? ''
  const note = body.customer_note?.trim() ?? ''
  const method = body.payment_method
  const ids = Array.from(new Set(body.product_ids ?? []))

  if (!name || !email || !phone) {
    return NextResponse.json({ error: '請填寫姓名、電郵同電話' }, { status: 400 })
  }
  if (delivery === 'post' && !address) {
    return NextResponse.json({ error: '郵寄要填收件地址' }, { status: 400 })
  }
  if (!method || !METHODS.includes(method)) {
    return NextResponse.json({ error: '請揀付款方式' }, { status: 400 })
  }
  if (ids.length === 0) {
    return NextResponse.json({ error: '購物袋係空嘅' }, { status: 400 })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (method === 'stripe' && !stripeKey) {
    return NextResponse.json(
      { error: '信用卡付款暫時未開通，請改用 FPS 或 PayMe' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  // Price and availability always come from the database, never from the
  // browser: a cart can sit in localStorage for days, and each piece is
  // one of a kind, so someone else may already have taken it.
  const { data: rows, error: readErr } = await supabase
    .from('crystal_products')
    .select(
      'id, slug, name_en, name_zh, price_hkd, status, crystal_product_images(url, is_primary, sort_order)'
    )
    .in('id', ids)

  if (readErr) {
    console.error('checkout read:', readErr.message)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }

  const found = rows ?? []
  const unavailable = found.filter((r) => r.status !== 'active')
  const missing = ids.filter((id) => !found.some((r) => r.id === id))

  if (unavailable.length > 0 || missing.length > 0) {
    return NextResponse.json(
      {
        error: '購物袋入面有水晶已經售出或者落咗架',
        unavailable_ids: [...unavailable.map((r) => r.id), ...missing],
      },
      { status: 409 }
    )
  }

  const items = found.map((r) => {
    const imgs = [...(r.crystal_product_images ?? [])].sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1
      return a.sort_order - b.sort_order
    })
    return {
      product_id: r.id,
      name_en: r.name_en,
      name_zh: r.name_zh,
      image_url: imgs[0]?.url ?? '',
      unit_price_hkd: Number(r.price_hkd),
      quantity: 1,
      total_hkd: Number(r.price_hkd),
    }
  })

  const { data: settingRows } = await supabase.from('crystal_settings').select('key, value')
  const settings: Record<string, string> = {}
  for (const s of settingRows ?? []) settings[s.key] = s.value

  const subtotal = items.reduce((sum, i) => sum + i.total_hkd, 0)
  const shipping = delivery === 'pickup' ? 0 : shippingFor(subtotal, settings)
  const total = subtotal + shipping
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  const orderNumber = `MCW-${stamp}-${Math.floor(Math.random() * 9000 + 1000)}`

  const { data: order, error: orderErr } = await supabase
    .from('crystal_orders')
    .insert({
      order_number: orderNumber,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      shipping_address: address,
      delivery_method: delivery,
      customer_note: note,
      payment_method: method,
      subtotal_hkd: subtotal,
      shipping_hkd: shipping,
      total_hkd: total,
    })
    .select('id, order_number, total_hkd')
    .single()

  if (orderErr || !order) {
    console.error('checkout order insert:', orderErr?.message)
    return NextResponse.json({ error: '建立訂單失敗' }, { status: 500 })
  }

  const { error: itemsErr } = await supabase
    .from('crystal_order_items')
    .insert(items.map((i) => ({ ...i, order_id: order.id })))

  if (itemsErr) {
    console.error('checkout items insert:', itemsErr.message)
    await supabase.from('crystal_orders').delete().eq('id', order.id)
    return NextResponse.json({ error: '建立訂單失敗' }, { status: 500 })
  }

  // Hold the pieces. The .eq('status','active') filter is the race guard:
  // whoever gets there first flips the row; the loser's update touches
  // nothing, and their order is rolled back below.
  const { data: reserved, error: reserveErr } = await supabase
    .from('crystal_products')
    .update({ status: 'reserved' })
    .in('id', ids)
    .eq('status', 'active')
    .select('id')

  if (reserveErr || (reserved ?? []).length !== ids.length) {
    const wonIds = (reserved ?? []).map((r) => r.id)
    if (wonIds.length > 0) {
      await supabase.from('crystal_products').update({ status: 'active' }).in('id', wonIds)
    }
    await supabase.from('crystal_orders').delete().eq('id', order.id)
    return NextResponse.json(
      { error: '有水晶啱啱畀人買咗，請重新確認購物袋' },
      { status: 409 }
    )
  }

  if (method !== 'stripe') {
    return NextResponse.json({ order_number: order.order_number })
  }

  try {
    const stripe = new Stripe(stripeKey!)
    const site = process.env.SITE_URL ?? ''
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [
        ...items.map((i) => ({
          quantity: 1,
          price_data: {
            currency: 'hkd',
            unit_amount: Math.round(i.unit_price_hkd * 100),
            product_data: { name: `${i.name_en} ${i.name_zh}` },
          },
        })),
        ...(shipping > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: 'hkd',
                  unit_amount: Math.round(shipping * 100),
                  product_data: { name: 'Shipping 運費' },
                },
              },
            ]
          : []),
      ],
      metadata: { order_id: order.id, order_number: order.order_number },
      success_url: `${site}/checkout/success?order=${order.order_number}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/checkout?cancelled=1`,
    })

    await supabase
      .from('crystal_orders')
      .update({ stripe_payment_intent_id: session.id })
      .eq('id', order.id)

    return NextResponse.json({ order_number: order.order_number, url: session.url })
  } catch (err) {
    console.error('stripe session:', err)
    await supabase.from('crystal_products').update({ status: 'active' }).in('id', ids)
    await supabase.from('crystal_orders').delete().eq('id', order.id)
    return NextResponse.json({ error: '無法連接付款系統，請稍後再試' }, { status: 502 })
  }
}
