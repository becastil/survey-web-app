import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Suppress specific warnings
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules\/vega-canvas/ },
      { module: /node_modules\/@supabase/ },
    ];
    return config;
  },
};

export default nextConfig;
