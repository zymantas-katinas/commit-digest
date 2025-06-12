-- Migration: Fix report_runs cascading delete issue
-- This prevents report runs from being deleted when report configurations are deleted
-- Report runs should be preserved as historical records for usage tracking
-- Run this script in your Supabase SQL Editor

-- First, let's check the current constraint
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  rc.delete_rule
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.referential_constraints rc 
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'report_runs' 
  AND tc.constraint_type = 'FOREIGN KEY'
  AND tc.constraint_name LIKE '%report_configuration_id%';

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE report_runs 
DROP CONSTRAINT IF EXISTS report_runs_report_configuration_id_fkey;

-- Step 2: Make the column nullable first
ALTER TABLE report_runs 
ALTER COLUMN report_configuration_id DROP NOT NULL;

-- Step 3: Add the new foreign key constraint with SET NULL instead of CASCADE
ALTER TABLE report_runs 
ADD CONSTRAINT report_runs_report_configuration_id_fkey 
FOREIGN KEY (report_configuration_id) 
REFERENCES report_configurations(id) 
ON DELETE SET NULL;

-- Step 4: Verify the fix by checking the constraint again
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  rc.delete_rule
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.referential_constraints rc 
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'report_runs' 
  AND tc.constraint_type = 'FOREIGN KEY'
  AND tc.constraint_name LIKE '%report_configuration_id%';

-- This should show delete_rule as 'SET NULL' instead of 'CASCADE' 