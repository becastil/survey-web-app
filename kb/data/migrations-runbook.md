# Database Migrations Runbook

## Overview

This runbook provides step-by-step procedures for managing database migrations in the Healthcare Survey Dashboard. All migrations must be tested in development and staging before production deployment.

## Migration Strategy

### Principles

1. **Forward-Only**: Migrations should be forward-compatible
2. **Reversible**: Include rollback scripts for emergencies
3. **Atomic**: Each migration is a complete, testable unit
4. **Zero-Downtime**: Use expand-contract pattern for schema changes
5. **Versioned**: Sequential numbering with descriptive names

### File Structure

```
supabase/migrations/
├── 001_initial_schema.sql
├── 002_add_survey_shares.sql
├── 003_add_analytics_views.sql
├── 004_add_performance_indexes.sql
└── seed.sql
```

## Creating Migrations

### 1. Generate Migration File

```bash
# Using Supabase CLI
supabase migration new add_feature_name

# Manual creation
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_add_feature_name.sql
```

### 2. Migration Template

```sql
-- Migration: add_feature_name
-- Author: Developer Name
-- Date: 2025-08-20
-- Description: Add support for survey templates

-- ============================================
-- UP MIGRATION
-- ============================================

BEGIN;

-- Add new table
CREATE TABLE IF NOT EXISTS survey_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    template_data JSONB NOT NULL,
    category VARCHAR(50),
    is_public BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_survey_templates_created_by ON survey_templates(created_by);
CREATE INDEX idx_survey_templates_category ON survey_templates(category);
CREATE INDEX idx_survey_templates_public ON survey_templates(is_public) WHERE is_public = true;

-- Add RLS policies
ALTER TABLE survey_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
ON survey_templates FOR SELECT
USING (created_by = get_user_profile_id() OR is_public = true);

CREATE POLICY "Users can create templates"
ON survey_templates FOR INSERT
WITH CHECK (created_by = get_user_profile_id());

-- Add trigger
CREATE TRIGGER update_survey_templates_updated_at
    BEFORE UPDATE ON survey_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Migrate existing data (if needed)
-- INSERT INTO survey_templates (...)
-- SELECT ... FROM existing_table;

COMMIT;

-- ============================================
-- DOWN MIGRATION (Rollback)
-- ============================================
-- BEGIN;
-- DROP TABLE IF EXISTS survey_templates CASCADE;
-- COMMIT;
```

### 3. Testing Migration

```bash
# Test locally
supabase db reset
supabase migration up

# Verify migration
psql $DATABASE_URL -c "\dt survey_templates"
psql $DATABASE_URL -c "SELECT * FROM survey_templates LIMIT 1;"
```

## Common Migration Patterns

### Adding a Column (Zero-Downtime)

```sql
-- Step 1: Add nullable column
ALTER TABLE surveys 
ADD COLUMN template_id UUID REFERENCES survey_templates(id);

-- Step 2: Backfill data (in batches for large tables)
UPDATE surveys 
SET template_id = (
    SELECT id FROM survey_templates 
    WHERE category = 'default' 
    LIMIT 1
)
WHERE template_id IS NULL
AND id IN (
    SELECT id FROM surveys 
    WHERE template_id IS NULL 
    LIMIT 1000
);

-- Step 3: Add constraint after backfill (separate migration)
ALTER TABLE surveys 
ALTER COLUMN template_id SET NOT NULL;
```

### Renaming a Column (Zero-Downtime)

```sql
-- Step 1: Add new column
ALTER TABLE surveys ADD COLUMN survey_template_id UUID;

-- Step 2: Copy data
UPDATE surveys SET survey_template_id = template_id;

-- Step 3: Update application to use new column

-- Step 4: Drop old column (separate migration after deployment)
ALTER TABLE surveys DROP COLUMN template_id;
```

### Adding an Index (Online)

```sql
-- Create index concurrently to avoid locking
CREATE INDEX CONCURRENTLY idx_responses_created_at 
ON responses(created_at DESC);

-- Verify index is valid
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'responses' 
AND indexname = 'idx_responses_created_at';
```

### Changing Column Type

