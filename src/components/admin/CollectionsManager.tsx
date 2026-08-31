'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Collection } from '@/types'

const field =
  'w-full rounded-xl border border-gold/30 bg-white px-4 py-2.5 text-base outline-none transition-colors focus:border-gold'

const EMPTY = { slug: '', name_zh: '', name_en: '', desc_zh: '', desc_en: '', sort_order: '0' }

export default function CollectionsManager({
  collections,
  counts,
}: {
  collections: Collection[]
  counts: Record<string, number>
}) {
  const router = useRouter()
  const [form, setForm] = useState(EMPTY)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function startEdit(c: Collection) {
    setEditingSlug(c.slug)
    setForm({
      slug: c.slug,
      name_zh: c.name_zh,
      name_en: c.name_en,
      desc_zh: c.desc_zh,
      desc_en: c.desc_en,
      sort_order: String(c.sort_order),
    })
    setError('')
  }

  function reset() {
    setEditingSlug(null)
    setForm(EMPTY)
    setError('')
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sort_order: Number(form.sort_order) || 0 }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? '儲存失敗')
      } else {
        reset()
        router.refresh()
      }
    } catch {
      setError('連線失敗，請再試一次')
    }
    setBusy(false)
  }

  async function remove(c: Collection) {
    const used = counts[c.slug] ?? 0
    const warning =
      used > 0
        ? `「${c.name_zh}」下面有 ${used} 件水晶。刪除系列唔會刪貨，佢哋只係變成「未分系列」。確定？`
        : `確定刪除系列「${c.name_zh}」？`
    if (!confirm(warning)) return

    setBusy(true)
    const res = await fetch(`/api/admin/collections?slug=${encodeURIComponent(c.slug)}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? '刪除失敗')
    } else {
      if (editingSlug === c.slug) reset()
      router.refresh()
    }
    setBusy(false)
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
      <div>
        <p className="mb-4 font-display text-xl text-ink">現有系列</p>
        {collections.length === 0 ? (
          <p className="rounded-xl border border-gold/20 bg-white/60 py-12 text-center text-base text-ink/45">
            仲未有系列。
          </p>
        ) : (
          <ul className="space-y-2">
            {collections.map((c) => (
              <li
                key={c.slug}
                className="flex items-center gap-4 rounded-xl border border-gold/20 bg-white/60 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base text-ink">{c.name_zh}</p>
                  <p className="truncate text-sm text-ink/50">{c.name_en}</p>
                  <p className="text-sm text-ink/40">
                    {counts[c.slug] ?? 0} 件水晶 · /shop?collection={c.slug}
                  </p>
                </div>
                <button onClick={() => startEdit(c)} className="text-sm text-gold hover:text-bronze">
                  改
                </button>
                <button
                  onClick={() => remove(c)}
                  disabled={busy}
                  className="text-sm text-ink/40 hover:text-red-600 disabled:opacity-50"
                >
                  刪除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={save} className="space-y-4">
        <p className="font-display text-xl text-ink">
          {editingSlug ? `修改「${form.name_zh}」` : '加一個系列'}
        </p>

        <div>
          <label htmlFor="slug" className="mb-1.5 block text-sm text-ink/60">
            網址代號 *
          </label>
          <input
            id="slug"
            className={field}
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            disabled={Boolean(editingSlug)}
            required
            placeholder="poetry-of-light"
          />
          <p className="mt-1 text-sm text-ink/45">只可以用英文細楷、數字同 -，建立後改唔到。</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="c_name_zh" className="mb-1.5 block text-sm text-ink/60">
              中文名 *
            </label>
            <input
              id="c_name_zh"
              className={field}
              value={form.name_zh}
              onChange={(e) => setForm((f) => ({ ...f, name_zh: e.target.value }))}
              required
            />
          </div>
          <div>
            <label htmlFor="c_name_en" className="mb-1.5 block text-sm text-ink/60">
              English name *
            </label>
            <input
              id="c_name_en"
              className={field}
              value={form.name_en}
              onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="c_desc_zh" className="mb-1.5 block text-sm text-ink/60">
            中文簡介
          </label>
          <textarea
            id="c_desc_zh"
            rows={3}
            className={`${field} resize-none`}
            value={form.desc_zh}
            onChange={(e) => setForm((f) => ({ ...f, desc_zh: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="c_desc_en" className="mb-1.5 block text-sm text-ink/60">
            English description
          </label>
          <textarea
            id="c_desc_en"
            rows={3}
            className={`${field} resize-none`}
            value={form.desc_en}
            onChange={(e) => setForm((f) => ({ ...f, desc_en: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="c_sort" className="mb-1.5 block text-sm text-ink/60">
            排序
          </label>
          <input
            id="c_sort"
            type="number"
            className={field}
            value={form.sort_order}
            onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
          />
        </div>

        {error && <p className="text-base text-red-600">{error}</p>}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-gold px-7 py-3 text-base text-white transition-colors hover:bg-bronze disabled:opacity-60"
          >
            {busy ? '儲存緊…' : editingSlug ? '儲存改動' : '新增系列'}
          </button>
          {editingSlug && (
            <button type="button" onClick={reset} className="text-base text-ink/50 hover:text-gold">
              取消
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
