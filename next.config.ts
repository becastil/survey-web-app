import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
