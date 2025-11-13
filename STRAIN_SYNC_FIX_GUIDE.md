# Strain Sync Database Column Fix Guide

## Problem Summary

The strain sync was failing with the error:
```
PostgresError: column "pharmaceuticalProductCount" of relation "cannabisStrains" does not exist
```

This occurred because the migration to add the `pharmaceuticalProductCount` column had not been applied to the production database.

## Solution Overview

This fix includes:
1. ✅ Enhanced migration script with tracking and error handling
2. ✅ Updated deployment configs to auto-run migrations
3. ✅ Added verification script to test the fix
4. ✅ Comprehensive migration documentation

## Quick Fix - Run on Production

To fix the production database immediately, run ONE of these commands:

### Option 1: Run Default Migration (Recommended)
```bash
npm run db:migrate
```

This runs the `add_pharmaceutical_product_count.sql` migration by default.

### Option 2: Check Migration Status First
```bash
npm run db:migrate:status
```

This shows which migrations have been applied and which are pending.

### Option 3: Dry Run (Test Before Applying)
```bash
npm run db:migrate:dry-run
```

This shows what SQL would be executed without making any changes.

### Option 4: Run All Pending Migrations
```bash
npm run db:migrate:all
```

This applies all migration files in the `drizzle/migrations` directory.

## Verification

After running the migration, verify it worked:

```bash
npm run db:verify-strains
```

This verification script will:
- ✅ Check if the `cannabisStrains` table exists
- ✅ Verify all required columns are present
- ✅ Confirm the `pharmaceuticalProductCount` column exists
- ✅ Test insert/update operations
- ✅ Verify data integrity
- ✅ Check migration tracking

Expected output:
```
🔍 Cannabis Strain Sync Verification

============================================================

📋 Step 1: Checking if cannabisStrains table exists...
✅ PASSED: cannabisStrains table exists

📋 Step 2: Checking required columns...
✅ PASSED: All required columns exist

📋 Step 3: Verifying pharmaceuticalProductCount column...
   Column type: integer
   Nullable: YES
✅ PASSED: pharmaceuticalProductCount column exists

... (more steps)

============================================================
✅ All verification checks passed!
============================================================

✅ The strain sync is ready to use.
```

## What Changed

### 1. Enhanced Migration Script (`scripts/run-migration.js`)

**New Features:**
- **Migration Tracking**: Creates a `_migrations` table to track which migrations have been applied
- **Checksum Verification**: Detects if migration files have changed since they were applied
- **Dry Run Mode**: Test migrations without applying them (`--dry-run`)
- **Force Mode**: Re-run migrations if needed (`--force`)
- **Status Check**: See which migrations are pending (`--status`)
- **Audit Logging**: Records migrations in `syncJobs` table for audit trail
- **Better Error Handling**: Clear error messages with rollback support

**Usage Examples:**
```bash
# Run default migration
npm run db:migrate

# Check status
npm run db:migrate:status

# Dry run
npm run db:migrate:dry-run

# Run specific migration
node scripts/run-migration.js my-migration.sql

# Run all migrations
npm run db:migrate:all

# Force re-run a migration
node scripts/run-migration.js my-migration.sql --force

# Continue on errors
node scripts/run-migration.js all --continue-on-error
```

### 2. Updated Deployment Configurations

**Railway (`railway.json`):**
```json
{
  "build": {
    "buildCommand": "pnpm install && pnpm run build && npm run db:migrate"
  }
}
```

**Render (`render.yaml`):**
```yaml
services:
  - type: web
    name: cannabis-fantasy-league
    preDeployCommand: npm run db:migrate
```

Now migrations run automatically on every deployment!

### 3. New Verification Script (`scripts/verify-strain-sync.js`)

Run `npm run db:verify-strains` to comprehensively test the strain sync functionality.

### 4. New Package.json Scripts

```json
{
  "scripts": {
    "db:migrate": "node scripts/run-migration.js",
    "db:migrate:all": "node scripts/run-migration.js all",
    "db:migrate:status": "node scripts/run-migration.js --status",
    "db:migrate:dry-run": "node scripts/run-migration.js --dry-run",
    "db:verify-strains": "node scripts/verify-strain-sync.js"
  }
}
```

