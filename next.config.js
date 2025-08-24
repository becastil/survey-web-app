/** @type {import('next').NextConfig} */

// Determine if we're building for Cloudflare Pages
const isCloudflare = process.env.CF_PAGES || process.env.CLOUDFLARE_BUILD === 'true';

const nextConfig = {
  // Use static export for Cloudflare Pages
  output: isCloudflare ? 'export' : undefined,
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Add trailing slashes for better static hosting compatibility
  trailingSlash: true,
  
  // Ignore type/lint errors during build
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
    
    // Add alias for plotly.js to use the minified version
    config.resolve.alias = {
      ...config.resolve.alias,
      'plotly.js/dist/plotly': 'plotly.js-dist-min',
      'plotly.js': 'plotly.js-dist-min',
    };
    
    // Add fallbacks for Node.js modules not available in browser
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