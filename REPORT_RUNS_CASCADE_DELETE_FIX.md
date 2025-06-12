# Report Runs Cascade Delete Bug Fix

## Issue Description

Users were experiencing incorrect report runs limits behavior where their usage count would reset to 0 when report configurations were deleted. This was caused by a cascading delete constraint in the database.

## Root Cause

The `report_runs` table had a foreign key constraint with `ON DELETE CASCADE`:

```sql
report_configuration_id UUID REFERENCES report_configurations(id) ON DELETE CASCADE NOT NULL
```

This meant that when a `report_configuration` was deleted, **all associated `report_runs` were automatically deleted** as well, which is incorrect behavior because:

1. **Report runs are historical records** that should be preserved for billing/audit purposes
2. **Usage limits should be based on actual usage history**, not current configurations
3. **Users shouldn't be able to reset their usage** by deleting configurations

## Fix Applied

### 1. Database Schema Fix

Run the migration script `database/fix_report_runs_cascade_delete.sql`:

```sql
-- Drop the existing foreign key constraint
ALTER TABLE report_runs
DROP CONSTRAINT IF EXISTS report_runs_report_configuration_id_fkey;

-- Add new constraint with SET NULL instead of CASCADE
ALTER TABLE report_runs
ADD CONSTRAINT report_runs_report_configuration_id_fkey
FOREIGN KEY (report_configuration_id)
REFERENCES report_configurations(id)
ON DELETE SET NULL;

-- Allow NULL values for deleted configurations
ALTER TABLE report_runs
ALTER COLUMN report_configuration_id DROP NOT NULL;
```

### 2. TypeScript Interface Updates

Updated interfaces to handle nullable `report_configuration_id`:

```typescript
export interface ReportRun {
  // ...other fields...
  report_configuration_id: string | null; // Can be NULL for historical records
}

export interface CreateReportRunData {
  // ...other fields...
  report_configuration_id?: string | null; // Optional since configs can be deleted
}
```

### 3. API Method Updates

- `getConfigurationRunCount()`: Added documentation explaining it only counts runs with valid configuration references
- Historical runs with deleted configurations will have `report_configuration_id: null`

## Behavior After Fix

### Before Fix:

- User hits monthly limit (e.g., 50/50 runs used)
- Admin deletes user's report configurations
- **BUG**: Report runs get deleted due to CASCADE, usage shows 0/50
- User can create reports again (incorrect)

### After Fix:

- User hits monthly limit (e.g., 50/50 runs used)
- Admin deletes user's report configurations
- **CORRECT**: Report runs remain in database with `report_configuration_id: null`
- Usage still shows 50/50 runs used
- User cannot create reports until next month (correct)

## Impact

- ✅ **Historical Data Preserved**: All existing report runs are maintained for audit/billing
- ✅ **Correct Usage Tracking**: Monthly limits work as intended
- ✅ **Billing Accuracy**: Usage data is not lost when configurations are deleted
- ✅ **Security**: Users cannot reset usage limits by deleting configurations

## Verification

After applying the fix, verify:

1. Delete a report configuration
2. Check that associated report runs still exist with `report_configuration_id: null`
3. Verify monthly usage statistics remain accurate
4. Confirm usage limits are still enforced correctly

## Migration for Existing Deployments

1. Run `database/fix_report_runs_cascade_delete.sql` in your Supabase SQL Editor
2. Deploy the updated API code with nullable interface changes
3. No data loss - existing report runs will remain intact
4. Future configuration deletions will set `report_configuration_id` to NULL instead of deleting runs
