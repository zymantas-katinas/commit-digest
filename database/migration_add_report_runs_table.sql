-- Migration: Add report_runs table for tracking usage and billing
-- Run this script in your Supabase SQL Editor

-- Create report_runs table
CREATE TABLE IF NOT EXISTS report_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE NOT NULL,
  report_configuration_id UUID REFERENCES report_configurations(id) ON DELETE CASCADE NOT NULL,
  
  -- Run metadata
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed', 'cancelled')),
  
  -- Configuration snapshot (for historical tracking)
  configuration_snapshot JSONB,
  
  -- AI/LLM usage tracking
  tokens_used INTEGER DEFAULT 0,
  model_used TEXT,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  
  -- Git data
  commits_processed INTEGER DEFAULT 0,
  commit_range_from TEXT,
  commit_range_to TEXT,
  
  -- Output
  report_content TEXT,
  report_format TEXT DEFAULT 'markdown',
  
  -- Error tracking
  error_message TEXT,
  error_code TEXT,
  
  -- Delivery
  webhook_delivered BOOLEAN DEFAULT FALSE,
  webhook_delivery_attempts INTEGER DEFAULT 0,
  webhook_last_attempt_at TIMESTAMP WITH TIME ZONE,
  webhook_response_status INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_report_runs_user_id ON report_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_report_runs_repository_id ON report_runs(repository_id);
CREATE INDEX IF NOT EXISTS idx_report_runs_config_id ON report_runs(report_configuration_id);
CREATE INDEX IF NOT EXISTS idx_report_runs_status ON report_runs(status);
CREATE INDEX IF NOT EXISTS idx_report_runs_started_at ON report_runs(started_at);

-- Enable Row Level Security
ALTER TABLE report_runs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
DROP POLICY IF EXISTS "Users can manage their own report runs" ON report_runs;
CREATE POLICY "Users can manage their own report runs" ON report_runs
  FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_report_runs_updated_at ON report_runs;
CREATE TRIGGER update_report_runs_updated_at
    BEFORE UPDATE ON report_runs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON report_runs TO anon, authenticated;

-- Create a view for monthly usage statistics
CREATE OR REPLACE VIEW user_monthly_usage AS
SELECT 
  user_id,
  date_trunc('month', started_at) as month,
  COUNT(*) as total_runs,
  COUNT(*) FILTER (WHERE status = 'success') as successful_runs,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_runs,
  SUM(tokens_used) as total_tokens,
  SUM(cost_usd) as total_cost_usd,
  MAX(started_at) as last_run_at
FROM report_runs
GROUP BY user_id, date_trunc('month', started_at);

-- Grant permissions on the view
GRANT SELECT ON user_monthly_usage TO anon, authenticated;

-- Enable RLS on the view (Note: Views inherit RLS from underlying tables in most cases)
-- But we'll add an explicit policy for clarity
CREATE OR REPLACE FUNCTION user_monthly_usage_rls_policy()
RETURNS SETOF user_monthly_usage
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM user_monthly_usage WHERE user_id = auth.uid();
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION user_monthly_usage_rls_policy TO anon, authenticated;

-- Function to check if user has exceeded monthly limit
CREATE OR REPLACE FUNCTION check_monthly_usage_limit(
  p_user_id UUID,
  p_limit INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  current_month_runs INTEGER;
BEGIN
  SELECT COALESCE(successful_runs, 0)
  INTO current_month_runs
  FROM user_monthly_usage
  WHERE user_id = p_user_id 
    AND month = date_trunc('month', NOW());
  
  RETURN COALESCE(current_month_runs, 0) < p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION check_monthly_usage_limit TO anon, authenticated;

-- Verify the table was created
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'report_runs'; 