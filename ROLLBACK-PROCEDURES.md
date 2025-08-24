# 🔄 Rollback Procedures - Survey Web App

## Overview
This document provides comprehensive rollback procedures for both Vercel migration and Cloudflare static refactoring scenarios. Follow these procedures if deployment fails or critical issues are discovered post-deployment.

---

## 🚨 Emergency Rollback Decision Tree

```
Deployment Failed?
├── Yes
│   ├── Build Error? → Use Procedure A
│   ├── Runtime Error? → Use Procedure B
│   └── Performance Issue? → Use Procedure C
└── No
    └── Monitor for 24 hours → Use Procedure D if issues arise
```

---

## Scenario 1: Vercel Migration Rollback

### Procedure A: Build Failure Rollback

**Symptoms:**
- Build fails on Vercel
- Type errors during compilation
- Missing dependencies

**Rollback Steps:**
```bash
# 1. Revert to previous deployment (Vercel Dashboard)
vercel rollback [deployment-id]

# 2. Fix locally
git checkout main
git pull origin main

# 3. Restore working configuration
git checkout 8162acf -- next.config.ts
git checkout 8162acf -- package.json

# 4. Test locally
npm install --legacy-peer-deps
npm run build
npm run start

# 5. Redeploy when fixed
vercel --prod
```

**Time to Recovery:** 15-30 minutes

### Procedure B: Runtime Failure Rollback

**Symptoms:**
- 500 errors in production
- API routes not responding
- Database connection failures

**Immediate Actions:**
```bash
# 1. Rollback via Vercel CLI (instant)
vercel rollback --prod

# 2. Or via Dashboard
# Go to: https://vercel.com/[team]/[project]/deployments
# Click "..." menu on last working deployment
# Select "Promote to Production"
```

**Investigation Steps:**
```bash
# Check logs
vercel logs --prod --since 1h

# Check environment variables
vercel env ls production

# Test API endpoints
curl https://your-app.vercel.app/api/health
```

**Time to Recovery:** 2-5 minutes

### Procedure C: Performance Degradation Rollback

**Symptoms:**
- Slow page loads (>3s)
- High memory usage
- Timeout errors

**Rollback Steps:**
```bash
# 1. Enable maintenance mode (optional)
vercel env add NEXT_PUBLIC_MAINTENANCE_MODE true --production

# 2. Rollback to last stable version
vercel rollback --prod

# 3. Analyze performance
# Use Vercel Analytics Dashboard
# Check function logs for bottlenecks

# 4. Optimize and redeploy
```

**Time to Recovery:** 10-15 minutes

---

## Scenario 2: Cloudflare Static Refactor Rollback

### Procedure D: Complete Architecture Rollback

**Symptoms:**
- Static export not working
- Client-side routing broken
- API integration failures

**Full Rollback Steps:**
```bash
# 1. Stop current deployment
# Go to Cloudflare Pages Dashboard
# Settings → Deployments → Cancel active deployment

# 2. Restore from backup branch
git checkout backup-before-static-refactor
git checkout -b emergency-rollback

# 3. Remove static refactor changes
rm -rf survey-api-workers
rm next.config.js
git checkout main -- next.config.ts
mv middleware.ts.backup middleware.ts

# 4. Force push to trigger rebuild
git add .
git commit -m "emergency: Rollback static refactor"
git push --force origin main

# 5. Switch to Vercel (recommended)
npm install -g vercel
vercel --prod
```

**Time to Recovery:** 30-45 minutes

### Procedure E: Partial Rollback (Keep Workers API)

**Symptoms:**
- Frontend issues only
- Workers API functioning correctly

**Steps:**
```bash
# 1. Keep Workers API running
# (No action needed)

# 2. Restore SSR frontend
git checkout backup-before-static-refactor -- .
git reset HEAD survey-api-workers
rm -rf out

# 3. Update environment to use Workers API
echo "NEXT_PUBLIC_API_URL=https://survey-api.workers.dev" >> .env.local

# 4. Deploy to Vercel instead
vercel --prod
```

**Time to Recovery:** 20-30 minutes

---

## 🔄 Git-Based Rollback Procedures

### Quick Rollback to Last Known Good State

```bash
# Find last working commit
git log --oneline -10

# Create rollback branch
git checkout -b rollback-$(date +%Y%m%d-%H%M%S)

# Reset to working commit
git reset --hard 8162acf  # Replace with your commit

# Force push (careful!)
git push --force origin main
```

### Safe Rollback with Revert

```bash
# Revert last commit
git revert HEAD

# Revert multiple commits
git revert HEAD~3..HEAD

# Push revert commits
git push origin main
```

---

## 📊 Database Rollback Procedures

### Supabase Data Rollback

**If migrations caused issues:**

