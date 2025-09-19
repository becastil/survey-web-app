# 08-devops-and-cicd.md

# DevOps and CI/CD Strategy - Survey Web Application

## Overview

This document outlines the comprehensive DevOps and CI/CD strategy for the Survey Web Application, focusing on automated deployment pipelines, infrastructure management, monitoring, and operational excellence using modern cloud-native tools and practices.

## 1. DevOps Strategy and Principles

### 1.1 Core DevOps Principles

**Infrastructure as Code (IaC)**
- All infrastructure components defined in version-controlled configuration files
- Reproducible environments across development, staging, and production
- Automated provisioning and configuration management
- Immutable infrastructure patterns for consistency and reliability

**GitOps Workflow**
- Git repositories as the single source of truth for infrastructure and application state
- Automated deployments triggered by Git events (push, merge, tag)
- Pull-based deployment model for enhanced security
- Declarative configuration management

**Continuous Integration/Continuous Deployment (CI/CD)**
- Automated build, test, and deployment pipelines
- Fast feedback loops for developers
- Automated quality gates and security scanning
- Zero-downtime deployments with rollback capabilities

**Observability-First Approach**
- Comprehensive monitoring, logging, and tracing
- Proactive alerting and incident response
- Performance optimization through data-driven insights
- Real-time health checks and status monitoring

### 1.2 Environment Strategy

**Environment Hierarchy**
```
Development (Local)
├── Individual developer environments
├── Feature branch deployments
└── Local testing and debugging

Staging (Preview)
├── Pull request preview deployments
├── Integration testing environment
├── User acceptance testing
└── Performance testing

Production
├── Live application environment
├── Blue-green deployment capability
├── High availability and scaling
└── Disaster recovery readiness
```

**Environment Configuration**
```typescript
// config/environments.ts
interface EnvironmentConfig {
  name: string;
  domain: string;
  supabaseUrl: string;
  vercelProject: string;
  deploymentBranch: string;
  autoDeployEnabled: boolean;
  monitoring: {
    enabled: boolean;
    alerting: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

export const environments: Record<string, EnvironmentConfig> = {
  development: {
    name: 'development',
    domain: 'localhost:3000',
    supabaseUrl: 'https://dev-project.supabase.co',
    vercelProject: 'survey-app-dev',
    deploymentBranch: 'develop',
    autoDeployEnabled: true,
    monitoring: {
      enabled: true,
      alerting: false,
      logLevel: 'debug',
    },
  },
  staging: {
    name: 'staging',
    domain: 'staging-surveys.yourdomain.com',
    supabaseUrl: 'https://staging-project.supabase.co',
    vercelProject: 'survey-app-staging',
    deploymentBranch: 'staging',
    autoDeployEnabled: true,
    monitoring: {
      enabled: true,
      alerting: true,
      logLevel: 'info',
    },
  },
  production: {
    name: 'production',
    domain: 'surveys.yourdomain.com',
    supabaseUrl: 'https://prod-project.supabase.co',
    vercelProject: 'survey-app-prod',
    deploymentBranch: 'main',
    autoDeployEnabled: false, // Manual approval required
    monitoring: {
      enabled: true,
      alerting: true,
      logLevel: 'warn',
    },
  },
};
```

## 2. CI/CD Pipeline Architecture

### 2.1 GitHub Actions Workflow Structure

**Main CI/CD Pipeline**
```yaml
# .github/workflows/cicd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop, staging ]
  pull_request:
    branches: [ main, develop ]
  release:
    types: [ published ]

env:
  NODE_VERSION: '18'
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ secrets.TURBO_TEAM }}

jobs:
  # Quality Gates
  code-quality:
    name: Code Quality & Security
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier check
        run: npm run format:check

      - name: Type checking
        run: npm run type-check

      - name: Security audit
        run: npm audit --audit-level high

      - name: Run Semgrep security scan
        uses: semgrep/semgrep-action@v1
        with:
          config: auto

  # Testing Pipeline
  test-suite:
    name: Test Suite
    runs-on: ubuntu-latest
    needs: code-quality
    strategy:
      matrix:
        test-type: [unit, integration, e2e]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup test database
        if: matrix.test-type == 'integration'
        run: |
          docker run -d \
            --name postgres-test \
            -e POSTGRES_PASSWORD=postgres \
            -e POSTGRES_DB=test_db \
            -p 5432:5432 \
            postgres:15

      - name: Install Playwright
        if: matrix.test-type == 'e2e'
        run: npx playwright install --with-deps

      - name: Run tests
        run: npm run test:${{ matrix.test-type }}
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL_TEST }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY_TEST }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY_TEST }}

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results-${{ matrix.test-type }}
          path: |
            coverage/
            test-results/
            playwright-report/

  # Build Pipeline
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: test-suite
    outputs:
      build-id: ${{ steps.build-info.outputs.build-id }}
      commit-sha: ${{ steps.build-info.outputs.commit-sha }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Generate build info
        id: build-info
        run: |
          BUILD_ID=$(date +%Y%m%d%H%M%S)-${GITHUB_SHA:0:8}
          echo "build-id=$BUILD_ID" >> $GITHUB_OUTPUT
          echo "commit-sha=$GITHUB_SHA" >> $GITHUB_OUTPUT

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-${{ steps.build-info.outputs.build-id }}
          path: |
            .next/
            public/
            package.json
            next.config.js

  # Database Migration
  database-migration:
    name: Database Migration
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/staging'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npm run db:migrate
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          ENVIRONMENT: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}

  # Deployment Pipeline
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, database-migration]
    if: github.ref == 'refs/heads/staging'
    environment:
      name: staging
      url: https://staging-surveys.yourdomain.com
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_STAGING }}
          vercel-args: '--prod'

      - name: Update deployment status
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-type: application/json' \
            --data '{"text":"🚀 Staging deployment completed: https://staging-surveys.yourdomain.com"}'

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, database-migration]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://surveys.yourdomain.com
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-${{ needs.build.outputs.build-id }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_PRODUCTION }}
          vercel-args: '--prod'

      - name: Run post-deployment tests
        run: |
          npx playwright test \
            --config=playwright.config.production.ts \
            --reporter=github
        env:
          PLAYWRIGHT_BASE_URL: https://surveys.yourdomain.com

      - name: Notify deployment success
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-type: application/json' \
            --data '{"text":"✅ Production deployment completed: https://surveys.yourdomain.com"}'

  # Security and Compliance
  security-scan:
    name: Security Scanning
    runs-on: ubuntu-latest
    needs: deploy-production
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Run OWASP ZAP security scan
        uses: zaproxy/action-full-scan@v0.4.0
        with:
          target: 'https://surveys.yourdomain.com'
          rules_file_name: '.zap/rules.tsv'

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouse.config.js'
          uploadArtifacts: true
```

