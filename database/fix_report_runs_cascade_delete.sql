-- Migration: Fix report_runs cascading delete issue
-- This prevents report runs from being deleted when report configurations are deleted
-- Report runs should be preserved as historical records for usage tracking
-- Run this script in your Supabase SQL Editor

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE report_runs 
DROP CONSTRAINT IF EXISTS report_runs_report_configuration_id_fkey;

-- Step 2: Add the new foreign key constraint with SET NULL instead of CASCADE
-- This means when a report_configuration is deleted, the report_configuration_id 
-- in report_runs will be set to NULL, but the report_run record will remain
ALTER TABLE report_runs 
ADD CONSTRAINT report_runs_report_configuration_id_fkey 
FOREIGN KEY (report_configuration_id) 
REFERENCES report_configurations(id) 
ON DELETE SET NULL;

-- Step 3: Update the report_configuration_id column to allow NULL values
ALTER TABLE report_runs 
ALTER COLUMN report_configuration_id DROP NOT NULL;

-- Step 4: Verify the fix by checking the constraint
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc 
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'report_runs' 
  AND tc.constraint_type = 'FOREIGN KEY'
  AND tc.constraint_name LIKE '%report_configuration_id%';

-- This should show delete_rule as 'SET NULL' instead of 'CASCADE' 