import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/auth'

const BUCKET = 'crystal-images'
const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

/**
 * Takes a photo straight off the shop owner's phone or laptop and puts it
 * in Supabase storage, returning the public URL to attach to a product.
 */
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  let file: File | null = null
  try {
    const form = await request.formData()
    const value = form.get('file')
    if (value instanceof File) file = value
  } catch {
    return NextResponse.json({ error: '無效的請求' }, { status: 400 })
  }

  if (!file) {
    return NextResponse.json({ error: '冇揀到相片' }, { status: 400 })
  }
  const ext = ALLOWED[file.type]
  if (!ext) {
    return NextResponse.json({ error: '只接受 JPG、PNG、WebP 或 AVIF' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: '相片超過 10MB，請壓細啲' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false })

  if (error) {
    console.error('upload:', error.message)
    return NextResponse.json({ error: '上載失敗' }, { status: 500 })
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
