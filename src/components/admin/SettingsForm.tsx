'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const field =
  'w-full rounded-xl border border-gold/30 bg-white px-4 py-2.5 text-base outline-none transition-colors focus:border-gold'

const FIELDS: Array<{ key: string; label: string; hint?: string; type?: string }> = [
  {
    key: 'whatsapp_number',
    label: 'WhatsApp 號碼',
    hint: '國際格式，唔要加號同空格。例如 85298765432',
  },
  { key: 'contact_email', label: '聯絡電郵', type: 'email' },
  {
    key: 'free_shipping_over',
    label: '滿幾多免運費（HK$）',
    hint: '填 0 就永遠收運費',
    type: 'number',
  },
  { key: 'shipping_flat_hkd', label: '運費（HK$）', type: 'number' },
  {
    key: 'fps_id',
    label: 'FPS 轉數快識別碼',
    hint: '客人揀 FPS 付款時會見到呢個號碼',
  },
  {
    key: 'payme_link',
    label: 'PayMe 收款連結',
    hint: '由 PayMe app 產生嘅 payme.hsbc 連結',
  },
  {
    key: 'bank_note_zh',
    label: '付款補充說明（中文）',
    hint: '例如「請喺備註寫低訂單編號」',
  },
  { key: 'bank_note_en', label: 'Payment note (English)' },
]

export default function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const f of FIELDS) initial[f.key] = settings[f.key] ?? ''
    return initial
  })
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? '儲存失敗')
      } else {
        setSaved(true)
        router.refresh()
      }
    } catch {
      setError('連線失敗，請再試一次')
    }
    setBusy(false)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label htmlFor={f.key} className="mb-1.5 block text-sm text-ink/60">
            {f.label}
          </label>
          <input
            id={f.key}
            type={f.type ?? 'text'}
            className={field}
            value={values[f.key]}
            onChange={(e) => {
              setValues((v) => ({ ...v, [f.key]: e.target.value }))
              setSaved(false)
            }}
          />
          {f.hint && <p className="mt-1 text-sm text-ink/45">{f.hint}</p>}
        </div>
      ))}

      {error && <p className="text-base text-red-600">{error}</p>}
      {saved && <p className="text-base text-green-700">已儲存。</p>}

      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-gold px-7 py-3 text-base text-white transition-colors hover:bg-bronze disabled:opacity-60"
      >
        {busy ? '儲存緊…' : '儲存設定'}
      </button>
    </form>
  )
}
