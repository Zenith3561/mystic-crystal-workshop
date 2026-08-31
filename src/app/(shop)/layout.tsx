import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

// The footer shows live collections and contact details from the database,
// so no page under the shop may be frozen at build time.
export const dynamic = 'force-dynamic'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
