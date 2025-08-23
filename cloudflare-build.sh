#!/bin/bash

echo "Starting Cloudflare Pages build..."

# Set environment variables
export NODE_VERSION=18
export SKIP_ENV_VALIDATION=true
export NODE_OPTIONS="--max-old-space-size=4096"

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Run the build
echo "Building Next.js application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build completed successfully!"
    
    # List output directory contents
    echo "Build output:"
    ls -la .next/
    
    exit 0
else
    echo "Build failed!"
    exit 1
fi