import { createAdminClient } from '@/lib/supabase/admin'
import type { Collection, Product } from '@/types'

const SELECT = '*, crystal_product_images(url, is_primary, sort_order)'
const PLACEHOLDER = '/images/amethyst-geode.png'

interface ImageRow {
  url: string
  is_primary: boolean
  sort_order: number
}
type Row = Omit<Product, 'images'> & { crystal_product_images: ImageRow[] | null }

function mapProduct(row: Row): Product {
  const sorted = [...(row.crystal_product_images ?? [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1
    return a.sort_order - b.sort_order
  })
  const { crystal_product_images: _images, ...rest } = row
  return {
    ...rest,
    price_hkd: Number(row.price_hkd),
    compare_price_hkd: row.compare_price_hkd === null ? null : Number(row.compare_price_hkd),
    weight_g: row.weight_g === null ? null : Number(row.weight_g),
    images: sorted.length ? sorted.map((i) => i.url) : [PLACEHOLDER],
  }
}

/** Admin listings show everything, hidden pieces included. */
export async function adminGetProducts(): Promise<Product[]> {
  const { data, error } = await createAdminClient()
    .from('crystal_products')
    .select(SELECT)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('adminGetProducts:', error.message)
    return []
  }
  return (data as Row[]).map(mapProduct)
}

export async function adminGetProduct(id: string): Promise<Product | null> {
  const { data, error } = await createAdminClient()
    .from('crystal_products')
    .select(SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null
  return mapProduct(data as Row)
}

export async function adminGetCollections(): Promise<Collection[]> {
  const { data } = await createAdminClient()
    .from('crystal_collections')
    .select('*')
    .order('sort_order', { ascending: true })
  return (data ?? []) as Collection[]
}

export async function adminGetSettings(): Promise<Record<string, string>> {
  const { data } = await createAdminClient().from('crystal_settings').select('key, value')
  const map: Record<string, string> = {}
  for (const row of data ?? []) map[row.key] = row.value
  return map
}
