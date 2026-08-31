import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'
import DeleteProductButton from '@/components/admin/DeleteProductButton'
import { adminGetCollections, adminGetProduct } from '@/lib/admin-queries'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, collections] = await Promise.all([
    adminGetProduct(id),
    adminGetCollections(),
  ])

  if (!product) notFound()

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-gold hover:text-bronze">
        ← 返回貨品清單
      </Link>
      <div className="mb-8 mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">{product.name_zh}</h1>
          <p className="text-base text-ink/50">{product.name_en}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/shop/${product.slug}`}
            target="_blank"
            className="text-sm text-gold hover:text-bronze"
          >
            喺網店睇 ↗
          </Link>
          <DeleteProductButton id={product.id} name={product.name_zh} />
        </div>
      </div>
      <ProductForm product={product} collections={collections} />
    </div>
  )
}
