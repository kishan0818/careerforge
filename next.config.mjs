/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev }) => {
    // Avoid Windows file cache rename issues in development
    if (dev) {
      config.cache = { type: 'memory' }
    }
    return config
  },
}

export default nextConfig