```sql
-- Connect to Supabase SQL Editor

-- 1. Check current schema
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. Restore from backup (if available)
-- Go to: Settings → Backups → Restore

-- 3. Or manually rollback migration
DROP TABLE IF EXISTS [new_tables];
ALTER TABLE [table] DROP COLUMN [new_columns];

-- 4. Verify data integrity
SELECT COUNT(*) FROM surveys;
SELECT COUNT(*) FROM responses;
```

---

## 🛡️ DNS Rollback Procedures

### Cloudflare to Vercel DNS Switch

```bash
# 1. Get Vercel IP
nslookup your-app.vercel.app
# Result: 76.76.21.21

# 2. Update Cloudflare DNS
# Dashboard → DNS → Edit A record
# Change to: 76.76.21.21

# 3. Clear Cloudflare cache
# Dashboard → Caching → Configuration → Purge Everything
```

### Emergency DNS Failover

```bash
# Use Cloudflare Page Rules for instant redirect
# Dashboard → Rules → Page Rules
# Create rule: yourdomain.com/*
# Forward URL: 301 to https://your-app.vercel.app/$1
```

---

## 📝 Rollback Checklist

### Pre-Rollback Checks
- [ ] Backup current state
- [ ] Document issue symptoms
- [ ] Notify team/stakeholders
- [ ] Enable maintenance mode (if available)

### During Rollback
- [ ] Execute rollback procedure
- [ ] Monitor logs in real-time
- [ ] Test critical paths
- [ ] Verify data integrity

### Post-Rollback
- [ ] Confirm system stability
- [ ] Document root cause
- [ ] Create incident report
- [ ] Plan permanent fix
- [ ] Update runbooks

---

## 🚦 Monitoring Commands

### Vercel Monitoring
```bash
# Check deployment status
vercel list

# View logs
vercel logs --prod --follow

# Check domains
vercel domains ls

# Inspect environment
vercel env ls production
```

### Cloudflare Monitoring
```bash
# Check Pages deployment
wrangler pages deployment list

# View Workers logs
wrangler tail survey-api

# Check DNS
dig yourdomain.com
```

---

## 📞 Emergency Contacts

### Platform Support
- **Vercel Support**: support@vercel.com
- **Cloudflare Support**: https://dash.cloudflare.com/support
- **Supabase Support**: support@supabase.io

### Escalation Path
1. Try rollback procedures
2. Check platform status pages
3. Contact platform support
4. Post in community forums/Discord

---

## 🎯 Recovery Time Objectives (RTO)

| Scenario | Target RTO | Actual RTO |
|----------|------------|------------|
| **Vercel Runtime Error** | 5 min | 2-5 min |
| **Vercel Build Error** | 30 min | 15-30 min |
| **Cloudflare Static Rollback** | 45 min | 30-45 min |
| **Complete Platform Migration** | 2 hours | 1-2 hours |
| **Database Restoration** | 1 hour | 30-60 min |

---

## 📚 Lessons Learned Log

### Common Issues & Solutions

1. **Issue**: Module not found errors
   **Solution**: Clear node_modules and reinstall with --legacy-peer-deps

2. **Issue**: Environment variables not loading
   **Solution**: Verify in platform dashboard, not just .env files

3. **Issue**: CORS errors after migration
   **Solution**: Update allowed origins in API configuration

4. **Issue**: Static export missing dynamic routes
   **Solution**: Implement client-side routing or use generateStaticParams

---

## 🔐 Rollback Authorization

### Who Can Execute Rollback?
- **Level 1** (Immediate): DevOps, Senior Developers
- **Level 2** (Approved): Junior Developers with approval
- **Level 3** (Emergency): On-call engineer

### Approval Not Required When:
- Production is completely down
- Data loss is occurring
- Security breach detected
- User-facing errors >50%

---

## 📋 Post-Mortem Template

```markdown
## Incident Post-Mortem

**Date**: [Date]
**Duration**: [Start] - [End]
**Impact**: [Users affected]
**Severity**: [Critical/High/Medium/Low]

### Summary
[What happened]

### Timeline
- [Time]: Event occurred
- [Time]: Detection
- [Time]: Rollback initiated
- [Time]: Service restored

### Root Cause
[Technical explanation]

### Resolution
[Steps taken]

### Action Items
- [ ] [Preventive measure 1]
- [ ] [Preventive measure 2]

### Lessons Learned
[Key takeaways]
```

---

## ✅ Final Notes

- **Always test rollback procedures in staging first**
- **Keep backup branches for at least 30 days**
- **Document every rollback executed**
- **Review and update procedures quarterly**
- **Practice rollback drills monthly**

**Remember**: A successful rollback is better than a prolonged outage. Don't hesitate to rollback when issues arise.

---

*Last Updated: [Current Date]*
*Version: 1.0*