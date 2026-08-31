import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/auth'

const TEXT_FIELDS = [
  'name_en',
  'name_zh',
  'desc_en',
  'desc_zh',
  'origin_en',
  'origin_zh',
  'size_cm',
  'status',
  'slug',
] as const
const NUMBER_FIELDS = ['price_hkd', 'compare_price_hkd', 'weight_g', 'sort_order'] as const
const BOOL_FIELDS = ['is_new', 'featured'] as const

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
  for (const key of TEXT_FIELDS) {
    if (key in body) patch[key] = body[key] === null ? null : String(body[key])
  }
  for (const key of NUMBER_FIELDS) {
    if (key in body) {
      const raw = body[key]
      patch[key] = raw === null || raw === '' ? null : Number(raw)
    }
  }
  for (const key of BOOL_FIELDS) {
    if (key in body) patch[key] = Boolean(body[key])
  }
  if ('collection_slug' in body) {
    patch.collection_slug = body.collection_slug ? String(body.collection_slug) : null
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: '冇嘢要更新' }, { status: 400 })
  }
  if (patch.price_hkd !== undefined && !Number.isFinite(patch.price_hkd as number)) {
    return NextResponse.json({ error: '價錢唔啱' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('crystal_products').update(patch).eq('id', id)

  if (error) {
    console.error('update product:', error.message)
    return NextResponse.json({ error: '更新失敗' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  const { id } = await params
  const supabase = createAdminClient()

  // A piece that already appears on an order is never deleted — that would
  // punch a hole in the order history. It gets hidden from the shop instead.
  const { count } = await supabase
    .from('crystal_order_items')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id)

  if ((count ?? 0) > 0) {
    const { error } = await supabase
      .from('crystal_products')
      .update({ status: 'hidden' })
      .eq('id', id)
    if (error) {
      return NextResponse.json({ error: '隱藏失敗' }, { status: 500 })
    }
    return NextResponse.json({ ok: true, hidden: true })
  }

  const { error } = await supabase.from('crystal_products').delete().eq('id', id)
  if (error) {
    console.error('delete product:', error.message)
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