### 2.2 Feature Branch Workflow

**Pull Request Pipeline**
```yaml
# .github/workflows/pr.yml
name: Pull Request Checks

on:
  pull_request:
    branches: [ main, develop ]
    types: [ opened, synchronize, reopened ]

jobs:
  pr-checks:
    name: PR Quality Gates
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run affected tests
        run: npm run test:affected
        env:
          NX_BASE: origin/${{ github.base_ref }}
          NX_HEAD: HEAD

      - name: Build affected projects
        run: npm run build:affected
        env:
          NX_BASE: origin/${{ github.base_ref }}
          NX_HEAD: HEAD

      - name: Comment PR with results
        uses: actions/github-script@v7
        with:
          script: |
            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            });
            
            const botComment = comments.find(comment => 
              comment.user.type === 'Bot' && 
              comment.body.includes('PR Checks')
            );
            
            const body = `## PR Checks Results
            ✅ Code quality checks passed
            ✅ Tests passed
            ✅ Build successful
            
            **Build ID:** ${process.env.GITHUB_RUN_ID}
            **Commit:** ${context.sha.substring(0, 8)}`;
            
            if (botComment) {
              github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: botComment.id,
                body: body
              });
            } else {
              github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: body
              });
            }

  preview-deployment:
    name: Preview Deployment
    runs-on: ubuntu-latest
    needs: pr-checks
    steps:
      - name: Deploy preview to Vercel
        uses: amondnet/vercel-action@v25
        id: deploy-preview
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_STAGING }}

      - name: Comment preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `🔍 **Preview Deployment**
              
              Your changes have been deployed to: ${{ steps.deploy-preview.outputs.preview-url }}
              
              Please test your changes and ensure everything works as expected.`
            });
```

### 2.3 Release Pipeline

**Automated Release Workflow**
```yaml
# .github/workflows/release.yml
name: Release Pipeline

on:
  push:
    tags:
      - 'v*'

jobs:
  create-release:
    name: Create Release
    runs-on: ubuntu-latest
    outputs:
      release-id: ${{ steps.create-release.outputs.id }}
      upload-url: ${{ steps.create-release.outputs.upload_url }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate changelog
        id: changelog
        run: |
          npx conventional-changelog-cli -p angular -i CHANGELOG.md -s
          echo "CHANGELOG<<EOF" >> $GITHUB_OUTPUT
          cat CHANGELOG.md | head -50 >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Create release
        id: create-release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body: ${{ steps.changelog.outputs.CHANGELOG }}
          draft: false
          prerelease: false

  deploy-production-release:
    name: Deploy Production Release
    runs-on: ubuntu-latest
    needs: create-release
    environment:
      name: production
      url: https://surveys.yourdomain.com
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Deploy to production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_PRODUCTION }}
          vercel-args: '--prod'

      - name: Create deployment record
        run: |
          curl -X POST "https://api.github.com/repos/${{ github.repository }}/deployments" \
            -H "Authorization: token ${{ secrets.GITHUB_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{
              "ref": "${{ github.ref }}",
              "environment": "production",
              "description": "Production deployment for ${{ github.ref }}"
            }'

      - name: Notify team
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-type: application/json' \
            --data '{
              "text": "🎉 Production release deployed: ${{ github.ref }}",
              "attachments": [{
                "color": "good",
                "fields": [{
                  "title": "Version",
                  "value": "${{ github.ref }}",
                  "short": true
                }, {
                  "title": "Environment",
                  "value": "Production",
                  "short": true
                }, {
                  "title": "URL",
                  "value": "https://surveys.yourdomain.com",
                  "short": false
                }]
              }]
            }'
```

## 3. Infrastructure Configuration

### 3.1 Vercel Configuration

**Project Configuration**
```json
// vercel.json
{
  "version": 2,
  "framework": "nextjs",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "headers": {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    },
    {
      "src": "/health",
      "dest": "/api/health"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/admin",
      "destination": "/dashboard",
      "permanent": false
    }
  ],
  "rewrites": [
    {
      "source": "/survey/:slug",
      "destination": "/surveys/:slug"
    }
  ],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024,
      "runtime": "nodejs18.x"
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/analytics",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Environment-Specific Configuration**
```typescript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      process.env.SUPABASE_URL?.replace('https://', '') || '',
    ],
    formats: ['image/webp', 'image/avif'],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: `
            default-src 'self';
            script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com;
            style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
            img-src 'self' blob: data: https:;
            font-src 'self' https://fonts.gstatic.com;
            connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL} https://vitals.vercel-insights.com;
            frame-src 'none';
            object-src 'none';
          `.replace(/\s+/g, ' ').trim()
        }
      ],
    },
  ],
  webpack: (config, { buildId, dev, isServer }) => {
    if (!dev && !isServer) {
      // Bundle analyzer in production builds
      config.plugins.push(
        new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)({
          analyzerMode: 'static',
          openAnalyzer: false,
          generateStatsFile: true,
        })
      );
    }
    return config;
  },
  env: {
    BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    BUILD_TIME: new Date().toISOString(),
  },
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  transpileClientSDK: true,
  hideSourceMaps: true,
  disableLogger: true,
});
```

### 3.2 Supabase Configuration

**Database Setup Script**
```sql
-- infrastructure/supabase/setup.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create application schemas
CREATE SCHEMA IF NOT EXISTS surveys;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS audit;

-- Set up Row Level Security policies
ALTER TABLE surveys.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys.survey_collaborators ENABLE ROW LEVEL SECURITY;

-- Create monitoring views
CREATE OR REPLACE VIEW analytics.survey_metrics AS
SELECT 
  s.id,
  s.title,
  s.created_at,
  COUNT(DISTINCT sr.id) as response_count,
  COUNT(DISTINCT sr.respondent_id) as unique_respondents,
  AVG(EXTRACT(EPOCH FROM (sr.completed_at - sr.started_at))) as avg_completion_time
FROM surveys.surveys s
LEFT JOIN surveys.survey_responses sr ON s.id = sr.survey_id
WHERE sr.completed_at IS NOT NULL
GROUP BY s.id, s.title, s.created_at;

-- Create health check function
CREATE OR REPLACE FUNCTION public.health_check()
RETURNS json AS $$
BEGIN
  RETURN json_build_object(
    'status', 'healthy',
    'timestamp', NOW(),
    'database_size', pg_database_size(current_database()),
    'active_connections', (SELECT count(*) FROM pg_stat_activity WHERE state = 'active')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Supabase CLI Configuration**
```toml
# supabase/config.toml
project_id = "your-project-id"

[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public", "surveys", "analytics"]
extra_search_path = ["public", "surveys"]
max_rows = 1000

[db]
port = 54322
shadow_port = 54320
major_version = 15

[studio]
enabled = true
port = 54323

[inbucket]
enabled = true
port = 54324

[storage]
enabled = true
file_size_limit = "50MiB"
image_transformation = true

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://staging-surveys.yourdomain.com", "https://surveys.yourdomain.com"]
jwt_expiry = 3600
enable_manual_linking = false

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true

[auth.sms]
enable_signup = false

[edge_functions]
enabled = true

[analytics]
enabled = true
```

### 3.3 Environment Variables Management

**Environment Configuration Template**
```bash
# .env.example

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Monitoring & Analytics
SENTRY_DSN=https://your-sentry-dsn
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID

# External Integrations
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
GITHUB_TOKEN=your-github-token

# Security
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Email (Optional)
SENDGRID_API_KEY=your-sendgrid-key
EMAIL_FROM=noreply@yourdomain.com

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_COLLABORATION=true
NEXT_PUBLIC_ENABLE_EXPORT=true
```

**Secure Environment Management**
```typescript
// lib/env-validation.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: z.string().optional(),
});

export const env = envSchema.parse(process.env);

// Runtime environment validation
export const validateEnvironment = () => {
  try {
    envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
  }
};
```

## 4. Deployment Automation

### 4.1 Zero-Downtime Deployment Strategy

**Blue-Green Deployment Implementation**
```typescript
// scripts/deploy.ts
interface DeploymentConfig {
  environment: 'staging' | 'production';
  version: string;
  rollbackVersion?: string;
  healthCheckUrl: string;
  timeout: number;
}

class DeploymentManager {
  private config: DeploymentConfig;

  constructor(config: DeploymentConfig) {
    this.config = config;
  }

  async deploy(): Promise<void> {
    console.log(`🚀 Starting deployment to ${this.config.environment}`);
    
    try {
      // 1. Pre-deployment health check
      await this.preDeploymentCheck();
      
      // 2. Deploy to staging slot
      const deploymentUrl = await this.deployToStaging();
      
      // 3. Run health checks on new deployment
      await this.healthCheck(deploymentUrl);
      
      // 4. Run smoke tests
      await this.runSmokeTests(deploymentUrl);
      
      // 5. Switch traffic to new deployment
      await this.switchTraffic();
      
      // 6. Final health check
      await this.healthCheck(this.config.healthCheckUrl);
      
      console.log('✅ Deployment completed successfully');
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      await this.rollback();
      throw error;
    }
  }

  private async preDeploymentCheck(): Promise<void> {
    const response = await fetch(`${this.config.healthCheckUrl}/api/health`);
    if (!response.ok) {
      throw new Error('Pre-deployment health check failed');
    }
  }

  private async deployToStaging(): Promise<string> {
    // Use Vercel API to deploy to staging slot
    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'survey-app',
        gitSource: {
          type: 'github',
          repo: 'your-org/survey-app',
          ref: this.config.version,
        },
        target: 'staging',
      }),
    });

    const deployment = await response.json();
    return `https://${deployment.url}`;
  }

  private async healthCheck(url: string): Promise<void> {
    const maxRetries = 10;
    const retryDelay = 5000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`${url}/api/health`, {
          timeout: 10000,
        });

        if (response.ok) {
          const health = await response.json();
          if (health.status === 'healthy') {
            console.log(`✅ Health check passed (attempt ${i + 1})`);
            return;
          }
        }
      } catch (error) {
        console.log(`⏳ Health check failed (attempt ${i + 1}), retrying...`);
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    throw new Error('Health check failed after maximum retries');
  }

  private async runSmokeTests(url: string): Promise<void> {
    console.log('🧪 Running smoke tests...');
    
    const tests = [
      { name: 'Homepage', path: '/' },
      { name: 'Login page', path: '/login' },
      { name: 'API health', path: '/api/health' },
      { name: 'Dashboard', path: '/dashboard' },
    ];

    for (const test of tests) {
      const response = await fetch(`${url}${test.path}`);
      if (!response.ok) {
        throw new Error(`Smoke test failed for ${test.name}: ${response.status}`);
      }
      console.log(`✅ ${test.name} test passed`);
    }
  }

  private async switchTraffic(): Promise<void> {
    console.log('🔄 Switching traffic to new deployment...');
    
    // Use Vercel API to promote staging to production
    const response = await fetch(`https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/promote`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deploymentId: process.env.DEPLOYMENT_ID,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to switch traffic');
    }
  }

  private async rollback(): Promise<void> {
    if (!this.config.rollbackVersion) {
      console.log('❌ No rollback version specified');
      return;
    }

    console.log(`🔄 Rolling back to version ${this.config.rollbackVersion}`);
    
    // Implement rollback logic
    const rollbackConfig = {
      ...this.config,
      version: this.config.rollbackVersion,
    };

    const rollbackManager = new DeploymentManager(rollbackConfig);
    await rollbackManager.deploy();
  }
}

