import { createClient } from '@/lib/supabase/client'
import type { Collection, Product, ShopSettings } from '@/types'

const PLACEHOLDER = '/images/amethyst-geode.png'

interface ImageRow {
  url: string
  is_primary: boolean
  sort_order: number
}

type ProductRow = Omit<Product, 'images'> & {
  crystal_product_images: ImageRow[] | null
}

const SELECT = '*, crystal_product_images(url, is_primary, sort_order)'

function mapProduct(row: ProductRow): Product {
  const sorted = [...(row.crystal_product_images ?? [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1
    return a.sort_order - b.sort_order
  })

  const { crystal_product_images: _images, ...rest } = row
  return {
    ...rest,
    price_hkd: Number(row.price_hkd),
    compare_price_hkd:
      row.compare_price_hkd === null ? null : Number(row.compare_price_hkd),
    weight_g: row.weight_g === null ? null : Number(row.weight_g),
    images: sorted.length ? sorted.map((i) => i.url) : [PLACEHOLDER],
  }
}

export async function getCollections(): Promise<Collection[]> {
  const { data, error } = await createClient()
    .from('crystal_collections')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('getCollections:', error.message)
    return []
  }
  return (data ?? []) as Collection[]
}

/** Everything a shopper may see — sold pieces included, marked as sold. */
export async function getProducts(collectionSlug?: string): Promise<Product[]> {
  let query = createClient()
    .from('crystal_products')
    .select(SELECT)
    .neq('status', 'hidden')
    .order('sort_order', { ascending: true })

  if (collectionSlug) query = query.eq('collection_slug', collectionSlug)

  const { data, error } = await query
  if (error) {
    console.error('getProducts:', error.message)
    return []
  }
  return (data as ProductRow[]).map(mapProduct)
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const { data, error } = await createClient()
    .from('crystal_products')
    .select(SELECT)
    .eq('status', 'active')
    .eq('featured', true)
    .order('sort_order', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('getFeaturedProducts:', error.message)
    return []
  }
  return (data as ProductRow[]).map(mapProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await createClient()
    .from('crystal_products')
    .select(SELECT)
    .eq('slug', slug)
    .neq('status', 'hidden')
    .maybeSingle()

  if (error || !data) return null
  return mapProduct(data as ProductRow)
}

export async function getSettings(): Promise<ShopSettings> {
  const { data, error } = await createClient()
    .from('crystal_settings')
    .select('key, value')

  if (error) {
    console.error('getSettings:', error.message)
    return {}
  }
  const map: ShopSettings = {}
  for (const row of data ?? []) map[row.key] = row.value
  return map
}
