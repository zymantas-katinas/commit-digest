# Existing Users Migration Guide

This guide handles the migration of existing users who have more repositories or report configurations than the new Free tier limits allow.

## Current Situation

**Before Subscription Implementation:**

- Users could create unlimited repositories and report configurations
- No subscription limits were enforced

**After Subscription Implementation:**

- Free tier limits: 5 repositories, 10 total reports across all repositories, 50 monthly runs
- Pro tier limits: Unlimited repositories, unlimited total reports, 500 monthly runs

## Migration Strategy: Grandfathering Approach ✅

**What this means:**

- ✅ Existing users keep ALL their current data (repositories and reports)
- ✅ Existing configurations continue to work normally
- ✅ Users are automatically assigned to Free plan
- ⚠️ New creations are limited by their current subscription plan
- 🎯 Users must upgrade to create new repositories/reports beyond Free limits

## Step-by-Step Migration

### 1. Run Database Migrations

Execute these SQL scripts in your Supabase SQL Editor in order:

```sql
-- A. Main subscription migration (if not already done)
-- Run: database/migration_add_subscriptions.sql

-- B. Existing users fix migration
-- Run: database/migration_fix_existing_users.sql
```

### 2. Verify Migration Results

After running the migrations, check the results:

```sql
-- Check user profiles were created
SELECT
  COUNT(*) as total_users,
  COUNT(up.id) as users_with_profiles
FROM auth.users u
LEFT JOIN user_profiles up ON up.id = u.id;

-- Check user compliance with Free plan limits
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
)
SELECT
  COUNT(*) as total_users,
  COUNT(CASE WHEN repository_count > 1 THEN 1 END) as users_exceeding_repo_limit,
  COUNT(CASE WHEN max_reports_per_repo > 10 THEN 1 END) as users_exceeding_report_limit
FROM user_stats;
```

### 3. Backend Updates Applied

The following limit checks have been added to the API:

**Repository Creation:**

- Checks `can_user_create_repository()` function before allowing new repositories
- Returns proper error message if limit exceeded

**Report Configuration Creation:**

- Checks `can_user_create_report_config()` function before allowing new configurations
- Returns proper error message if limit exceeded

### 4. User Experience After Migration

**For Free Tier Users with Excess Data:**

✅ **What Still Works:**

- All existing repositories remain accessible
- All existing report configurations continue running
- All scheduled reports continue to generate
- Usage tracking and monthly limits apply normally

⚠️ **What's Now Limited:**

- Cannot create NEW repositories (if already have > 5)
- Cannot create NEW report configurations (already have > 10 total reports)
- See upgrade prompts in the UI

🎯 **How to Add More:**

- Upgrade to Pro plan ($15/month)
- Immediately unlock: 10 repositories, 100 total reports, 500 monthly runs

## User Communication

### Email Template (Optional)

```
Subject: Account Update - New Subscription Plans Available

Hi [User],

We've introduced subscription plans to better serve your needs!

✅ Good news: Your existing repositories and reports continue working normally.

We've automatically placed you on our Free plan, which includes:
- 5 repositories, 10 total reports, 50 monthly runs

Since you currently have [X] repositories and [Y] total reports, you're grandfathered in and can continue using all your existing configurations.

To add NEW repositories or reports, consider upgrading to our Pro plan:
- Unlimited repositories, unlimited total reports, 500 monthly runs
- Only $15/month

Upgrade anytime at: [Your App URL]/pricing

Thanks for being an early user!
```

### In-App Messaging

The UI already handles this with:

- Usage stats showing current plan
- Upgrade prompts when limits are reached
- Clear error messages when trying to create beyond limits

## Monitoring & Support

### Checking User Status

```sql
-- Get users who exceed Free plan limits
SELECT
  u.email,
  us.repository_count,
  us.max_reports_per_repo,
  'Grandfathered - Upgrade to add more' as status
FROM (
  SELECT
    u.id as user_id,
    u.email,
    COUNT(DISTINCT r.id) as repository_count,
    COALESCE(MAX(rc_counts.report_count), 0) as max_reports_per_repo
  FROM auth.users u
  LEFT JOIN repositories r ON r.user_id = u.id
  LEFT JOIN (
    SELECT repository_id, COUNT(*) as report_count
    FROM report_configurations
    GROUP BY repository_id
  ) rc_counts ON rc_counts.repository_id = r.id
  GROUP BY u.id, u.email
) us
JOIN auth.users u ON u.id = us.user_id
WHERE us.repository_count > 5 OR us.max_reports_per_repo > 10;
```

### Common User Questions

**Q: "Why can't I create a new repository?"**
A: You're on the Free plan (5 repository limit) but already have more than 5 repositories from before our subscription launch. You're grandfathered in to keep existing ones. Upgrade to Pro to add more.

**Q: "Will my existing reports stop working?"**
A: No! All existing configurations continue working normally. You only need to upgrade to create NEW ones.

**Q: "Can I delete a repository to create a new one?"**
A: Yes! If you're within the Free plan limits after deletion, you can create new repositories.

## Alternative: Strict Compliance (Not Recommended)

If you prefer to enforce strict compliance and remove excess data:

1. Uncomment the deletion sections in `database/migration_fix_existing_users.sql`
2. This will delete excess repositories and report configurations
3. Only do this if you want to strictly enforce limits on existing data

## Rollback Plan

If needed, you can:

1. Remove limit checks from controllers
2. Update database functions to return `true` always
3. Users regain ability to create unlimited resources

## Success Metrics

After migration, monitor:

- User retention rates
- Upgrade conversion rates
- Support ticket volume
- User satisfaction scores

The grandfathering approach maximizes user satisfaction while encouraging upgrades for new features.

## Migration Overview

The subscription system has been updated to use **total reports across all repositories** instead of **reports per repository**. This provides more flexibility for users.

### New Plan Structure

- Free tier limits: 5 repositories, 10 total reports across all repositories, 50 monthly runs
- Pro tier limits: Unlimited repositories, unlimited total reports, 500 monthly runs

### Key Changes

1. **Report Limits**: Changed from "per repository" to "total across all repositories"
2. **Database Function**: Updated `can_user_create_report_config()` to check total reports
3. **UI Updates**: Subscription cards now show "X/Y total reports" format
4. **Default Values**: Free tier increased from 5 to 10 total reports, Pro tier increased from 50 to 100 total reports
