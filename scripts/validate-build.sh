#!/bin/bash

echo "=== Build Validation Script ==="
echo ""

# Check Node version
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo ""

# Check if all dependencies are installed
echo "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "node_modules not found. Installing dependencies..."
    npm install --legacy-peer-deps
fi

# Try TypeScript compilation first
echo ""
echo "Running TypeScript check..."
npx tsc --noEmit 2>&1 | head -20

# Try ESLint
echo ""
echo "Running ESLint..."
npx next lint 2>&1 | head -20

# Try a simple Next.js build with verbose output
echo ""
echo "Attempting Next.js build with verbose logging..."
SKIP_ENV_VALIDATION=1 npx --yes next@15.4.7 build 2>&1 | head -50

echo ""
echo "=== Validation Complete ==="