'use client'
import { useState } from 'react'
import { brand } from '@/lib/data'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = encodeURIComponent(`你好，我係 ${name}：${message}`)
    window.open(`https://wa.me/${brand.whatsapp}?text=${text}`, '_blank')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm tracking-[0.3em] uppercase text-gold mb-2">
          Name 姓名
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-xl border border-gold/30 bg-white px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
          placeholder="Your name 你的名字"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm tracking-[0.3em] uppercase text-gold mb-2">
          Message 留言
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          className="w-full rounded-xl border border-gold/30 bg-white px-4 py-3 text-sm outline-none focus:border-gold transition-colors resize-none"
          placeholder="Which crystal are you interested in? 想查詢邊件水晶？"
        />
      </div>
      <button
        type="submit"
        className="rounded-xl bg-gold px-7 py-3 text-base text-white hover:bg-bronze transition-colors"
      >
        Send via WhatsApp 透過 WhatsApp 送出
      </button>
      <p className="text-sm text-ink/45">送出後會開啟 WhatsApp 對話，訊息唔會儲存喺網站。</p>
    </form>
  )
}
