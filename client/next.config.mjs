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
  // Habilitar standalone output para Docker
  output: 'standalone',
  // Habilitar polling para hot-reload en Docker (Windows/WSL)
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000, // Revisar cambios cada segundo
        aggregateTimeout: 300,
      }
    }
    return config
  },
}

export default nextConfig
