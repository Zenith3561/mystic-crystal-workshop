import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/auth'

export async function PUT(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '無效的請求' }, { status: 400 })
  }

  const rows = Object.entries(body).map(([key, value]) => ({
    key,
    value: String(value ?? ''),
    updated_at: new Date().toISOString(),
  }))

  if (rows.length === 0) {
    return NextResponse.json({ error: '冇嘢要儲存' }, { status: 400 })
  }

  const { error } = await createAdminClient()
    .from('crystal_settings')
    .upsert(rows, { onConflict: 'key' })

  if (error) {
    console.error('save settings:', error.message)
    return NextResponse.json({ error: '儲存失敗' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
