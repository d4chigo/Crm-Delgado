/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ['@google/generative-ai'],
  images: {
    unoptimized: true,
  },
  // Deshabilitar standalone para evitar problemas con symlinks en Windows
  // ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  // Habilitar polling para hot-reload en Docker (Windows/WSL)
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Configuración mejorada para hot-reload en Docker/Windows
      config.watchOptions = {
        poll: 1000, // Revisar cambios cada segundo
        aggregateTimeout: 300, // Delay antes de rebuilding
        ignored: /node_modules/, // Ignorar node_modules para mejor performance
      }
    }
    return config
  },
}

export default nextConfig
