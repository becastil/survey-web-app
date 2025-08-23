# Cloudflare Pages Deployment Guide

## Project Configuration

This project is configured for deployment on Cloudflare Pages with the following settings:

### Account Information
- **Email**: bencastillo14@yahoo.com
- **Repository**: becastil/survey-web-app
- **Project Name**: survey-web-app

### Build Settings
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Build Output Directory**: `.next`
- **Node Version**: 18

### Supabase Configuration
- **Project URL**: https://lrhqxbqbyalosgqjobxf.supabase.co

## Deployment Steps

### Step 1: Connect GitHub Repository

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
2. Click "Create a project" → "Connect to Git"
3. Select GitHub and authorize Cloudflare
4. Choose repository: `becastil/survey-web-app`

### Step 2: Configure Build Settings

In the Cloudflare Pages setup, use these settings:

- **Framework preset**: Next.js
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `/` (leave empty)
- **Node.js version**: 18

### Step 3: Set Environment Variables

In the Cloudflare Pages dashboard, add these environment variables:

#### Required Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://lrhqxbqbyalosgqjobxf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Your Supabase Anon Key]
SKIP_ENV_VALIDATION=true
NEXT_PUBLIC_USE_MOCK_DATA=true
NODE_OPTIONS=--max-old-space-size=4096
```

#### Optional Variables (for production):
```
NEXT_PUBLIC_APP_NAME=Healthcare Survey Dashboard
NEXT_PUBLIC_APP_URL=[Your Cloudflare Pages URL]
```

### Step 4: Deploy

1. Click "Save and Deploy"
2. Wait for the initial build to complete (3-5 minutes)
3. Your app will be available at: `https://survey-web-app.pages.dev`

## Local Testing

To test the Cloudflare build locally:

```bash
# Install dependencies
npm install --legacy-peer-deps

# Test the build
npm run build

# Or use the Cloudflare-specific build
npm run build:cloudflare
```

## Continuous Deployment

After initial setup, any push to the `main` branch will automatically trigger a new deployment.

### Branch Deployments

Cloudflare Pages also creates preview deployments for pull requests:
- Preview URLs: `https://[branch-name].survey-web-app.pages.dev`

## Troubleshooting

### Build Failures

If the build fails, check:

1. **Node Version**: Ensure Node 18 is specified
2. **Environment Variables**: Verify all required vars are set
3. **Build Command**: Use `SKIP_ENV_VALIDATION=true next build`
4. **Memory**: The `NODE_OPTIONS=--max-old-space-size=4096` should be set

### Common Issues

1. **Module not found errors**:
   - Solution: Use `npm install --legacy-peer-deps`

2. **Environment validation errors**:
   - Solution: Ensure `SKIP_ENV_VALIDATION=true` is set

3. **Build timeout**:
   - Solution: Optimize build or increase memory allocation

## Production Checklist

Before going to production:

- [ ] Set `NEXT_PUBLIC_USE_MOCK_DATA=false`
- [ ] Configure real Supabase credentials
- [ ] Set up custom domain (if needed)
- [ ] Configure caching rules
- [ ] Set up monitoring/analytics
- [ ] Review security headers

## Custom Domain Setup

To add a custom domain:

1. Go to your Pages project → Custom domains
2. Add your domain
3. Update DNS records as instructed
4. Enable SSL/TLS

## Support

For issues specific to:
- **Cloudflare Pages**: [Cloudflare Support](https://community.cloudflare.com/)
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)
- **Application**: Check the main README.md