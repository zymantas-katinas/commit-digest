-- Migration: Ensure user_profiles table exists and fix relationship issues
-- Run this script in your Supabase SQL Editor to fix scheduler errors

-- Create user_profiles table if it doesn't exist (minimal version)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can manage their own profile'
  ) THEN
    CREATE POLICY "Users can manage their own profile" ON user_profiles
      FOR ALL USING (auth.uid() = id);
  END IF;
END
$$;

-- Create user profiles for existing users who don't have them
INSERT INTO user_profiles (id, timezone)
SELECT 
  au.id,
  'UTC' as timezone
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.id = au.id
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_timezone ON user_profiles(timezone);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_user_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_user_profiles_updated_at
      BEFORE UPDATE ON user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON user_profiles TO anon, authenticated;

-- Verify the table and profiles were created
SELECT 
  'user_profiles table exists' as status,
  COUNT(*) as user_profiles_count
FROM user_profiles; 