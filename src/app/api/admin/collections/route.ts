import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/auth'

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

  const slug = String(body.slug ?? '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-')
  const nameEn = String(body.name_en ?? '').trim()
  const nameZh = String(body.name_zh ?? '').trim()

  if (!slug || !nameEn || !nameZh) {
    return NextResponse.json({ error: '網址代號、中文名同英文名都要填' }, { status: 400 })
  }

  const { error } = await createAdminClient()
    .from('crystal_collections')
    .upsert(
      {
        slug,
        name_en: nameEn,
        name_zh: nameZh,
        desc_en: String(body.desc_en ?? ''),
        desc_zh: String(body.desc_zh ?? ''),
        sort_order: Number(body.sort_order ?? 0) || 0,
      },
      { onConflict: 'slug' }
    )

  if (error) {
    console.error('save collection:', error.message)
    return NextResponse.json({ error: '儲存失敗' }, { status: 500 })
  }
  return NextResponse.json({ ok: true, slug })
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  const slug = request.nextUrl.searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ error: '缺少系列代號' }, { status: 400 })
  }

  // Products keep existing; the foreign key sets their collection to null,
  // so nothing disappears from the shop when a series is retired.
  const { error } = await createAdminClient()
    .from('crystal_collections')
    .delete()
    .eq('slug', slug)

  if (error) {
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