```sql
-- Step 1: Add new column with new type
ALTER TABLE surveys ADD COLUMN status_new VARCHAR(50);

-- Step 2: Migrate data with conversion
UPDATE surveys 
SET status_new = 
    CASE status
        WHEN 0 THEN 'draft'
        WHEN 1 THEN 'active'
        WHEN 2 THEN 'completed'
        ELSE 'unknown'
    END;

-- Step 3: Switch to new column
ALTER TABLE surveys DROP COLUMN status;
ALTER TABLE surveys RENAME COLUMN status_new TO status;
```

### Creating Materialized View

```sql
-- Create materialized view for analytics
CREATE MATERIALIZED VIEW survey_analytics_summary AS
SELECT 
    s.id as survey_id,
    s.title,
    COUNT(DISTINCT r.id) as total_responses,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'completed') as completed_responses,
    AVG(EXTRACT(EPOCH FROM (r.completed_at - r.started_at))) as avg_completion_seconds,
    MAX(r.completed_at) as last_response_at
FROM surveys s
LEFT JOIN responses r ON r.survey_id = s.id
GROUP BY s.id, s.title
WITH DATA;

-- Create index for fast lookups
CREATE UNIQUE INDEX idx_survey_analytics_summary_id 
ON survey_analytics_summary(survey_id);

-- Schedule refresh (using pg_cron or external scheduler)
-- SELECT cron.schedule('refresh-analytics', '*/15 * * * *', 
--   'REFRESH MATERIALIZED VIEW CONCURRENTLY survey_analytics_summary;');
```

## Deployment Process

### Development Environment

```bash
# 1. Create and test migration locally
supabase migration new feature_name
# Edit the migration file
vim supabase/migrations/*_feature_name.sql

# 2. Reset and apply all migrations
supabase db reset

# 3. Run tests
npm test

# 4. Commit migration
git add supabase/migrations/*_feature_name.sql
git commit -m "feat: add feature_name migration"
```

### Staging Environment

```bash
# 1. Deploy to staging branch
git checkout staging
git merge feature-branch

# 2. Apply migrations to staging database
supabase migration up --db-url $STAGING_DATABASE_URL

# 3. Verify migration
psql $STAGING_DATABASE_URL -c "\d+ table_name"

# 4. Run integration tests
npm run test:integration

# 5. Monitor for issues (24 hours recommended)
```

### Production Deployment

```bash
# 1. Create backup
pg_dump $PRODUCTION_DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Review migration one more time
cat supabase/migrations/*_feature_name.sql

# 3. Apply migration during maintenance window
supabase migration up --db-url $PRODUCTION_DATABASE_URL

# 4. Verify migration
psql $PRODUCTION_DATABASE_URL -c "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 5;"

# 5. Run smoke tests
npm run test:smoke

# 6. Monitor application metrics
# Check error rates, response times, database connections
```

## Rollback Procedures

### Immediate Rollback

```sql
-- If migration just applied and issues detected
BEGIN;

-- Run the DOWN migration section
-- Example: DROP TABLE IF EXISTS survey_templates CASCADE;

-- Verify rollback
SELECT * FROM pg_tables WHERE tablename = 'survey_templates';

COMMIT;
```

### Data-Preserving Rollback

```sql
-- For migrations that modified existing data
BEGIN;

-- 1. Create backup table
CREATE TABLE surveys_backup AS SELECT * FROM surveys;

-- 2. Restore original schema
ALTER TABLE surveys DROP COLUMN new_column;

-- 3. Restore data if needed
UPDATE surveys s
SET old_column = b.old_column
FROM surveys_backup b
WHERE s.id = b.id;

-- 4. Verify data integrity
SELECT COUNT(*) FROM surveys WHERE old_column IS NULL;

-- 5. Clean up
DROP TABLE surveys_backup;

COMMIT;
```

### Emergency Recovery

```bash
# 1. Stop application traffic
# Update status page / maintenance mode

# 2. Restore from backup
psql $PRODUCTION_DATABASE_URL < backup_20250820_120000.sql

# 3. Reapply successful migrations since backup
supabase migration up --to-version 003

# 4. Verify database state
npm run db:verify

# 5. Resume traffic
# Update status page / disable maintenance mode
```

## Migration Validation

