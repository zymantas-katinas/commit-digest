-- Migration: Update subscription plans for total reports model
-- This updates the existing plans to use total reports instead of reports per repository
-- Run this script in your Supabase SQL Editor

-- Update Free plan to allow 5 repositories and 10 total reports
UPDATE subscription_plans 
SET max_repositories = 5,
    max_reports = 10,
    description = 'Free tier with basic features - 5 repositories, 10 total reports across all repositories'
WHERE name = 'Free';

-- Update Pro plan to allow 100 total reports (instead of 50 per repo) 
UPDATE subscription_plans 
SET max_reports = 100,
    description = 'Professional plan with advanced features - 10 repositories, 100 total reports across all repositories'
WHERE name = 'Pro';

-- Verify the updates
SELECT 
  name,
  max_repositories,
  max_reports,
  description
FROM subscription_plans
ORDER BY price_usd; 