// Usage
const deploymentConfig: DeploymentConfig = {
  environment: process.env.ENVIRONMENT as 'staging' | 'production',
  version: process.env.GITHUB_SHA || 'latest',
  rollbackVersion: process.env.ROLLBACK_VERSION,
  healthCheckUrl: process.env.HEALTH_CHECK_URL || 'https://surveys.yourdomain.com',
  timeout: 300000, // 5 minutes
};

const deployment = new DeploymentManager(deploymentConfig);
deployment.deploy().catch(console.error);
```

### 4.2 Database Migration Strategy

**Automated Migration Pipeline**
```typescript
// scripts/migrate.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

interface Migration {
  id: string;
  name: string;
  timestamp: Date;
  sql: string;
  rollback?: string;
}

class MigrationManager {
  private supabase: any;
  private migrationsPath: string;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.migrationsPath = path.join(process.cwd(), 'migrations');
  }

  async runMigrations(): Promise<void> {
    console.log('🔄 Starting database migrations...');

    // Ensure migrations table exists
    await this.ensureMigrationsTable();

    // Get pending migrations
    const pendingMigrations = await this.getPendingMigrations();

    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }

    console.log(`📋 Found ${pendingMigrations.length} pending migrations`);

    // Run migrations in transaction
    for (const migration of pendingMigrations) {
      await this.runMigration(migration);
    }

    console.log('✅ All migrations completed successfully');
  }

  private async ensureMigrationsTable(): Promise<void> {
    const { error } = await this.supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS migrations (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          checksum TEXT NOT NULL
        );
      `
    });

    if (error) {
      throw new Error(`Failed to create migrations table: ${error.message}`);
    }
  }

  private async getPendingMigrations(): Promise<Migration[]> {
    // Read migration files
    const files = await fs.readdir(this.migrationsPath);
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Get executed migrations
    const { data: executedMigrations, error } = await this.supabase
      .from('migrations')
      .select('id');

    if (error) {
      throw new Error(`Failed to get executed migrations: ${error.message}`);
    }

    const executedIds = new Set(executedMigrations?.map((m: any) => m.id) || []);

    // Filter pending migrations
    const pendingMigrations: Migration[] = [];

    for (const file of migrationFiles) {
      const id = path.basename(file, '.sql');
      
      if (!executedIds.has(id)) {
        const sql = await fs.readFile(path.join(this.migrationsPath, file), 'utf-8');
        
        pendingMigrations.push({
          id,
          name: file,
          timestamp: new Date(),
          sql,
        });
      }
    }

    return pendingMigrations;
  }

  private async runMigration(migration: Migration): Promise<void> {
    console.log(`🔄 Running migration: ${migration.name}`);

    try {
      // Calculate checksum
      const checksum = require('crypto')
        .createHash('sha256')
        .update(migration.sql)
        .digest('hex');

      // Execute migration
      const { error: migrationError } = await this.supabase.rpc('exec_sql', {
        sql: migration.sql
      });

      if (migrationError) {
        throw new Error(`Migration failed: ${migrationError.message}`);
      }

      // Record migration
      const { error: recordError } = await this.supabase
        .from('migrations')
        .insert({
          id: migration.id,
          name: migration.name,
          checksum,
        });

      if (recordError) {
        throw new Error(`Failed to record migration: ${recordError.message}`);
      }

      console.log(`✅ Migration completed: ${migration.name}`);
    } catch (error) {
      console.error(`❌ Migration failed: ${migration.name}`, error);
      throw error;
    }
  }

  async rollback(migrationId: string): Promise<void> {
    console.log(`🔄 Rolling back migration: ${migrationId}`);

    // Load rollback SQL
    const rollbackFile = path.join(this.migrationsPath, 'rollbacks', `${migrationId}.sql`);
    
    try {
      const rollbackSql = await fs.readFile(rollbackFile, 'utf-8');
      
      // Execute rollback
      const { error: rollbackError } = await this.supabase.rpc('exec_sql', {
        sql: rollbackSql
      });

      if (rollbackError) {
        throw new Error(`Rollback failed: ${rollbackError.message}`);
      }

      // Remove migration record
      const { error: deleteError } = await this.supabase
        .from('migrations')
        .delete()
        .eq('id', migrationId);

      if (deleteError) {
        throw new Error(`Failed to remove migration record: ${deleteError.message}`);
      }

      console.log(`✅ Rollback completed: ${migrationId}`);
    } catch (error) {
      console.error(`❌ Rollback failed: ${migrationId}`, error);
      throw error;
    }
  }
}

// CLI interface
const command = process.argv[2];
const migrationManager = new MigrationManager();

switch (command) {
  case 'migrate':
    migrationManager.runMigrations().catch(console.error);
    break;
  case 'rollback':
    const migrationId = process.argv[3];
    if (!migrationId) {
      console.error('Migration ID required for rollback');
      process.exit(1);
    }
    migrationManager.rollback(migrationId).catch(console.error);
    break;
  default:
    console.log('Usage: npm run db:migrate [migrate|rollback <migration-id>]');
    process.exit(1);
}
```

## 5. Monitoring and Observability

### 5.1 Application Performance Monitoring

**Sentry Integration**
```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';
import { BrowserTracing } from '@sentry/tracing';

export const initializeMonitoring = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      new BrowserTracing({
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/.*\.vercel\.app/,
          /^https:\/\/surveys\.yourdomain\.com/,
        ],
      }),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event, hint) {
      // Filter out known false positives
      if (event.exception) {
        const error = hint.originalException;
        if (error && error instanceof Error) {
          // Skip network errors
          if (error.message.includes('NetworkError')) {
            return null;
          }
          // Skip CSP violations
          if (error.message.includes('Content Security Policy')) {
            return null;
          }
        }
      }
      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      // Filter sensitive breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
        return null;
      }
      return breadcrumb;
    },
  });
};

// Custom error tracking
export const trackError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional_info', context);
    }
    Sentry.captureException(error);
  });
};

// Performance tracking
export const trackPerformance = (name: string, value: number, unit: string = 'ms') => {
  Sentry.addBreadcrumb({
    message: `Performance: ${name}`,
    level: 'info',
    data: { value, unit },
  });
};

// User context tracking
export const setUserContext = (user: { id: string; email: string; role: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
};
```

**Custom Monitoring Dashboard**
```typescript
// pages/api/monitoring/metrics.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

interface Metrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  userCount: number;
  surveyCount: number;
  responseCount: number;
  databaseSize: number;
  memoryUsage: NodeJS.MemoryUsage;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const metrics = await collectMetrics();
    
    res.status(200).json({
      timestamp: new Date().toISOString(),
      metrics,
    });
  } catch (error) {
    console.error('Error collecting metrics:', error);
    res.status(500).json({ error: 'Failed to collect metrics' });
  }
}

async function collectMetrics(): Promise<Metrics> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Collect application metrics
  const startTime = Date.now();
  
  const [
    userStats,
    surveyStats,
    responseStats,
    dbHealth
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('surveys').select('id', { count: 'exact', head: true }),
    supabase.from('survey_responses').select('id', { count: 'exact', head: true }),
    supabase.rpc('health_check')
  ]);

  const responseTime = Date.now() - startTime;

  return {
    uptime: process.uptime(),
    responseTime,
    errorRate: 0, // Would be calculated from error logs
    userCount: userStats.count || 0,
    surveyCount: surveyStats.count || 0,
    responseCount: responseStats.count || 0,
    databaseSize: dbHealth.data?.database_size || 0,
    memoryUsage: process.memoryUsage(),
  };
}
```

### 5.2 Real-time Alerting System

**Alert Configuration**
```typescript
// lib/alerting.ts
interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: any) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cooldown: number; // minutes
  channels: ('slack' | 'email' | 'sms')[];
}

const alertRules: AlertRule[] = [
  {
    id: 'high_error_rate',
    name: 'High Error Rate',
    condition: (metrics) => metrics.errorRate > 0.05, // 5%
    severity: 'high',
    cooldown: 15,
    channels: ['slack', 'email'],
  },
  {
    id: 'slow_response_time',
    name: 'Slow Response Time',
    condition: (metrics) => metrics.responseTime > 2000, // 2 seconds
    severity: 'medium',
    cooldown: 10,
    channels: ['slack'],
  },
  {
    id: 'database_size_limit',
    name: 'Database Size Approaching Limit',
    condition: (metrics) => metrics.databaseSize > 1000000000, // 1GB
    severity: 'medium',
    cooldown: 60,
    channels: ['slack', 'email'],
  },
  {
    id: 'memory_usage_high',
    name: 'High Memory Usage',
    condition: (metrics) => metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal > 0.9,
    severity: 'high',
    cooldown: 5,
    channels: ['slack'],
  },
];

export class AlertManager {
  private lastAlertTimes = new Map<string, number>();

  async checkAlerts(metrics: any): Promise<void> {
    for (const rule of alertRules) {
      if (this.shouldTriggerAlert(rule, metrics)) {
        await this.triggerAlert(rule, metrics);
      }
    }
  }

  private shouldTriggerAlert(rule: AlertRule, metrics: any): boolean {
    // Check if condition is met
    if (!rule.condition(metrics)) {
      return false;
    }

    // Check cooldown period
    const lastAlertTime = this.lastAlertTimes.get(rule.id) || 0;
    const cooldownMs = rule.cooldown * 60 * 1000;
    
    return Date.now() - lastAlertTime > cooldownMs;
  }

  private async triggerAlert(rule: AlertRule, metrics: any): Promise<void> {
    this.lastAlertTimes.set(rule.id, Date.now());

    const message = this.formatAlertMessage(rule, metrics);

    // Send to configured channels
    await Promise.all(
      rule.channels.map(channel => this.sendAlert(channel, message, rule.severity))
    );
  }

  private formatAlertMessage(rule: AlertRule, metrics: any): string {
    return `🚨 Alert: ${rule.name}
    
Severity: ${rule.severity.toUpperCase()}
Time: ${new Date().toISOString()}

Metrics:
- Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%
- Response Time: ${metrics.responseTime}ms
- Memory Usage: ${((metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100).toFixed(2)}%
- Database Size: ${(metrics.databaseSize / 1024 / 1024).toFixed(2)} MB

Dashboard: https://surveys.yourdomain.com/monitoring`;
  }

  private async sendAlert(channel: string, message: string, severity: string): Promise<void> {
    switch (channel) {
      case 'slack':
        await this.sendSlackAlert(message, severity);
        break;
      case 'email':
        await this.sendEmailAlert(message, severity);
        break;
      case 'sms':
        await this.sendSMSAlert(message, severity);
        break;
    }
  }

  private async sendSlackAlert(message: string, severity: string): Promise<void> {
    const color = {
      low: '#36a64f',
      medium: '#ff9500',
      high: '#ff0000',
      critical: '#8b0000',
    }[severity];

    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        attachments: [{
          color,
          fallback: message,
          text: message,
        }],
      }),
    });
  }

  private async sendEmailAlert(message: string, severity: string): Promise<void> {
    // Implement email alerting (SendGrid, SES, etc.)
    console.log('Email alert would be sent:', message);
  }

  private async sendSMSAlert(message: string, severity: string): Promise<void> {
    // Implement SMS alerting (Twilio, etc.)
    console.log('SMS alert would be sent:', message);
  }
}
```

### 5.3 Health Checks and Status Page

**Comprehensive Health Check System**
```typescript
// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  details?: any;
}

