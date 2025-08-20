#!/bin/bash

# Build script with memory optimizations
echo "Starting optimized build process..."

# Set Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=2048"

# Skip environment validation during build
export SKIP_ENV_VALIDATION=true

# Use mock data mode for build
export NEXT_PUBLIC_USE_MOCK_DATA=true

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf .next

# Run the build
echo "Building application..."
npx next build

echo "Build complete!"