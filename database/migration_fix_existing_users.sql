-- Migration: Fix existing users for subscription system
-- This handles users who existed before subscription implementation
-- Run this script in your Supabase SQL Editor after the main subscription migration

-- Step 1: Create user profiles for existing users who don't have them
INSERT INTO user_profiles (id, current_plan_id)
SELECT 
  au.id,
  sp.id as plan_id
FROM auth.users au
CROSS JOIN subscription_plans sp
WHERE sp.name = 'Free'
  AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = au.id
  );

-- Step 2: Check current user data and plan compliance
-- This query shows which users exceed Free plan limits
WITH user_stats AS (
  SELECT 
    u.id as user_id,
    u.email,
    COUNT(DISTINCT r.id) as repository_count,
    COALESCE(MAX(rc_counts.report_count), 0) as max_reports_per_repo
  FROM auth.users u
  LEFT JOIN repositories r ON r.user_id = u.id
  LEFT JOIN (
    SELECT 
      repository_id,
      COUNT(*) as report_count
    FROM report_configurations 
    GROUP BY repository_id
  ) rc_counts ON rc_counts.repository_id = r.id
  GROUP BY u.id, u.email
),
plan_limits AS (
  SELECT 
    sp.max_repositories,
    sp.max_reports
  FROM subscription_plans sp 
  WHERE sp.name = 'Free'
)
SELECT 
  us.user_id,
  us.email,
  us.repository_count,
  us.max_reports_per_repo,
  pl.max_repositories as free_limit_repos,
  pl.max_reports as free_limit_reports,
  CASE 
    WHEN us.repository_count > pl.max_repositories THEN 'EXCEEDS_REPO_LIMIT'
    WHEN us.max_reports_per_repo > pl.max_reports THEN 'EXCEEDS_REPORT_LIMIT'
    ELSE 'COMPLIANT'
  END as compliance_status
FROM user_stats us
CROSS JOIN plan_limits pl
WHERE us.repository_count > 0 OR us.max_reports_per_repo > 0
ORDER BY compliance_status DESC, us.repository_count DESC;

-- Step 3: Option A - Grandfathering approach (recommended)
-- Keep existing data but enforce limits on NEW creations only
-- This is handled automatically by the application logic

-- Step 4: Option B - Clean up excess data (use with caution)
-- Uncomment the sections below if you want to enforce strict compliance

/*
-- WARNING: This will DELETE data to comply with Free plan limits
-- Only run this if you want to strictly enforce limits on existing data

-- First, let's identify what would be deleted (run this query first to review)
WITH user_repo_counts AS (
  SELECT 
    r.user_id,
    r.id as repository_id,
    r.name as repository_name,
    ROW_NUMBER() OVER (PARTITION BY r.user_id ORDER BY r.created_at) as repo_rank
  FROM repositories r
),
excess_repos AS (
  SELECT * FROM user_repo_counts WHERE repo_rank > 1
),
user_report_counts AS (
  SELECT 
    rc.repository_id,
    rc.id as config_id,
    rc.name as config_name,
    r.user_id,
    ROW_NUMBER() OVER (PARTITION BY rc.repository_id ORDER BY rc.created_at) as report_rank
  FROM report_configurations rc
  JOIN repositories r ON r.id = rc.repository_id
),
excess_reports AS (
  SELECT * FROM user_report_counts WHERE report_rank > 5
)
-- Review what would be deleted:
SELECT 'EXCESS_REPOSITORIES' as type, repository_name as name, user_id FROM excess_repos
UNION ALL
SELECT 'EXCESS_REPORT_CONFIGS' as type, config_name as name, user_id FROM excess_reports;

-- If you're sure you want to delete excess data, uncomment these:
-- DELETE FROM repositories WHERE id IN (SELECT repository_id FROM excess_repos);
-- DELETE FROM report_configurations WHERE id IN (SELECT config_id FROM excess_reports);
*/

-- Step 5: Create a function to check if user can create new resources
CREATE OR REPLACE FUNCTION can_user_create_repository(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_limits RECORD;
  current_repo_count INTEGER;
BEGIN
  -- Get user limits
  SELECT * INTO user_limits FROM get_user_limits(p_user_id);
  
  -- Get current repository count
  SELECT COUNT(*) INTO current_repo_count 
  FROM repositories 
  WHERE user_id = p_user_id;
  
  -- Check if user can create more repositories
  RETURN current_repo_count < user_limits.max_repositories;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_user_create_report_config(p_user_id UUID, p_repository_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_limits RECORD;
  current_config_count INTEGER;
BEGIN
  -- Verify repository belongs to user
  IF NOT EXISTS (SELECT 1 FROM repositories WHERE id = p_repository_id AND user_id = p_user_id) THEN
    RETURN FALSE;
  END IF;
  
  -- Get user limits
  SELECT * INTO user_limits FROM get_user_limits(p_user_id);
  
  -- Get current report configuration count for this repository
  SELECT COUNT(*) INTO current_config_count 
  FROM report_configurations 
  WHERE repository_id = p_repository_id;
  
  -- Check if user can create more report configurations
  RETURN current_config_count < user_limits.max_reports;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION can_user_create_repository(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_create_report_config(UUID, UUID) TO authenticated;

-- Verification query - run this to check the results
SELECT 
  'Migration completed successfully. Users with profiles:' as status,
  COUNT(*) as user_count
FROM user_profiles; 