interface HealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: HealthCheck[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const healthReport = await performHealthChecks();
  
  const statusCode = healthReport.status === 'healthy' ? 200 : 
                    healthReport.status === 'degraded' ? 200 : 503;
  
  res.status(statusCode).json(healthReport);
}

async function performHealthChecks(): Promise<HealthReport> {
  const checks: HealthCheck[] = [];

  // Database health check
  const dbCheck = await checkDatabase();
  checks.push(dbCheck);

  // External services health check
  const externalChecks = await Promise.all([
    checkSupabaseAuth(),
    checkSupabaseStorage(),
    checkExternalAPIs(),
  ]);
  checks.push(...externalChecks);

  // Determine overall status
  const overallStatus = determineOverallStatus(checks);

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.BUILD_ID || 'unknown',
    checks,
  };
}

async function checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.rpc('health_check');
    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime,
        details: { error: error.message },
      };
    }

    return {
      service: 'database',
      status: responseTime < 1000 ? 'healthy' : 'degraded',
      responseTime,
      details: data,
    };
  } catch (error) {
    return {
      service: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      details: { error: (error as Error).message },
    };
  }
}

async function checkSupabaseAuth(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/health`, {
      timeout: 5000,
    });
    
    const responseTime = Date.now() - startTime;
    
    return {
      service: 'supabase_auth',
      status: response.ok ? 'healthy' : 'degraded',
      responseTime,
      details: { status_code: response.status },
    };
  } catch (error) {
    return {
      service: 'supabase_auth',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      details: { error: (error as Error).message },
    };
  }
}

async function checkSupabaseStorage(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.storage.listBuckets();
    const responseTime = Date.now() - startTime;

    return {
      service: 'supabase_storage',
      status: error ? 'degraded' : 'healthy',
      responseTime,
      details: error ? { error: error.message } : { buckets: data?.length },
    };
  } catch (error) {
    return {
      service: 'supabase_storage',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      details: { error: (error as Error).message },
    };
  }
}

async function checkExternalAPIs(): Promise<HealthCheck> {
  const startTime = Date.now();
  
  try {
    // Check critical external dependencies
    const checks = await Promise.allSettled([
      fetch('https://api.github.com/zen', { timeout: 3000 }),
      // Add other external service checks
    ]);

    const responseTime = Date.now() - startTime;
    const failures = checks.filter(check => check.status === 'rejected').length;
    
    return {
      service: 'external_apis',
      status: failures === 0 ? 'healthy' : failures < checks.length ? 'degraded' : 'unhealthy',
      responseTime,
      details: { total: checks.length, failures },
    };
  } catch (error) {
    return {
      service: 'external_apis',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      details: { error: (error as Error).message },
    };
  }
}

function determineOverallStatus(checks: HealthCheck[]): 'healthy' | 'degraded' | 'unhealthy' {
  const unhealthyCount = checks.filter(check => check.status === 'unhealthy').length;
  const degradedCount = checks.filter(check => check.status === 'degraded').length;

  if (unhealthyCount > 0) {
    return 'unhealthy';
  } else if (degradedCount > 0) {
    return 'degraded';
  } else {
    return 'healthy';
  }
}
```

## 6. Operations and Maintenance

### 6.1 Backup and Recovery Procedures

**Automated Backup Strategy**
```typescript
// scripts/backup.ts
import { createClient } from '@supabase/supabase-js';
import AWS from 'aws-sdk';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

interface BackupConfig {
  type: 'full' | 'incremental';
  retention: number; // days
  compression: boolean;
  encryption: boolean;
}

class BackupManager {
  private supabase: any;
  private s3: AWS.S3;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  async createBackup(config: BackupConfig): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup-${config.type}-${timestamp}`;
    
    console.log(`🔄 Creating ${config.type} backup: ${backupId}`);

    try {
      // 1. Create database backup
      const dbBackup = await this.createDatabaseBackup();
      
      // 2. Create file storage backup
      const storageBackup = await this.createStorageBackup();
      
      // 3. Create configuration backup
      const configBackup = await this.createConfigBackup();
      
      // 4. Combine and compress
      const backupData = {
        metadata: {
          id: backupId,
          type: config.type,
          timestamp: new Date().toISOString(),
          version: process.env.BUILD_ID,
        },
        database: dbBackup,
        storage: storageBackup,
        configuration: configBackup,
      };

      let backupBuffer = Buffer.from(JSON.stringify(backupData));
      
      if (config.compression) {
        backupBuffer = await this.compressData(backupBuffer);
      }
      
      if (config.encryption) {
        backupBuffer = await this.encryptData(backupBuffer);
      }

      // 5. Upload to S3
      const s3Key = `backups/${backupId}.json${config.compression ? '.gz' : ''}${config.encryption ? '.enc' : ''}`;
      
      await this.s3.upload({
        Bucket: process.env.BACKUP_BUCKET!,
        Key: s3Key,
        Body: backupBuffer,
        ServerSideEncryption: 'AES256',
        Metadata: {
          'backup-type': config.type,
          'created-at': timestamp,
          'version': process.env.BUILD_ID || 'unknown',
        },
      }).promise();

      // 6. Clean up old backups
      await this.cleanupOldBackups(config.retention);

      console.log(`✅ Backup created successfully: ${backupId}`);
      return backupId;
    } catch (error) {
      console.error(`❌ Backup failed: ${backupId}`, error);
      throw error;
    }
  }

  private async createDatabaseBackup(): Promise<any> {
    const tables = [
      'surveys',
      'survey_questions',
      'survey_responses',
      'survey_collaborators',
      'profiles',
      'organizations',
    ];

    const backup: any = {};

    for (const table of tables) {
      const { data, error } = await this.supabase
        .from(table)
        .select('*');

      if (error) {
        throw new Error(`Failed to backup table ${table}: ${error.message}`);
      }

      backup[table] = data;
    }

    return backup;
  }

  private async createStorageBackup(): Promise<any> {
    const { data: buckets, error } = await this.supabase.storage.listBuckets();

    if (error) {
      throw new Error(`Failed to list storage buckets: ${error.message}`);
    }

    const backup: any = { buckets: [] };

    for (const bucket of buckets) {
      const { data: files, error: filesError } = await this.supabase.storage
        .from(bucket.name)
        .list('', { limit: 1000 });

      if (!filesError && files) {
        backup.buckets.push({
          name: bucket.name,
          files: files.map(file => ({
            name: file.name,
            size: file.metadata?.size,
            lastModified: file.updated_at,
          })),
        });
      }
    }

    return backup;
  }

  private async createConfigBackup(): Promise<any> {
    return {
      environment: process.env.NODE_ENV,
      version: process.env.BUILD_ID,
      supabaseUrl: process.env.SUPABASE_URL,
      features: {
        analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
        collaboration: process.env.NEXT_PUBLIC_ENABLE_COLLABORATION,
        export: process.env.NEXT_PUBLIC_ENABLE_EXPORT,
      },
    };
  }

  private async compressData(data: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const gzip = createGzip();
      
      gzip.on('data', chunk => chunks.push(chunk));
      gzip.on('end', () => resolve(Buffer.concat(chunks)));
      gzip.on('error', reject);
      
      gzip.end(data);
    });
  }

  private async encryptData(data: Buffer): Promise<Buffer> {
    const crypto = require('crypto');
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const authTag = cipher.getAuthTag();
    
    return Buffer.concat([iv, authTag, encrypted]);
  }

  private async cleanupOldBackups(retentionDays: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const { Contents } = await this.s3.listObjectsV2({
      Bucket: process.env.BACKUP_BUCKET!,
      Prefix: 'backups/',
    }).promise();

    if (!Contents) return;

    const oldBackups = Contents.filter(obj => 
      obj.LastModified && obj.LastModified < cutoffDate
    );

    if (oldBackups.length > 0) {
      await this.s3.deleteObjects({
        Bucket: process.env.BACKUP_BUCKET!,
        Delete: {
          Objects: oldBackups.map(obj => ({ Key: obj.Key! })),
        },
      }).promise();

      console.log(`🗑️ Cleaned up ${oldBackups.length} old backups`);
    }
  }

  async restoreBackup(backupId: string): Promise<void> {
    console.log(`🔄 Restoring backup: ${backupId}`);

    try {
      // 1. Download backup from S3
      const backupData = await this.downloadBackup(backupId);
      
      // 2. Restore database
      await this.restoreDatabase(backupData.database);
      
      // 3. Restore storage
      await this.restoreStorage(backupData.storage);
      
      console.log(`✅ Backup restored successfully: ${backupId}`);
    } catch (error) {
      console.error(`❌ Restore failed: ${backupId}`, error);
      throw error;
    }
  }

  private async downloadBackup(backupId: string): Promise<any> {
    // Implementation for downloading and decrypting backup
    // This would reverse the backup process
    throw new Error('Restore functionality not implemented');
  }

  private async restoreDatabase(databaseBackup: any): Promise<void> {
    // Implementation for restoring database tables
    throw new Error('Database restore not implemented');
  }

  private async restoreStorage(storageBackup: any): Promise<void> {
    // Implementation for restoring storage files
    throw new Error('Storage restore not implemented');
  }
}

