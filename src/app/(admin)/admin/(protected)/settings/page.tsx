import SettingsForm from '@/components/admin/SettingsForm'
import { adminGetSettings } from '@/lib/admin-queries'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const settings = await adminGetSettings()

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-2">設定</h1>
      <p className="mb-8 text-base text-ink/50">
        呢啲資料會喺網店同結帳頁顯示畀客人睇。
      </p>
      <SettingsForm settings={settings} />
    </div>
  )
}
