'use client'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

interface ImageRow {
  id: string
  url: string
  is_primary: boolean
  sort_order: number
}

export default function ProductImages({ productId }: { productId: string }) {
  const [images, setImages] = useState<ImageRow[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/products/${productId}/images`)
    if (!res.ok) return
    const data = await res.json()
    setImages(data.images ?? [])
  }, [productId])

  useEffect(() => {
    load()
  }, [load])

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError('')
    setBusy(true)

    for (const file of Array.from(files)) {
      try {
        const form = new FormData()
        form.append('file', file)
        const upload = await fetch('/api/admin/upload', { method: 'POST', body: form })
        const uploaded = await upload.json().catch(() => ({}))
        if (!upload.ok) {
          setError(uploaded.error ?? '上載失敗')
          continue
        }
        const attach = await fetch(`/api/admin/products/${productId}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: uploaded.url }),
        })
        if (!attach.ok) {
          const data = await attach.json().catch(() => ({}))
          setError(data.error ?? '加相失敗')
        }
      } catch {
        setError('上載途中連線失敗')
      }
    }

    if (inputRef.current) inputRef.current.value = ''
    await load()
    setBusy(false)
  }

  async function remove(imageId: string) {
    setBusy(true)
    await fetch(`/api/admin/products/${productId}/images?imageId=${imageId}`, {
      method: 'DELETE',
    })
    await load()
    setBusy(false)
  }

  async function makePrimary(imageId: string) {
    setBusy(true)
    await fetch(`/api/admin/products/${productId}/images`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId }),
    })
    await load()
    setBusy(false)
  }

  return (
    <div>
      <p className="font-display text-xl text-ink mb-1">相片</p>
      <p className="mb-5 text-sm text-ink/50">
        第一張係封面。可以一次揀多張，支援手機影嘅相（JPG / PNG / WebP，每張最多 10MB）。
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        disabled={busy}
        className="mb-5 block text-base text-ink/70 file:mr-4 file:rounded-xl file:border-0 file:bg-gold file:px-5 file:py-2.5 file:text-base file:text-white hover:file:bg-bronze"
      />

      {error && <p className="mb-4 text-base text-red-600">{error}</p>}
      {busy && <p className="mb-4 text-base text-ink/50">處理緊…</p>}

      {images.length === 0 ? (
        <p className="text-base text-ink/45">仲未有相。</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {images.map((img) => (
            <li key={img.id} className="rounded-xl border border-gold/20 bg-white/60 p-2">
              <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-white">
                <Image src={img.url} alt="" fill className="object-cover" sizes="200px" />
                {img.is_primary && (
                  <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[10px] text-white">
                    封面
                  </span>
                )}
              </div>
              <div className="flex justify-between text-sm">
                {img.is_primary ? (
                  <span className="text-ink/35">封面</span>
                ) : (
                  <button
                    onClick={() => makePrimary(img.id)}
                    className="text-gold hover:text-bronze"
                  >
                    設為封面
                  </button>
                )}
                <button onClick={() => remove(img.id)} className="text-ink/40 hover:text-red-600">
                  刪除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