// Automated backup schedule
const backupConfig: BackupConfig = {
  type: process.env.BACKUP_TYPE as 'full' | 'incremental' || 'full',
  retention: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
  compression: true,
  encryption: true,
};

const backupManager = new BackupManager();
backupManager.createBackup(backupConfig).catch(console.error);
```

### 6.2 Incident Response Automation

**Incident Response Orchestration**
```typescript
// scripts/incident-response.ts
interface Incident {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'performance' | 'security' | 'availability' | 'data';
  description: string;
  detectedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  assignee?: string;
  escalationLevel: number;
}

class IncidentResponseManager {
  private incidents = new Map<string, Incident>();

  async handleIncident(incident: Incident): Promise<void> {
    this.incidents.set(incident.id, incident);
    
    console.log(`🚨 Incident detected: ${incident.id} (${incident.severity})`);

    // Execute automated response based on severity
    switch (incident.severity) {
      case 'critical':
        await this.handleCriticalIncident(incident);
        break;
      case 'high':
        await this.handleHighSeverityIncident(incident);
        break;
      case 'medium':
        await this.handleMediumSeverityIncident(incident);
        break;
      case 'low':
        await this.handleLowSeverityIncident(incident);
        break;
    }

    // Start escalation timer
    this.scheduleEscalation(incident);
  }

