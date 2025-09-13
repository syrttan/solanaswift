/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Bundle optimization
  experimental: {},
  
  webpack: (config, { dev, isServer }) => {
    // Fallbacks for Node.js modules
    config.resolve.fallback = {
      fs: false,
      os: false,
      path: false,
      crypto: false,
    };
    
    // Optimize bundle splitting for better performance
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          recharts: {
            name: 'recharts',
            test: /[\\/]node_modules[\\/](recharts|d3-.*)[\\/]/,
            priority: 30,
          },
          solana: {
            name: 'solana',
            test: /[\\/]node_modules[\\/](@solana|@coral-xyz)[\\/]/,
            priority: 25,
          },
          default: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },
}

module.exports = nextConfig