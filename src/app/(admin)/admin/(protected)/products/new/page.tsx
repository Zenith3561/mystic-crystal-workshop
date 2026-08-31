import Link from 'next/link'
import ProductForm from '@/components/admin/ProductForm'
import { adminGetCollections } from '@/lib/admin-queries'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const collections = await adminGetCollections()

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-gold hover:text-bronze">
        ← 返回貨品清單
      </Link>
      <h1 className="mb-2 mt-3 font-display text-3xl text-ink">加一件水晶</h1>
      <p className="mb-8 text-base text-ink/55">
        每件水晶都係獨立一件。填好資料建立咗之後，就可以上載相片。
      </p>
      <ProductForm collections={collections} />
    </div>
  )
}