  private async handleCriticalIncident(incident: Incident): Promise<void> {
    // 1. Immediate alerting
    await this.sendImmediateAlert(incident);
    
    // 2. Activate incident response team
    await this.activateIncidentTeam(incident);
    
    // 3. Create incident channel
    await this.createIncidentChannel(incident);
    
    // 4. Execute automated mitigation
    await this.executeAutomatedMitigation(incident);
    
    // 5. Update status page
    await this.updateStatusPage('major_outage', incident.description);
  }

  private async handleHighSeverityIncident(incident: Incident): Promise<void> {
    // 1. Alert on-call team
    await this.alertOnCallTeam(incident);
    
    // 2. Gather diagnostic information
    await this.gatherDiagnostics(incident);
    
    // 3. Update status page
    await this.updateStatusPage('partial_outage', incident.description);
  }

  private async handleMediumSeverityIncident(incident: Incident): Promise<void> {
    // 1. Log incident
    await this.logIncident(incident);
    
    // 2. Alert development team
    await this.alertDevelopmentTeam(incident);
    
    // 3. Update monitoring
    await this.updateMonitoring(incident);
  }

  private async handleLowSeverityIncident(incident: Incident): Promise<void> {
    // 1. Log incident
    await this.logIncident(incident);
    
    // 2. Create issue ticket
    await this.createIssueTicket(incident);
  }

  private async sendImmediateAlert(incident: Incident): Promise<void> {
    const message = `🚨 CRITICAL INCIDENT 🚨
    
ID: ${incident.id}
Type: ${incident.type}
Description: ${incident.description}
Detected: ${incident.detectedAt.toISOString()}

Action Required: Immediate response needed`;

    // Send to multiple channels
    await Promise.all([
      this.sendSlackAlert(message, 'critical'),
      this.sendEmailAlert(message, 'critical'),
      this.sendSMSAlert(message, 'critical'),
    ]);
  }