## Migration Details

The migration adds the `pharmaceuticalProductCount` column to track how many pharmaceutical products use each cannabis strain.

**Migration File:** `drizzle/migrations/add_pharmaceutical_product_count.sql`

**SQL:**
```sql
ALTER TABLE "cannabisStrains" 
ADD COLUMN IF NOT EXISTS "pharmaceuticalProductCount" INTEGER NOT NULL DEFAULT 0;
```

**What it does:**
- Adds a new column `pharmaceuticalProductCount` to `cannabisStrains` table
- Type: `INTEGER`
- Default value: `0`
- Non-nullable
- Uses `IF NOT EXISTS` for safe re-running

## Testing the Fix

After running the migration on production:

### 1. Verify Column Exists
```bash
npm run db:verify-strains
```

### 2. Test Strain Sync
- Log into the admin dashboard
- Navigate to the Data Sync section
- Click "Sync Cannabis Strains"
- Monitor the sync job logs

Expected result: Strains sync successfully without errors.

### 3. Check Sync Logs
```sql
SELECT * FROM "syncJobs" 
WHERE job_name = 'sync-strains' 
ORDER BY created_at DESC 
LIMIT 5;
```

Look for `status = 'completed'` with no error messages.

## Troubleshooting

### Migration Already Applied Error

If you see: "Migration already applied"
- This is normal! The migration tracking prevents duplicate runs
- Use `--force` flag only if you need to re-run it

### Migration Tracking Table Missing

If the `_migrations` table doesn't exist, it will be created automatically on the first run.

### Schema Validation Errors

If strain sync still fails with schema errors after migration:
1. Check migration status: `npm run db:migrate:status`
2. Run verification: `npm run db:verify-strains`
3. Check the database directly:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'cannabisStrains';
   ```

### PostgreSQL Connection Issues

If you can't connect to the database:
- Verify `DATABASE_URL` environment variable is set
- Ensure SSL is required for production databases
- Check firewall/network settings

## Best Practices Going Forward

### Creating New Migrations

1. Create migration file in `drizzle/migrations/`:
   ```bash
   touch drizzle/migrations/my_new_migration.sql
   ```

2. Write your SQL (use `IF NOT EXISTS` where applicable):
   ```sql
   ALTER TABLE "myTable" 
   ADD COLUMN IF NOT EXISTS "myColumn" VARCHAR(255);
   ```

3. Test locally with dry run:
   ```bash
   node scripts/run-migration.js my_new_migration.sql --dry-run
   ```

4. Apply locally:
   ```bash
   node scripts/run-migration.js my_new_migration.sql
   ```

5. Commit and push - deployment will auto-apply on production!

### Schema Changes

When adding new columns to the schema:
1. Update `drizzle/schema.ts`
2. Create migration SQL file
3. Update `server/db/schemaValidator.ts` if needed
4. Test locally
5. Deploy (migrations run automatically)

## Files Modified

- ✅ `scripts/run-migration.js` - Enhanced migration runner
- ✅ `scripts/verify-strain-sync.js` - New verification script
- ✅ `package.json` - Added migration and verification scripts
- ✅ `railway.json` - Added migration step to build
- ✅ `render.yaml` - Added preDeployCommand for migrations
- ✅ `STRAIN_SYNC_FIX_GUIDE.md` - This guide

## Support

If you continue to experience issues after following this guide:

1. Check the logs in the admin dashboard
2. Run the verification script: `npm run db:verify-strains`
3. Check migration status: `npm run db:migrate:status`
4. Review the `syncJobs` and `syncLogs` tables for detailed error information

## Summary

The strain sync issue is now fixed! The key improvements are:

- ✅ Database schema is now complete with `pharmaceuticalProductCount` column
- ✅ Enhanced migration system prevents future schema issues
- ✅ Automated migrations on deployment
- ✅ Comprehensive verification and testing tools
- ✅ Audit trail for all migration activities

**Next Step:** Run `npm run db:migrate` on production to apply the fix!

