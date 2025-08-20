#!/bin/bash

echo "🔍 Validating Vercel deployment readiness..."
echo ""

# Check for package-lock.json
if [ -f "package-lock.json" ]; then
    echo "✅ package-lock.json exists"
else
    echo "❌ package-lock.json missing - run: npm install --legacy-peer-deps"
    exit 1
fi

# Check for localStorage SSR issues
echo ""
echo "Checking for localStorage SSR issues..."
LOCALSTORAGE_ISSUES=$(grep -r "localStorage\." --include="*.tsx" --include="*.ts" app/ components/ lib/ 2>/dev/null | grep -v "typeof window" | wc -l)
if [ "$LOCALSTORAGE_ISSUES" -eq 0 ]; then
    echo "✅ All localStorage calls are protected"
else
    echo "⚠️  Found $LOCALSTORAGE_ISSUES unprotected localStorage calls"
fi

# Check TypeScript config
echo ""
echo "Checking TypeScript configuration..."
if grep -q "ignoreBuildErrors: true" next.config.ts 2>/dev/null; then
    echo "❌ TypeScript errors are being ignored in next.config.ts"
else
    echo "✅ TypeScript errors are not ignored"
fi

# Check ESLint config
if grep -q "ignoreDuringBuilds: true" next.config.ts 2>/dev/null; then
    echo "❌ ESLint errors are being ignored in next.config.ts"
else
    echo "✅ ESLint errors are not ignored"
fi

# Check build script
echo ""
echo "Checking build script..."
if grep -q '"build": "next build --no-lint"' package.json; then
    echo "❌ Build script skips linting"
else
    echo "✅ Build script includes linting"
fi

# Check for security headers
echo ""
echo "Checking security headers in vercel.json..."
if [ -f "vercel.json" ]; then
    if grep -q "Content-Security-Policy" vercel.json; then
        echo "✅ CSP header configured"
    else
        echo "⚠️  Missing Content-Security-Policy header"
    fi
else
    echo "⚠️  vercel.json not found"
fi

# Check for mock data mode
echo ""
echo "Checking authentication configuration..."
if grep -q 'NEXT_PUBLIC_USE_MOCK_DATA: "true"' vercel.json 2>/dev/null; then
    echo "⚠️  Mock data mode is enabled in production"
else
    echo "✅ Mock data mode not hardcoded"
fi

# Try to run type checking
echo ""
echo "Running TypeScript type check..."
if npx tsc --noEmit 2>/dev/null; then
    echo "✅ TypeScript compilation successful"
else
    echo "⚠️  TypeScript compilation has warnings/errors"
fi

# Final summary
echo ""
echo "========================================="
echo "Validation Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Fix any ❌ issues above"
echo "2. Review ⚠️  warnings"
echo "3. Run: npm run build"
echo "4. Deploy to Vercel"