  private async activateIncidentTeam(incident: Incident): Promise<void> {
    const team = [
      { role: 'incident_commander', contact: 'ic@company.com' },
      { role: 'technical_lead', contact: 'tech-lead@company.com' },
      { role: 'communications_lead', contact: 'comms@company.com' },
    ];

    for (const member of team) {
      await this.notifyTeamMember(member, incident);
    }
  }

  private async createIncidentChannel(incident: Incident): Promise<void> {
    // Create Slack channel for incident coordination
    const channelName = `incident-${incident.id}`;
    
    await fetch('https://slack.com/api/conversations.create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: channelName,
        is_private: false,
      }),
    });
  }

  private async executeAutomatedMitigation(incident: Incident): Promise<void> {
    switch (incident.type) {
      case 'performance':
        await this.mitigatePerformanceIncident(incident);
        break;
      case 'availability':
        await this.mitigateAvailabilityIncident(incident);
        break;
      case 'security':
        await this.mitigateSecurityIncident(incident);
        break;
    }
  }

  private async mitigatePerformanceIncident(incident: Incident): Promise<void> {
    // 1. Scale up resources
    await this.scaleResources('up');
    
    // 2. Enable aggressive caching
    await this.enableAggressiveCaching();
    
    // 3. Rate limit non-essential endpoints
    await this.enableRateLimiting();
  }

  private async mitigateAvailabilityIncident(incident: Incident): Promise<void> {
    // 1. Check and restart services
    await this.restartServices();
    
    // 2. Failover to backup region
    await this.failoverToBackup();
    
    // 3. Enable maintenance mode if necessary
    await this.enableMaintenanceMode();
  }

  private async mitigateSecurityIncident(incident: Incident): Promise<void> {
    // 1. Block suspicious IPs
    await this.blockSuspiciousIPs();
    
    // 2. Rotate secrets
    await this.rotateSecrets();
    
    // 3. Enable enhanced monitoring
    await this.enableEnhancedMonitoring();
  }

  private async updateStatusPage(status: string, message: string): Promise<void> {
    // Update status page (StatusPage.io, custom status page, etc.)
    console.log(`📢 Status page updated: ${status} - ${message}`);
  }

  private scheduleEscalation(incident: Incident): void {
    const escalationTimes = {
      critical: 5,  // 5 minutes
      high: 15,     // 15 minutes
      medium: 60,   // 1 hour
      low: 240,     // 4 hours
    };

    const escalationTime = escalationTimes[incident.severity] * 60 * 1000;

    setTimeout(async () => {
      if (!incident.acknowledgedAt) {
        await this.escalateIncident(incident);
      }
    }, escalationTime);
  }

  private async escalateIncident(incident: Incident): Promise<void> {
    incident.escalationLevel += 1;
    
    console.log(`⬆️ Escalating incident ${incident.id} to level ${incident.escalationLevel}`);
    
    // Notify management or additional team members
    await this.notifyEscalationTeam(incident);
  }

  // Additional helper methods...
  private async sendSlackAlert(message: string, severity: string): Promise<void> {
    // Implementation for Slack alerts
  }

  private async sendEmailAlert(message: string, severity: string): Promise<void> {
    // Implementation for email alerts
  }

  private async sendSMSAlert(message: string, severity: string): Promise<void> {
    // Implementation for SMS alerts
  }

  private async notifyTeamMember(member: any, incident: Incident): Promise<void> {
    // Implementation for team member notification
  }

  private async scaleResources(direction: 'up' | 'down'): Promise<void> {
    // Implementation for resource scaling
  }

  private async enableAggressiveCaching(): Promise<void> {
    // Implementation for aggressive caching
  }

  private async enableRateLimiting(): Promise<void> {
    // Implementation for rate limiting
  }

  private async restartServices(): Promise<void> {
    // Implementation for service restart
  }

  private async failoverToBackup(): Promise<void> {
    // Implementation for failover
  }

  private async enableMaintenanceMode(): Promise<void> {
    // Implementation for maintenance mode
  }

  private async blockSuspiciousIPs(): Promise<void> {
    // Implementation for IP blocking
  }

  private async rotateSecrets(): Promise<void> {
    // Implementation for secret rotation
  }

  private async enableEnhancedMonitoring(): Promise<void> {
    // Implementation for enhanced monitoring
  }

  private async alertOnCallTeam(incident: Incident): Promise<void> {
    // Implementation for on-call alerts
  }

  private async gatherDiagnostics(incident: Incident): Promise<void> {
    // Implementation for diagnostic gathering
  }

  private async logIncident(incident: Incident): Promise<void> {
    // Implementation for incident logging
  }

  private async alertDevelopmentTeam(incident: Incident): Promise<void> {
    // Implementation for development team alerts
  }

  private async updateMonitoring(incident: Incident): Promise<void> {
    // Implementation for monitoring updates
  }

  private async createIssueTicket(incident: Incident): Promise<void> {
    // Implementation for issue ticket creation
  }

  private async notifyEscalationTeam(incident: Incident): Promise<void> {
    // Implementation for escalation team notification
  }
}
```

## Implementation Timeline

### Phase 1: Foundation Setup (Weeks 1-2)
- Basic CI/CD pipeline implementation
- Environment configuration and secret management
- Health checks and basic monitoring
- Vercel and Supabase integration

### Phase 2: Advanced Automation (Weeks 3-6)
- Comprehensive testing integration
- Database migration automation
- Zero-downtime deployment strategy
- Performance monitoring setup

### Phase 3: Operational Excellence (Weeks 7-10)
- Advanced monitoring and alerting
- Backup and recovery automation
- Incident response procedures
- Security scanning integration

### Phase 4: Optimization and Scaling (Weeks 11-12)
- Performance optimization
- Auto-scaling implementation
- Advanced observability features
- Documentation and training

This comprehensive DevOps and CI/CD strategy ensures the Survey Web Application is deployed, monitored, and maintained with enterprise-grade reliability and operational excellence.