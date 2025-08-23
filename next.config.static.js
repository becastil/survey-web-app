/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRITICAL: Static export for Cloudflare Pages
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Base path if deploying to subdirectory
  basePath: '',
  assetPrefix: '',
  
  // Trailing slashes for static hosting
  trailingSlash: true,
  
  // Ignore build errors temporarily
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Environment variables
  env: {
    SKIP_ENV_VALIDATION: 'true',
    NEXT_PUBLIC_USE_MOCK_DATA: 'true',
  },
  
  // Disable features not supported in static export
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;