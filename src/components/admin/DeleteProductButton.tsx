'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleDelete() {
    if (!confirm(`確定要刪除「${name}」？呢個動作冇得復原。`)) return
    setBusy(true)
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      alert(data.error ?? '刪除失敗')
      setBusy(false)
      return
    }
    if (data.hidden) {
      alert('呢件水晶已經出現喺訂單裡面，所以改成「收起」而唔係刪除，訂單記錄先唔會斷。')
    }
    router.replace('/admin/products')
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="text-sm text-ink/45 transition-colors hover:text-red-600 disabled:opacity-50"
    >
      {busy ? '處理緊…' : '刪除'}
    </button>
  )
}
