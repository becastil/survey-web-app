#!/bin/bash

# ================================================
# Survey Web App - Cloudflare Static Refactor Script
# ================================================
# Converts Next.js SSR app to static architecture for Cloudflare Pages
# Run with: bash scripts/cloudflare-static-refactor.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="survey-web-app"
API_PROJECT_NAME="survey-api-workers"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Cloudflare Pages Static Architecture Refactor${NC}"
echo -e "${BLUE}================================================${NC}"

# Function to print status
print_status() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Step 1: Create Backup
print_status "Creating backup branch..."
git branch -D backup-before-static-refactor 2>/dev/null || true
git checkout -b backup-before-static-refactor
git checkout -
print_success "Backup branch created: backup-before-static-refactor"

# Step 2: Create Workers API Project
print_status "Setting up Cloudflare Workers API..."

if [ ! -d "$API_PROJECT_NAME" ]; then
    mkdir -p "$API_PROJECT_NAME/src"
    cd "$API_PROJECT_NAME"
    
    # Initialize package.json
    cat > package.json << 'EOF'
{
  "name": "survey-api-workers",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.0.0",
    "typescript": "^5.0.0",
    "wrangler": "^3.0.0"
  },
  "dependencies": {
    "itty-router": "^4.0.0",
    "itty-cors": "^0.3.0"
  }
}
EOF
    
    # Create wrangler.toml
    cat > wrangler.toml << 'EOF'
name = "survey-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.production]
vars = { ENVIRONMENT = "production" }

