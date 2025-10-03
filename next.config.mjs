/**
 * Render currently invokes the build via a custom script that resolves Next.js with npx.
 * Using ESM keeps config compatible with newer Next versions while satisfying the runtime.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
