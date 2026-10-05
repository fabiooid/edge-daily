import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ['@electric-sql/pglite', '@mastra/core', 'postgres'],
  async redirects() {
    return [
      { source: '/archive/v1/:path*', destination: '/archive', permanent: true },
      { source: '/post/:path*', destination: '/archive', permanent: true },
    ]
  },
}

export default nextConfig
