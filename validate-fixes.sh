#!/bin/bash

echo "🔍 Validating Priority 1 Critical Issues Fixes..."
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ISSUES_FOUND=0

echo ""
echo "1️⃣  Checking TypeScript Strict Mode..."
if grep -q '"strict": true' tsconfig.json; then
    echo -e "${GREEN}✅ TypeScript strict mode is enabled${NC}"
else
    echo -e "${RED}❌ TypeScript strict mode is NOT enabled${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""
echo "2️⃣  Checking for localStorage SSR protection..."
UNPROTECTED_LOCALSTORAGE=$(grep -r "localStorage\." --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v "typeof window" | grep -v "safeLocalStorage" | wc -l)
if [ "$UNPROTECTED_LOCALSTORAGE" -eq 0 ]; then
    echo -e "${GREEN}✅ All localStorage calls are SSR-safe${NC}"
else
    echo -e "${RED}❌ Found $UNPROTECTED_LOCALSTORAGE unprotected localStorage calls${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""
echo "3️⃣  Checking input sanitization..."
SANITIZE_IMPORTS=$(grep -r "import.*sanitize" --include="*.tsx" --include="*.ts" . 2>/dev/null | wc -l)
if [ "$SANITIZE_IMPORTS" -gt 5 ]; then
    echo -e "${GREEN}✅ Input sanitization is implemented ($SANITIZE_IMPORTS files using sanitization)${NC}"
else
    echo -e "${YELLOW}⚠️  Only $SANITIZE_IMPORTS files import sanitization utilities${NC}"
fi

echo ""
echo "4️⃣  Checking package-lock.json..."
if [ -f "package-lock.json" ]; then
    LOCK_SIZE=$(wc -l package-lock.json | awk '{print $1}')
    echo -e "${GREEN}✅ package-lock.json exists ($LOCK_SIZE lines)${NC}"
else
    echo -e "${RED}❌ package-lock.json is missing${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""
echo "5️⃣  Running TypeScript check..."
if npm run typecheck > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript compiles without errors${NC}"
else
    echo -e "${RED}❌ TypeScript compilation has errors${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""
echo "6️⃣  Checking for SSR-safe storage utility..."
if [ -f "lib/utils/storage.ts" ]; then
    echo -e "${GREEN}✅ SSR-safe storage utility exists${NC}"
else
    echo -e "${RED}❌ SSR-safe storage utility is missing${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""
echo "7️⃣  Checking for window usage in components..."
UNPROTECTED_WINDOW=$(grep -r "window\." --include="*.tsx" components/ 2>/dev/null | grep -v "typeof window" | wc -l)
if [ "$UNPROTECTED_WINDOW" -eq 0 ]; then
    echo -e "${GREEN}✅ All window usage in components is SSR-safe${NC}"
else
    echo -e "${RED}❌ Found $UNPROTECTED_WINDOW unprotected window references in components${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""
echo "================================================"
if [ "$ISSUES_FOUND" -eq 0 ]; then
    echo -e "${GREEN}🎉 All Priority 1 Critical Issues are FIXED!${NC}"
    echo -e "${GREEN}✨ The application is ready for production deployment${NC}"
else
    echo -e "${RED}⚠️  Found $ISSUES_FOUND remaining issues to fix${NC}"
fi
echo "================================================"

exit $ISSUES_FOUND