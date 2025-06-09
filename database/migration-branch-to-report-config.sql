-- Migration script to move branch from repositories to report_configurations
-- This script should be run to migrate existing data to the new structure

-- Step 1: Add branch column to report_configurations if it doesn't exist
ALTER TABLE report_configurations 
ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'main';

-- Step 2: Update all existing report_configurations to have the branch from their repository
-- This will only affect rows where branch is NULL or empty
UPDATE report_configurations 
SET branch = COALESCE(repositories.branch, 'main')
FROM repositories 
WHERE report_configurations.repository_id = repositories.id
AND (report_configurations.branch IS NULL OR report_configurations.branch = '');

-- Step 3: For any configurations that don't have a matching repository, set to 'main'
UPDATE report_configurations 
SET branch = 'main' 
WHERE branch IS NULL OR branch = '';

-- Step 4: Make branch NOT NULL after data migration
ALTER TABLE report_configurations 
ALTER COLUMN branch SET NOT NULL;

-- Step 5: Remove branch column from repositories table
-- Note: Uncomment the line below after verifying the migration is successful
-- ALTER TABLE repositories DROP COLUMN IF EXISTS branch; 