-- Debug script to check functions and fix the issue
-- Run this in Supabase SQL Editor

-- 1. Check what functions currently exist
SELECT 
  routine_name,
  routine_type,
  data_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%usage%';

-- 2. Check function parameters
SELECT 
  r.routine_name,
  p.parameter_name,
  p.data_type,
  p.ordinal_position
FROM information_schema.routines r
JOIN information_schema.parameters p ON r.specific_name = p.specific_name
WHERE r.routine_schema = 'public' 
  AND r.routine_name = 'check_monthly_usage_limit'
ORDER BY p.ordinal_position;

-- 3. Drop ALL versions of the function
DROP FUNCTION IF EXISTS check_monthly_usage_limit CASCADE;

-- 4. Create the function with a different approach
CREATE OR REPLACE FUNCTION check_monthly_usage_limit(
  p_user_id UUID,
  p_limit INTEGER
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  current_month_runs INTEGER := 0;
BEGIN
  -- Get successful runs for current month directly from report_runs table
  SELECT COUNT(*)
  INTO current_month_runs
  FROM report_runs
  WHERE user_id = p_user_id 
    AND status = 'success'
    AND date_trunc('month', started_at) = date_trunc('month', NOW());
  
  -- Return true if user can run more reports
  RETURN COALESCE(current_month_runs, 0) < p_limit;
EXCEPTION
  WHEN OTHERS THEN
    -- If anything goes wrong, be conservative and deny access
    RETURN FALSE;
END;
$$;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION check_monthly_usage_limit(UUID, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_monthly_usage_limit TO anon, authenticated;

-- 6. Test the function
SELECT check_monthly_usage_limit(auth.uid(), 50) as can_run_more; 