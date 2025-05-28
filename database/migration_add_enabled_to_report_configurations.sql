-- Migration: Add enabled column to report_configurations table
-- Run this script in your Supabase SQL Editor

-- Add enabled column to report_configurations table (defaults to true for existing records)
ALTER TABLE report_configurations 
ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT true NOT NULL;

-- Add a comment to document the column
COMMENT ON COLUMN report_configurations.enabled IS 'Whether this report configuration is enabled for automatic execution';

-- Verify the column was added
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'report_configurations' 
  AND table_schema = 'public'
ORDER BY ordinal_position; 