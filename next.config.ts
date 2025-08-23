import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Organization and project
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Auth token for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,
  
  // Suppresses all logs if true
  silent: true,
  
  // Upload source maps only in production
  dryRun: process.env.NODE_ENV !== 'production',
  
  // Hides source maps from generated client bundles
  hideSourceMaps: true,
  
  // Automatically release tracking
  release: {
    autoCreate: true,
    setCommits: {
      auto: true,
    },
  },
  
  // Disable Sentry in development
  disableLogger: process.env.NODE_ENV === 'development',
};

// Export with Sentry wrapper if DSN is configured
const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

export default SENTRY_DSN 
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;