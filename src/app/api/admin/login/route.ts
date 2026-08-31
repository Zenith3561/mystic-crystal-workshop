import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { timingSafeEqual } from 'node:crypto'
import { ADMIN_COOKIE } from '@/lib/auth'

function matches(given: string, expected: string) {
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return NextResponse.json({ error: '未設定管理密碼' }, { status: 500 })
  }

  let password = ''
  try {
    password = String((await request.json()).password ?? '')
  } catch {
    return NextResponse.json({ error: '無效的請求' }, { status: 400 })
  }

  if (!matches(password, expected)) {
    return NextResponse.json({ error: '密碼錯誤' }, { status: 401 })
  }

  const store = await cookies()
  store.set(ADMIN_COOKIE, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const store = await cookies()
  store.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return NextResponse.json({ ok: true })
}
