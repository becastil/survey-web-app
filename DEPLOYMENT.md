# Healthcare Survey Dashboard - Deployment Guide

## Table of Contents
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Deployment Strategies](#deployment-strategies)
- [CI/CD Pipeline](#cicd-pipeline)
- [Team Collaboration](#team-collaboration)
- [Testing](#testing)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Quick Start

The application is configured to run in **demo mode** by default, requiring no backend services.

### Prerequisites
- Node.js 18+ and npm 9+
- Git
- GitHub account
- Vercel account (for deployment)
- Supabase account (for database, optional)
- Redis instance (optional, for scaling)

### Initial Setup (< 5 minutes)
```bash
# Clone repository
git clone https://github.com/your-org/survey-web-app.git
cd survey-web-app

# Install dependencies
npm install --legacy-peer-deps

# Copy environment variables (if .env.example exists)
cp .env.example .env.local 2>/dev/null || echo "No .env.example found, using defaults"

# Start development server
npm run dev
```

Access the application at `http://localhost:1994`

### Deploy to Vercel (Recommended)

1. Fork/clone this repository
2. Connect to Vercel via GitHub
3. Deploy with default settings - no configuration needed!
4. Visit your deployment URL

The app will automatically run in demo mode with mock data.

## Environment Setup

### 1. Environment Variables

Create `.env.local` with the following variables:

```bash
# Application
NEXT_PUBLIC_APP_NAME="Healthcare Survey Dashboard"
NEXT_PUBLIC_APP_URL="http://localhost:1994"
NODE_ENV="development"

# Demo Mode (Set to true for demo, false for production)
NEXT_PUBLIC_USE_MOCK_DATA="true"

# Database (Supabase) - Only needed when USE_MOCK_DATA=false
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-key"

# Real-time (Socket.IO) - Optional
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
SOCKET_AUTH_SECRET="your-socket-secret"

# Redis - Optional for scaling
REDIS_URL="redis://localhost:6379"

# Authentication - Optional
NEXTAUTH_URL="http://localhost:1994"
NEXTAUTH_SECRET="your-nextauth-secret"

# AI/Analytics - Optional
OPENAI_API_KEY="your-openai-key"
ARCHON_API_KEY="your-archon-key"
NEXT_PUBLIC_ARCHON_API_URL="http://localhost:8000/api"
NEXT_PUBLIC_ARCHON_WS_URL="ws://localhost:8000/ws"

# Monitoring - Optional
SENTRY_DSN="your-sentry-dsn"
SENTRY_AUTH_TOKEN="your-sentry-token"
```

### 2. Database Setup (Supabase - Optional)

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection strings

#### Run Database Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

#### Database Schema
```sql
-- Core tables
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id),
  user_id UUID,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_responses_survey_id ON responses(survey_id);
CREATE INDEX idx_responses_created_at ON responses(created_at);
```

### 3. Redis Setup (Optional - for Socket.IO scaling)

```bash
# Using Docker
docker run -d --name redis -p 6379:6379 redis:alpine

# Or using Redis Cloud
# 1. Sign up at redis.com
# 2. Create database
# 3. Copy connection string
```

## Vercel Configuration

### Build Settings

- **Framework Preset:** Next.js
- **Build Command:** `next build --no-lint`
- **Install Command:** `npm install --legacy-peer-deps`
- **Root Directory:** (leave empty - project is at repo root)
- **Node.js Version:** 18.x or 20.x

### vercel.json Configuration

The project includes a `vercel.json` file with optimized settings:

```json
{
  "framework": "nextjs",
  "installCommand": "npm install --legacy-peer-deps",
  "buildCommand": "next build --no-lint",
  "env": {
    "NEXT_PUBLIC_USE_MOCK_DATA": "true",
    // ... other env vars
  },
  "build": {
    "env": {
      "NODE_OPTIONS": "--max-old-space-size=4096",
      "SKIP_ENV_VALIDATION": "1"
    }
  }
}
```

## Demo Runbook

### Flow 1: Survey Response
1. Navigate to **Dashboard** - View summary metrics
2. Click **Surveys** in sidebar
3. Select any survey from the list
4. Click **Respond** button
5. Fill out survey questions
6. Submit responses
7. View confirmation

### Flow 2: Survey Management
1. Go to **Surveys** page
2. Click **Create Survey** or edit existing
3. Add/modify questions
4. Configure survey settings
5. Save changes
6. Preview survey

### Flow 3: Analytics
1. Click **Analytics** in sidebar
2. View response trends
3. Explore demographic breakdowns
4. Check completion rates
5. Export data (if needed)

### Flow 4: KB-Powered Features (Demo)
1. Navigate to **Analytics > KB-Powered**
2. View AI-generated insights
3. Check anomaly detection
4. Interact with insight panel

## Troubleshooting Matrix

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| **Build fails: module not found** | Missing npm dependency or local file | Run `npm install --legacy-peer-deps`, check if file exists |
| **Build fails: env var missing** | Not set in Vercel project settings | Add in Vercel → Settings → Environment Variables |
| **App loads blank page** | SSR/hydration mismatch | Check browser console, ensure env vars match |
| **CORS/auth errors (prod)** | Wrong Supabase configuration | Verify Supabase keys and URL |
| **Stale assets/cache issues** | Vercel build cache | Trigger "Redeploy" with cache cleared |
| **Charts not rendering** | Missing chart library | Ensure recharts is installed |
| **Animations not working** | Missing framer-motion | Ensure framer-motion is installed |
| **"Window is not defined"** | SSR incompatibility | Wrap component with dynamic import |
| **Types error in build** | TypeScript strict mode | Run `npm run typecheck` locally |

## Build Verification

### Pre-deployment Checklist

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Run linting
npm run lint

# 3. Type checking
npm run typecheck

# 4. Build test
npm run build

# 5. Start production server
npm start
```

### Post-deployment Verification

1. **Check build logs** in Vercel dashboard
2. **Visit deployment URL** and verify home page loads
3. **Test critical paths:**
   - Survey list loads
   - Can open survey response form
   - Analytics page renders
   - Navigation works
4. **Check browser console** for errors
5. **Verify responsive design** on mobile

## Production Deployment

### Switching from Demo to Production

1. **Set up Supabase:**
   ```bash
   # Create Supabase project at supabase.com
   # Get your project URL and keys
   ```

2. **Update environment variables:**
   ```env
   NEXT_PUBLIC_USE_MOCK_DATA=false
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ```

3. **Run database migrations:**
   ```bash
   # Use Supabase CLI or dashboard to run migrations
   supabase db push
   ```

4. **Deploy to Vercel:**
   - Update environment variables in Vercel dashboard
   - Trigger new deployment

### Security Considerations

- Never commit real API keys to repository
- Use environment variables for all secrets
- Enable RLS (Row Level Security) in Supabase
- Review CORS settings for production
- Implement rate limiting for API routes
- Use HTTPS for all production deployments

## Performance Optimization

### Build Optimization
- Uses `--no-lint` flag to speed up builds
- Increased Node memory limit to 4GB
- Implements code splitting automatically via Next.js

### Runtime Optimization
- Mock data loads instantly (no API calls)
- Lazy loading for heavy components
- Image optimization via Next.js Image component
- Caching strategies for static content

## Monitoring

### Recommended Services (Optional)
- **Vercel Analytics** - Built-in performance monitoring
- **Sentry** - Error tracking (add `SENTRY_DSN` env var)
- **LogRocket** - Session replay
- **Datadog** - APM and logging

## FAQ

### Q: Why use `--legacy-peer-deps`?
A: Ensures compatibility with all dependencies, especially when mixing different React versions.

### Q: Can I use npm instead of yarn?
A: Yes, the project is configured for npm. Use `npm install --legacy-peer-deps`.

### Q: How do I add custom environment variables?
A: Add to `.env.local` locally, and Vercel dashboard for deployments.

### Q: Why is the build failing on Vercel but not locally?
A: Check that all environment variables are set in Vercel, and no files are gitignored that shouldn't be.

### Q: How do I enable real backend features?
A: Set `NEXT_PUBLIC_USE_MOCK_DATA=false` and configure Supabase credentials.

## Support

For issues or questions:
1. Check this troubleshooting guide
2. Review build logs in Vercel dashboard
3. Open an issue on GitHub with:
   - Error messages
   - Build logs
   - Environment details

## Local Development

### Development Server Setup

#### 1. Standard Development
```bash
# Start Next.js dev server (port 1994)
npm run dev
```

#### 2. With Socket.IO Server (Optional)
```bash
# Terminal 1: Next.js
npm run dev

# Terminal 2: Socket.IO server
npm run dev:socket
```

#### 3. With Docker Compose (Optional)
```bash
# Create docker-compose.yml (see below)
docker-compose up

# Services:
# - App: http://localhost:1994
# - Socket.IO: http://localhost:3000
# - Redis: redis://localhost:6379
```

### Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "1994:1994"
    environment:
      - NODE_ENV=development
    env_file:
      - .env.local
    volumes:
      - .:/app
      - /app/node_modules

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

### Development Workflow

#### Branch Strategy
```bash
# Feature development
git checkout -b feature/your-feature

# Bug fixes
git checkout -b fix/issue-description

# Hotfixes
git checkout -b hotfix/critical-fix
```

#### Pre-commit Checks
```bash
# Run before committing
npm run lint
npm run typecheck

# Build test
npm run build
```

## Deployment Strategies

### 1. Vercel Deployment (Recommended)

#### Initial Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Automatic Deployments
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. Set environment variables in Vercel dashboard
4. Enable automatic deployments for branches

### 2. Docker Deployment

#### Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

#### Build and Deploy
```bash
# Build image
docker build -t healthcare-survey:latest .

# Run container
docker run -p 3000:3000 --env-file .env.production healthcare-survey:latest
```

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci --legacy-peer-deps
      
      - name: Run tests
        run: |
          npm run lint
          npm run typecheck
      
      - name: Build application
        run: npm run build
        env:
          SKIP_ENV_VALIDATION: '1'

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Team Collaboration

### 1. Development Standards

#### Code Style Guide
```typescript
// Use TypeScript for all new code
interface HealthcareSurvey {
  id: string;
  title: string;
  responses: Response[];
}

// Use functional components with hooks
export function SurveyComponent({ survey }: { survey: HealthcareSurvey }) {
  const [state, setState] = useState<State>();
  
  // Component logic
  return <div>{/* JSX */}</div>;
}

// Use proper error handling
try {
  const data = await fetchSurveyData();
  return processData(data);
} catch (error) {
  console.error('Survey fetch failed:', error);
  throw new Error('Failed to load survey');
}
```

#### Git Commit Convention
```bash
# Format: <type>(<scope>): <subject>

# Types:
# - feat: New feature
# - fix: Bug fix
# - docs: Documentation
# - style: Formatting
# - refactor: Code restructuring
# - test: Adding tests
# - chore: Maintenance

# Examples:
git commit -m "feat(charts): add regional heatmap visualization"
git commit -m "fix(upload): handle large CSV files correctly"
git commit -m "docs(api): update authentication documentation"
```

### 2. Review Process

#### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No sensitive data exposed
```

### 3. Environment Management

#### Branch Environments
```yaml
# Automatic preview deployments
main → production.healthcare-survey.com
staging → staging.healthcare-survey.com
feature/* → preview-*.healthcare-survey.com
```

## Testing

### 1. Unit Testing

```javascript
// __tests__/components/HealthcareDashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { HealthcareDashboard } from '@/components/healthcare/HealthcareDashboard';

describe('HealthcareDashboard', () => {
  it('renders upload zone initially', () => {
    render(<HealthcareDashboard />);
    expect(screen.getByText(/Upload Healthcare Survey Data/i)).toBeInTheDocument();
  });
});
```

### 2. E2E Testing (Optional)

```javascript
// cypress/e2e/healthcare-dashboard.cy.ts
describe('Healthcare Dashboard E2E', () => {
  beforeEach(() => {
    cy.visit('/dashboard');
  });

  it('uploads and visualizes healthcare data', () => {
    // Upload file
    cy.get('[data-cy=upload-zone]').attachFile('healthcare-data.csv');
    
    // Verify charts
    cy.get('[data-cy=regional-chart]').should('be.visible');
    cy.get('[data-cy=plan-chart]').should('be.visible');
  });
});
```

## Production Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No console.log statements
- [ ] Environment variables configured
- [ ] API endpoints secured
- [ ] Error tracking setup (optional)

### Post-Deployment
- [ ] Verify all pages load
- [ ] Test critical user flows
- [ ] Check data visualizations
- [ ] Confirm mobile responsiveness

### Security
- [ ] HTTPS enabled
- [ ] Input validation active
- [ ] Authentication working (if enabled)
- [ ] Sensitive data encrypted
- [ ] Rate limiting active (if implemented)

## Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                 # Build for production
npm run start                 # Start production server

# Testing
npm run lint                 # Lint code
npm run typecheck            # TypeScript check

# Deployment
vercel                       # Deploy to preview
vercel --prod               # Deploy to production
vercel logs                 # View deployment logs
vercel env pull             # Pull env variables

# Docker (Optional)
docker-compose up           # Start all services
docker-compose down         # Stop all services
docker-compose logs -f      # View logs
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs)
- [Plotly.js Documentation](https://plotly.com/javascript/)
- [Framer Motion](https://www.framer.com/motion/)

---

Last Updated: 2025-08-22
Version: 2.0.0