-- Migration: Add timezone support to user profiles
-- Run this script in your Supabase SQL Editor

-- Add timezone column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Add comment to document the column
COMMENT ON COLUMN user_profiles.timezone IS 'User timezone in IANA format (e.g., America/New_York, Europe/London)';

-- Update existing users to use UTC as default
UPDATE user_profiles 
SET timezone = 'UTC' 
WHERE timezone IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_timezone ON user_profiles(timezone);

-- Verify the column was added
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
  AND column_name = 'timezone'; 