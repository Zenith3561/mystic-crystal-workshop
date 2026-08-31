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
}

export default nextConfig
