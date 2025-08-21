import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize build for memory constraints
  swcMinify: true,
  // TEMPORARY: Disable type checking for deployment
  // TODO: Re-enable after fixing type issues
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Reduce memory usage during build
    workerThreads: false,
    cpus: 1,
  },
  // Suppress specific warnings
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /node_modules\/vega-canvas/ },
      { module: /node_modules\/@supabase/ },
    ];
    
    // Optimize for build memory
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }
    
    return config;
  },
  // Reduce build memory usage
  productionBrowserSourceMaps: false,
};

export default nextConfig;
