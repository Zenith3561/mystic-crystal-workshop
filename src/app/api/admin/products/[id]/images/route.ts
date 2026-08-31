import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  const { id } = await params
  const { data, error } = await createAdminClient()
    .from('crystal_product_images')
    .select('*')
    .eq('product_id', id)
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: '讀取相片失敗' }, { status: 500 })
  }
  return NextResponse.json({ images: data ?? [] })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  const { id } = await params
  let url = ''
  try {
    url = String((await request.json()).url ?? '').trim()
  } catch {
    return NextResponse.json({ error: '無效的請求' }, { status: 400 })
  }
  if (!url) {
    return NextResponse.json({ error: '請提供相片' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { count } = await supabase
    .from('crystal_product_images')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', id)

  const existing = count ?? 0
  const { data, error } = await supabase
    .from('crystal_product_images')
    .insert({
      product_id: id,
      url,
      // the first photo uploaded becomes the one shown in listings
      is_primary: existing === 0,
      sort_order: existing,
    })
    .select('*')
    .single()

  if (error) {
    console.error('add image:', error.message)
    return NextResponse.json({ error: '加相失敗' }, { status: 500 })
  }
  return NextResponse.json({ image: data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  const { id } = await params
  const imageId = request.nextUrl.searchParams.get('imageId')
  if (!imageId) {
    return NextResponse.json({ error: '缺少相片編號' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: removed } = await supabase
    .from('crystal_product_images')
    .select('is_primary')
    .eq('id', imageId)
    .maybeSingle()

  const { error } = await supabase.from('crystal_product_images').delete().eq('id', imageId)
  if (error) {
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 })
  }

  // Deleting the cover photo would leave the product with none, so the
  // next remaining photo is promoted.
  if (removed?.is_primary) {
    const { data: next } = await supabase
      .from('crystal_product_images')
      .select('id')
      .eq('product_id', id)
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (next) {
      await supabase
        .from('crystal_product_images')
        .update({ is_primary: true })
        .eq('id', next.id)
    }
  }

  return NextResponse.json({ ok: true })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  const { id } = await params
  let imageId = ''
  try {
    imageId = String((await request.json()).imageId ?? '')
  } catch {
    return NextResponse.json({ error: '無效的請求' }, { status: 400 })
  }
  if (!imageId) {
    return NextResponse.json({ error: '缺少相片編號' }, { status: 400 })
  }

  const supabase = createAdminClient()
  await supabase
    .from('crystal_product_images')
    .update({ is_primary: false })
    .eq('product_id', id)
  const { error } = await supabase
    .from('crystal_product_images')
    .update({ is_primary: true })
    .eq('id', imageId)

  if (error) {
    return NextResponse.json({ error: '設定封面失敗' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
