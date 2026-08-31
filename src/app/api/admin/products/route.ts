import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/auth'

/** Turns a product name into a URL-safe slug, keeping CJK characters. */
function slugify(input: string) {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || `piece-${Date.now()}`
  )
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '無效的請求' }, { status: 400 })
  }

  const nameEn = String(body.name_en ?? '').trim()
  const nameZh = String(body.name_zh ?? '').trim()
  const price = Number(body.price_hkd)

  if (!nameEn || !nameZh) {
    return NextResponse.json({ error: '中文名同英文名都要填' }, { status: 400 })
  }
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: '價錢唔啱' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const base = String(body.slug ?? '').trim() || slugify(nameEn)

  // Slugs must be unique, so a repeated name gets a numeric suffix rather
  // than failing in the shop owner's face.
  let slug = base
  for (let n = 2; n < 50; n++) {
    const { data } = await supabase
      .from('crystal_products')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (!data) break
    slug = `${base}-${n}`
  }

  const { data, error } = await supabase
    .from('crystal_products')
    .insert({
      slug,
      name_en: nameEn,
      name_zh: nameZh,
      desc_en: String(body.desc_en ?? ''),
      desc_zh: String(body.desc_zh ?? ''),
      collection_slug: body.collection_slug ? String(body.collection_slug) : null,
      price_hkd: price,
      compare_price_hkd:
        body.compare_price_hkd === null || body.compare_price_hkd === ''
          ? null
          : Number(body.compare_price_hkd),
      weight_g: body.weight_g === null || body.weight_g === '' ? null : Number(body.weight_g),
      size_cm: body.size_cm ? String(body.size_cm) : null,
      origin_en: String(body.origin_en ?? ''),
      origin_zh: String(body.origin_zh ?? ''),
      status: String(body.status ?? 'active'),
      is_new: Boolean(body.is_new),
      featured: Boolean(body.featured),
      sort_order: Number(body.sort_order ?? 0) || 0,
    })
    .select('id, slug')
    .single()

  if (error || !data) {
    console.error('create product:', error?.message)
    return NextResponse.json({ error: '新增失敗' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id, slug: data.slug })
}
