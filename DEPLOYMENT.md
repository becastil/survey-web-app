# Healthcare Survey Dashboard - Deployment Guide

## Quick Start (Demo Mode)

The application is configured to run in **demo mode** by default, requiring no backend services.

### Deploy to Vercel (Recommended)

1. Fork/clone this repository
2. Connect to Vercel via GitHub
3. Deploy with default settings - no configuration needed!
4. Visit your deployment URL

The app will automatically run in demo mode with mock data.

### Local Development

```bash
# Clone repository
git clone [repo_url]
cd survey-web-app

# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

## Environment Variables

### Demo Mode (Required for Demo Deployment)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_USE_MOCK_DATA` | Enable demo mode with mock data | Yes | `true` |
| `NEXT_PUBLIC_APP_NAME` | Application display name | Yes | `Healthcare Survey Dashboard` |
| `NEXT_PUBLIC_APP_URL` | Public URL (use `$VERCEL_URL` on Vercel) | Yes | - |

### Production Mode - Supabase (Optional)

Only needed when `NEXT_PUBLIC_USE_MOCK_DATA=false`:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes (prod) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes (prod) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Backend only |

### Future - Archon KB Integration (Optional)

These are placeholders for future AI features (prefixed with `DUMMY_` in vercel.json):

| Variable | Description | Status |
|----------|-------------|--------|
| `NEXT_PUBLIC_ARCHON_API_URL` | Archon KB API endpoint | Future |
| `NEXT_PUBLIC_ARCHON_WS_URL` | Archon WebSocket endpoint | Future |
| `ARCHON_API_KEY` | Archon API key | Future |

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

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs)