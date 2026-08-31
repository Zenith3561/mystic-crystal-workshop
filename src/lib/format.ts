export const formatPrice = (p: number) => `HK$${p.toLocaleString('en-HK')}`

/** Shipping is free over a threshold, both configurable in the admin. */
export function shippingFor(subtotal: number, settings: Record<string, string>) {
  const flat = Number(settings.shipping_flat_hkd ?? 30)
  const freeOver = Number(settings.free_shipping_over ?? 500)
  if (!Number.isFinite(flat) || flat <= 0) return 0
  if (Number.isFinite(freeOver) && freeOver > 0 && subtotal >= freeOver) return 0
  return flat
}