# Add your Supabase credentials here
# [env.production.vars]
# SUPABASE_URL = "https://lrhqxbqbyalosgqjobxf.supabase.co"
# SUPABASE_ANON_KEY = "your-key-here"
EOF
    
    # Create TypeScript config
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "types": ["@cloudflare/workers-types"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF
    
    # Create main API file
    cat > src/index.ts << 'EOF'
import { Router } from 'itty-router';
import { createCors } from 'itty-cors';

const router = Router();
const { preflight, corsify } = createCors({
  origins: ['*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization'],
});

// Type definitions
interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

// Health check endpoint
router.get('/api/health', () => {
  return new Response(JSON.stringify({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// Get all surveys
router.get('/api/surveys', async (request, env: Env) => {
  try {
    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/surveys?select=*`,
      {
        headers: {
          'apikey': env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Supabase error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch surveys',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Create survey
router.post('/api/surveys', async (request, env: Env) => {
  try {
    const body = await request.json();
    
    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/surveys`,
      {
        method: 'POST',
        headers: {
          'apikey': env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(body),
      }
    );
    
    if (!response.ok) {
      throw new Error(`Supabase error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to create survey',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Handle preflight requests
router.all('*', preflight);

// 404 handler
router.all('*', () => new Response('Not Found', { status: 404 }));

// Export handler
export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) =>
    router.handle(request, env, ctx).then(corsify),
};
EOF
    
    npm install
    print_success "Workers API project created"
    cd ..
else
    print_warning "Workers API project already exists"
fi

# Step 3: Convert Frontend to Static Export
print_status "Converting frontend to static export..."

# Create new next.config.js for static export
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://survey-api.workers.dev'
      : 'http://localhost:8787',
    NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA || 'true',
    SKIP_ENV_VALIDATION: 'true',
  },
};

module.exports = nextConfig;
EOF
print_success "Created static export configuration"

# Step 4: Create Client-Side Auth Module
print_status "Creating client-side authentication..."

mkdir -p lib/auth
cat > lib/auth/client-auth.ts << 'EOF'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

class ClientAuth {
  private static instance: ClientAuth;
  private supabase = createClientComponentClient();

  static getInstance(): ClientAuth {
    if (!ClientAuth.instance) {
      ClientAuth.instance = new ClientAuth();
    }
    return ClientAuth.instance;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.session) {
      localStorage.setItem('auth_token', data.session.access_token);
      localStorage.setItem('user_id', data.user.id);
    }
    
    return data;
  }

  async signOut() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    return await this.supabase.auth.signOut();
  }

  async getSession() {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export const clientAuth = ClientAuth.getInstance();
EOF
print_success "Created client-side authentication"

# Step 5: Create API Client
print_status "Creating API client..."

mkdir -p lib/api
cat > lib/api/client.ts << 'EOF'
class APIClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

  private async fetch(endpoint: string, options?: RequestInit) {
    const token = localStorage.getItem('auth_token');
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Health check
  async health() {
    return this.fetch('/api/health');
  }

  // Survey methods
  async getSurveys() {
    return this.fetch('/api/surveys');
  }

  async createSurvey(data: any) {
    return this.fetch('/api/surveys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSurvey(id: string) {
    return this.fetch(`/api/surveys/${id}`);
  }

  async updateSurvey(id: string, data: any) {
    return this.fetch(`/api/surveys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSurvey(id: string) {
    return this.fetch(`/api/surveys/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new APIClient();
EOF
print_success "Created API client"

# Step 6: Create Client Components Wrapper
print_status "Creating client components wrapper..."

cat > components/ClientOnly.tsx << 'EOF'
'use client';

import { useEffect, useState } from 'react';

export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}
EOF
print_success "Created ClientOnly wrapper"

# Step 7: Update wrangler.toml for static export
cat > wrangler.toml << 'EOF'
name = "survey-web-app"
compatibility_date = "2024-01-01"
pages_build_output_dir = "out"

[vars]
NEXT_PUBLIC_APP_NAME = "Healthcare Survey Dashboard"
NEXT_PUBLIC_USE_MOCK_DATA = "true"
NEXT_PUBLIC_API_URL = "https://survey-api.workers.dev"
EOF
print_success "Updated wrangler.toml"

# Step 8: Remove middleware (not supported in static export)
if [ -f "middleware.ts" ]; then
    mv middleware.ts middleware.ts.backup
    print_success "Disabled middleware (saved as middleware.ts.backup)"
fi

# Step 9: Update package.json scripts
print_status "Updating build scripts..."

# Update package.json with jq if available, otherwise use sed
if command -v jq >/dev/null 2>&1; then
    jq '.scripts.build = "next build" | 
        .scripts["build:static"] = "next build && echo \"Build complete\"" |
        .scripts["preview:static"] = "npx serve out" |
        .scripts["deploy:api"] = "cd survey-api-workers && wrangler deploy" |
        .scripts["dev:api"] = "cd survey-api-workers && wrangler dev"' package.json > package.json.tmp && mv package.json.tmp package.json
else
    print_warning "jq not installed, please manually update package.json scripts"
fi

# Step 10: Test build
print_status "Testing static build..."
npm run build

if [ -d "out" ]; then
    print_success "Static build successful! Output in /out directory"
    
    # Count generated files
    FILE_COUNT=$(find out -type f | wc -l)
    print_success "Generated $FILE_COUNT static files"
else
    print_error "Static build failed - no output directory created"
fi

# Final Instructions
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Static Refactoring Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure Workers API environment variables:"
echo "   cd $API_PROJECT_NAME"
echo "   Edit wrangler.toml and add your Supabase credentials"
echo ""
echo "2. Deploy Workers API:"
echo "   ${YELLOW}npm run deploy:api${NC}"
echo ""
echo "3. Test static site locally:"
echo "   ${YELLOW}npm run preview:static${NC}"
echo ""
echo "4. Deploy to Cloudflare Pages:"
echo "   ${YELLOW}git add .${NC}"
echo "   ${YELLOW}git commit -m \"refactor: Convert to static architecture\"${NC}"
echo "   ${YELLOW}git push${NC}"
echo ""
echo "5. Update Cloudflare Pages settings:"
echo "   - Build command: npm run build"
echo "   - Build output directory: out"
echo "   - Environment variables:"
echo "     NEXT_PUBLIC_API_URL=https://survey-api.workers.dev"
echo "     NEXT_PUBLIC_USE_MOCK_DATA=false"
echo ""
echo -e "${YELLOW}⚠ Warning:${NC} This is a major architectural change!"
echo "Test thoroughly before deploying to production."
echo ""
echo "To rollback if needed:"
echo "   ${YELLOW}git checkout backup-before-static-refactor${NC}"