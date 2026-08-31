export type ProductStatus = 'active' | 'reserved' | 'sold_out' | 'hidden'
export type PaymentMethod = 'stripe' | 'fps' | 'payme'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type FulfillmentStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface Collection {
  slug: string
  name_en: string
  name_zh: string
  desc_en: string
  desc_zh: string
  sort_order: number
}

/**
 * One physical crystal. There is no variant or stock count: a product row
 * IS the single piece, so `status` alone says whether it can be bought.
 */
export interface Product {
  id: string
  slug: string
  name_en: string
  name_zh: string
  desc_en: string
  desc_zh: string
  collection_slug: string | null
  price_hkd: number
  compare_price_hkd: number | null
  weight_g: number | null
  size_cm: string | null
  origin_en: string
  origin_zh: string
  status: ProductStatus
  is_new: boolean
  featured: boolean
  sort_order: number
  images: string[]
}

export interface OrderItem {
  id: string
  product_id: string | null
  name_en: string
  name_zh: string
  image_url: string
  unit_price_hkd: number
  quantity: number
  total_hkd: number
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  delivery_method: 'post' | 'pickup'
  customer_note: string
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  payment_ref: string
  payment_proof_url: string | null
  stripe_payment_intent_id: string | null
  fulfillment_status: FulfillmentStatus
  tracking_number: string
  subtotal_hkd: number
  shipping_hkd: number
  total_hkd: number
  created_at: string
  items?: OrderItem[]
}

export type ShopSettings = Record<string, string>
