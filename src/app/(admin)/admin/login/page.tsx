'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { brand } from '@/lib/data'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? '登入失敗')
        setBusy(false)
        return
      }
      router.replace('/admin')
      router.refresh()
    } catch {
      setError('連線失敗，請再試一次')
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <p className="font-display text-2xl text-ink">{brand.nameEn}</p>
        <p className="mb-8 text-xs tracking-[0.3em] text-gold">管理後台</p>

        <label htmlFor="password" className="mb-2 block text-sm tracking-[0.3em] uppercase text-gold">
          Password 密碼
        </label>
        <input
          id="password"
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-gold/30 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-gold"
        />

        {error && <p className="mt-3 text-base text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-xl bg-gold px-7 py-3 text-base text-white transition-colors hover:bg-bronze disabled:opacity-60"
        >
          {busy ? '登入緊…' : '登入'}
        </button>
      </form>
    </div>
  )
}