### Pre-Migration Checklist

- [ ] Migration tested locally
- [ ] Migration tested on staging
- [ ] Rollback script prepared and tested
- [ ] Database backup created
- [ ] Maintenance window scheduled
- [ ] Team notified
- [ ] Monitoring alerts configured

### Post-Migration Verification

```sql
-- Check migration applied
SELECT version, name, executed_at 
FROM schema_migrations 
ORDER BY version DESC 
LIMIT 5;

-- Verify table structure
\d+ new_table_name

-- Check row counts
SELECT 
    schemaname,
    tablename,
    n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Verify indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check for blocking queries
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

## Performance Considerations

### Large Table Migrations

```sql
-- Use batching for large updates
DO $$
DECLARE
    batch_size INTEGER := 10000;
    total_updated INTEGER := 0;
    rows_updated INTEGER;
BEGIN
    LOOP
        UPDATE surveys
        SET new_column = calculate_value(old_column)
        WHERE id IN (
            SELECT id FROM surveys
            WHERE new_column IS NULL
            LIMIT batch_size
        );
        
        GET DIAGNOSTICS rows_updated = ROW_COUNT;
        total_updated := total_updated + rows_updated;
        
        RAISE NOTICE 'Updated % rows (total: %)', rows_updated, total_updated;
        
        EXIT WHEN rows_updated < batch_size;
        
        -- Pause to avoid overwhelming the database
        PERFORM pg_sleep(1);
    END LOOP;
END $$;
```

### Index Creation Strategy

```sql
-- Create indexes after data load for better performance
BEGIN;

-- Disable indexes during bulk insert
ALTER TABLE large_table DISABLE TRIGGER ALL;

-- Bulk insert data
COPY large_table FROM '/data/import.csv' CSV HEADER;

-- Re-enable triggers
ALTER TABLE large_table ENABLE TRIGGER ALL;

-- Create indexes
CREATE INDEX CONCURRENTLY idx_large_table_column ON large_table(column);

-- Analyze table for query planner
ANALYZE large_table;

COMMIT;
```

## Monitoring During Migration

### Key Metrics to Watch

```sql
-- Database connections
SELECT count(*) FROM pg_stat_activity;

-- Long-running queries
SELECT 
    pid,
    now() - query_start as duration,
    state,
    query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;

-- Table bloat
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    n_dead_tup,
    n_live_tup,
    round(n_dead_tup::numeric / NULLIF(n_live_tup, 0), 4) as dead_ratio
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY dead_ratio DESC;

-- Lock monitoring
SELECT 
    locktype,
    database,
    relation::regclass,
    mode,
    granted,
    pid
FROM pg_locks
WHERE NOT granted;
```

## Troubleshooting Common Issues

### Migration Hangs

```sql
-- Find blocking query
SELECT 
    blocking.pid AS blocking_pid,
    blocking.query AS blocking_query,
    blocked.pid AS blocked_pid,
    blocked.query AS blocked_query
FROM pg_stat_activity AS blocked
JOIN pg_stat_activity AS blocking 
    ON blocking.pid = ANY(pg_blocking_pids(blocked.pid))
WHERE blocked.pid != blocking.pid;

-- Kill blocking query if safe
SELECT pg_terminate_backend(blocking_pid);
```

### Migration Fails Mid-Way

```sql
-- Check transaction status
SELECT * FROM pg_stat_activity WHERE state = 'idle in transaction';

-- Rollback orphaned transactions
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle in transaction' 
AND query_start < now() - interval '10 minutes';
```

### Performance Degradation

```sql
-- Update statistics
ANALYZE;

-- Rebuild indexes if fragmented
REINDEX TABLE surveys;

-- Vacuum to reclaim space
VACUUM (VERBOSE, ANALYZE) surveys;
```

## Best Practices

1. **Always test migrations on a copy of production data**
2. **Keep migrations small and focused**
3. **Use transactions for DDL changes**
4. **Avoid locking tables during peak hours**
5. **Document complex migrations thoroughly**
6. **Monitor application logs during deployment**
7. **Have a rollback plan ready**
8. **Communicate with team and users**
9. **Use feature flags for gradual rollout**
10. **Archive old migrations after successful deployment**