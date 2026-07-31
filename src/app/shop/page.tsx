import type { Metadata } from 'next'
import { Suspense } from 'react'
import ShopClient from './ShopClient'

export const metadata: Metadata = {
  title: 'shop 選購水晶 | Mystic Crystal Workshop 神秘水晶工坊',
  description: '選購天然水晶 — 晶洞、晶簇、水晶球、手把件，香港本地發貨。',
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopClient />
    </Suspense>
  )
}
