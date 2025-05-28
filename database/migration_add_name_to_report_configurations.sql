-- Migration: Add name column to report_configurations table
-- Run this script in your Supabase SQL Editor after the initial schema

-- Add name column to report_configurations table
ALTER TABLE report_configurations 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN report_configurations.name IS 'User-defined name for the report configuration';

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