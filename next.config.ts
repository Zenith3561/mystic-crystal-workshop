import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        // product photos uploaded from the admin live in Supabase storage
        protocol: 'https',
        hostname: 'supabase.zenithacct.com',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // One canonical origin. Login cookies and carts are stored per origin, so
  // www and the apex being two live addresses would mean two separate
  // sessions for the same shop. www always lands on the apex.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.mcwcrystal.com' }],
        destination: 'https://mcwcrystal.com/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
