import type { Metadata } from 'next'
import CheckoutClient from './CheckoutClient'
import { getSettings } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'checkout 結帳 | Mystic Crystal Workshop 神秘水晶工坊',
  robots: { index: false },
}

export const revalidate = 0

export default async function CheckoutPage() {
  const settings = await getSettings()

  return (
    <CheckoutClient
      settings={settings}
      // Card payment only appears once a real Stripe key is configured,
      // so the shop never offers a button that cannot charge anyone.
      stripeEnabled={Boolean(process.env.STRIPE_SECRET_KEY)}
    />
  )
}
