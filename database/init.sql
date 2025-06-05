-- Git Report Database Schema
-- Run this script in your Supabase SQL Editor

-- Create repositories table
CREATE TABLE IF NOT EXISTS repositories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  github_url TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'main',
  encrypted_access_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create report_configurations table
CREATE TABLE IF NOT EXISTS report_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  schedule TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  last_run_at TIMESTAMP WITH TIME ZONE,
  last_run_status TEXT,
  last_run_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_repositories_user_id ON repositories(user_id);
CREATE INDEX IF NOT EXISTS idx_report_configurations_user_id ON report_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_report_configurations_repository_id ON report_configurations(repository_id);

-- Enable Row Level Security
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_configurations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own repositories" ON repositories;
DROP POLICY IF EXISTS "Users can manage their own report configurations" ON report_configurations;

-- Create RLS policies for repositories
CREATE POLICY "Users can manage their own repositories" ON repositories
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for report_configurations
CREATE POLICY "Users can manage their own report configurations" ON report_configurations
  FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_repositories_updated_at ON repositories;
CREATE TRIGGER update_repositories_updated_at
    BEFORE UPDATE ON repositories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_report_configurations_updated_at ON report_configurations;
CREATE TRIGGER update_report_configurations_updated_at
    BEFORE UPDATE ON report_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Verify tables were created
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('repositories', 'report_configurations')
ORDER BY table_name; 