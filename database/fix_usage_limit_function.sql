-- Fix for check_monthly_usage_limit function
-- Run this in Supabase SQL Editor if you're getting function not found errors

-- Drop and recreate the function without default parameter
DROP FUNCTION IF EXISTS check_monthly_usage_limit(UUID, INTEGER);
DROP FUNCTION IF EXISTS check_monthly_usage_limit(UUID);

-- Create the function with explicit parameters (no defaults)
CREATE OR REPLACE FUNCTION check_monthly_usage_limit(
  p_user_id UUID,
  p_limit INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  current_month_runs INTEGER;
BEGIN
  -- Get successful runs for current month
  SELECT COALESCE(successful_runs, 0)
  INTO current_month_runs
  FROM user_monthly_usage
  WHERE user_id = p_user_id 
    AND month = date_trunc('month', NOW());
  
  -- Return true if user can run more reports
  RETURN COALESCE(current_month_runs, 0) < p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_monthly_usage_limit(UUID, INTEGER) TO anon, authenticated;

-- Test the function (optional - you can run this to verify it works)
-- SELECT check_monthly_usage_limit(auth.uid(), 50); 