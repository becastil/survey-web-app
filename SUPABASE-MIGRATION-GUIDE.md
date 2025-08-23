# Supabase Database Migration Guide

## Prerequisites
- Supabase account at [supabase.com](https://supabase.com)
- Project created: `https://lrhqxbqbyalosgqjobxf.supabase.co`

## Step 4: Supabase Database Migration

### Option 1: Using Supabase Dashboard (Easiest)

1. **Login to Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project: `lrhqxbqbyalosgqjobxf`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run Migration Scripts**
   
   **First Migration - Initial Schema:**
   - Copy the entire contents of `/supabase/migrations/001_initial_schema.sql`
   - Paste into SQL Editor
   - Click "Run" button
   - Wait for "Success" message (should take 10-30 seconds)

   **Second Migration - Survey Platform:**
   - Click "New query" again
   - Copy contents of `/supabase/migrations/20240823_survey_platform.sql`
   - Paste and run
   - Wait for success

4. **Verify Tables Created**
   - Go to "Table Editor" in sidebar
   - You should see these tables:
     - profiles
     - surveys
     - questions
     - question_options
     - responses
     - answers
     - audit_logs

### Option 2: Using Supabase CLI (Advanced)

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link Your Project**
   ```bash
   supabase link --project-ref lrhqxbqbyalosgqjobxf
   ```

4. **Run Migrations**
   ```bash
   # Run all migrations
   supabase db push

   # Or run specific migration
   supabase db push --file supabase/migrations/001_initial_schema.sql
   supabase db push --file supabase/migrations/20240823_survey_platform.sql
   ```

### Option 3: Manual SQL Execution

1. **Get Database Connection String**
   - Go to: Settings → Database
   - Copy the connection string

2. **Use any PostgreSQL client**
   - pgAdmin
   - TablePlus
   - DBeaver
   - psql command line

3. **Execute migrations in order**
   - First: `001_initial_schema.sql`
   - Second: `20240823_survey_platform.sql`

## Post-Migration Setup

### 1. Enable Row Level Security (RLS)
Already enabled in the migration scripts, but verify:
- Go to Authentication → Policies
- Ensure RLS is enabled for all tables

### 2. Get Your API Keys
Go to Settings → API:

- **Project URL**: `https://lrhqxbqbyalosgqjobxf.supabase.co`
- **Anon/Public Key**: `eyJ...` (long string)
- **Service Role Key**: `eyJ...` (keep this secret!)

### 3. Update Environment Variables

In Cloudflare Pages dashboard, update:
```
NEXT_PUBLIC_SUPABASE_URL=https://lrhqxbqbyalosgqjobxf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Your Anon Key]
SUPABASE_SERVICE_ROLE_KEY=[Your Service Role Key - for server-side only]
```

### 4. Test Database Connection

Create a test user in Supabase:
1. Go to Authentication → Users
2. Click "Invite user"
3. Enter email and password
4. Create user

Then in your app:
1. Set `NEXT_PUBLIC_USE_MOCK_DATA=false`
2. Try logging in with the test user
3. Check if you can create/view surveys

## Database Schema Overview

### Tables Created:

1. **profiles** - User profiles with roles (admin, analyst, viewer)
2. **surveys** - Survey definitions
3. **questions** - Survey questions
4. **question_options** - Options for multiple choice questions
5. **responses** - Survey response sessions
6. **answers** - Individual answers to questions
7. **audit_logs** - Track all changes

### Key Features:

- **Row Level Security (RLS)** - Automatic data protection
- **Role-based access** - Admin, Analyst, Viewer roles
- **Audit logging** - Track all changes
- **Automatic timestamps** - created_at, updated_at
- **UUID primary keys** - Globally unique identifiers
- **Foreign key constraints** - Data integrity

## Troubleshooting

### Common Issues:

1. **"Permission denied" errors**
   - Solution: Check RLS policies are correct
   - Verify user role in profiles table

2. **"Relation does not exist" errors**
   - Solution: Run migrations in order
   - Check all migrations completed successfully

3. **"UUID extension not found"**
   - Solution: Enable in Extensions tab
   - Or run: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

4. **Connection timeouts**
   - Check firewall/network settings
   - Verify Supabase project is not paused

### Verify Migration Success

Run this query in SQL Editor to check:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Should return:
- answers
- audit_logs
- profiles
- question_options
- questions
- responses
- survey_response_summary
- surveys

## Next Steps

After successful migration:

1. **Test Authentication**
   - Create test user
   - Verify login works

2. **Test Survey Creation**
   - Create sample survey
   - Add questions
   - Submit response

3. **Switch to Production Mode**
   - Set `NEXT_PUBLIC_USE_MOCK_DATA=false`
   - Redeploy on Cloudflare Pages

4. **Monitor Database**
   - Check Supabase dashboard for queries
   - Monitor performance
   - Set up backups

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Service role key not exposed to client
- [ ] API keys stored securely in environment variables
- [ ] SSL enabled for database connections
- [ ] Regular backups configured
- [ ] Monitor failed login attempts