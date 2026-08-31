'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { brand } from '@/lib/data'

const links = [
  { href: '/admin', label: '概覽' },
  { href: '/admin/products', label: '水晶貨品' },
  { href: '/admin/collections', label: '系列' },
  { href: '/admin/orders', label: '訂單' },
  { href: '/admin/settings', label: '設定' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' })
    router.replace('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-52 shrink-0 border-r border-gold/20 bg-white/50 p-5">
      <p className="font-display text-lg leading-tight text-ink">{brand.nameEn}</p>
      <p className="mb-8 text-[10px] tracking-[0.3em] text-gold">管理後台</p>

      <nav className="space-y-1">
        {links.map((l) => {
          const active = l.href === '/admin' ? pathname === '/admin' : pathname.startsWith(l.href)
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block rounded-lg px-3 py-2 text-base transition-colors ${
                active ? 'bg-gold text-white' : 'text-ink/70 hover:bg-gold/10 hover:text-gold'
              }`}
            >
              {l.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-10 space-y-2 border-t border-gold/20 pt-5">
        <Link href="/" target="_blank" className="block text-sm text-ink/50 hover:text-gold">
          睇網店 ↗
        </Link>
        <button onClick={logout} className="block text-sm text-ink/50 hover:text-gold">
          登出
        </button>
      </div>
    </aside>
  )
}
