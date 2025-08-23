/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for Cloudflare Pages
  output: 'standalone',
  
  // Disable image optimization (not supported on Cloudflare Pages)
  images: {
    unoptimized: true,
  },
  
  // Ignore build errors temporarily
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Reduce memory usage
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // Environment variables
  env: {
    SKIP_ENV_VALIDATION: 'true',
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Ignore warnings
    config.ignoreWarnings = [
      { module: /node_modules\/vega-canvas/ },
      { module: /node_modules\/@supabase/ },
    ];
    
    // Optimize for Cloudflare
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;