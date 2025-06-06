# Timezone Support Implementation

## Overview

This document describes the implementation of timezone-aware scheduling for CommitDigest reports. Previously, all scheduled reports were interpreted in UTC regardless of the user's local timezone, causing confusion when users set schedules like "Daily at 9:00 AM" expecting it to run at 9 AM in their local time.

## Problem Statement

**Before the fix:**

- User sets schedule "0 9 \* \* \*" (Daily at 9:00 AM) expecting 9 AM in their timezone
- System interprets this as 9:00 AM UTC
- If user is in EST (-5 hours), they get reports at 4:00 AM local time instead of 9:00 AM

**After the fix:**

- User sets schedule "0 9 \* \* \*" and selects timezone "America/New_York"
- System converts 9:00 AM EST to UTC for internal processing
- Reports are generated at the correct local time for the user

## Implementation Details

### 1. Database Changes

**File: `database/migration_add_timezone_support.sql`**

```sql
-- Add timezone column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Add comment and index
COMMENT ON COLUMN user_profiles.timezone IS 'User timezone in IANA format (e.g., America/New_York, Europe/London)';
CREATE INDEX IF NOT EXISTS idx_user_profiles_timezone ON user_profiles(timezone);

-- Set default for existing users
UPDATE user_profiles
SET timezone = 'UTC'
WHERE timezone IS NULL;
```

### 2. Backend Changes

#### Updated Cron Utilities (`apps/api/src/utils/cron-utils.ts`)

- Added timezone conversion functions: `convertToUTC()` and `convertFromUTC()`
- Updated `parseNextRunTime()` to accept `userTimezone` parameter
- Updated `isScheduleDue()` to use timezone-aware calculations
- All cron calculations are now done in user's timezone, then converted to UTC for storage

#### Enhanced SupabaseService (`apps/api/src/services/supabase.service.ts`)

- Added `getUserTimezone()` and `updateUserTimezone()` methods
- Updated `getDueReportConfigurations()` to join with user_profiles and get timezone
- Scheduler now passes user timezone to cron utility functions

#### New Users Controller (`apps/api/src/controllers/users.controller.ts`)

- `GET /api/users/profile` - Returns user profile including timezone
- `PUT /api/users/timezone` - Updates user's timezone setting
- Validates timezone using JavaScript's `Intl` API

### 3. Frontend Changes

#### Timezone Utilities (`apps/web/src/lib/timezone-utils.ts`)

- `getTimezoneOptions()` - Returns list of common timezones
- `getBrowserTimezone()` - Detects user's browser timezone
- `getTimezoneOffset()` - Calculates current UTC offset for a timezone
- `formatTimeInTimezone()` - Formats dates in specific timezone

#### Timezone Settings Component (`apps/web/src/components/timezone-settings.tsx`)

- Dropdown with common timezones
- Auto-detection of browser timezone
- Real-time preview of current time in selected timezone
- Educational content about how scheduling works

#### Updated API Client (`apps/web/src/lib/api.ts`)

- Added `getUserProfile()` and `updateUserTimezone()` methods

#### Settings Page (`apps/web/src/app/settings/page.tsx`)

- New dedicated page for user settings
- Integrates timezone settings component

#### Navigation Updates

- Added "Settings" link to both desktop and mobile navigation
- Only visible to authenticated users

#### Dialog Updates

- Updated schedule examples in report configuration dialogs
- Added note that times are interpreted in user's timezone

## Usage

### For Users

1. **Access Settings:**

   - Navigate to Settings from the main navigation
   - Or visit `/settings` directly

2. **Set Timezone:**

   - Select your timezone from the dropdown
   - Use "Use Detected Timezone" button for auto-detection
   - See real-time preview of current time in selected timezone

3. **Create Scheduled Reports:**
   - Times like "9:00 AM" now mean 9:00 AM in your selected timezone
   - Reports will be generated at the correct local time

### For Developers

1. **Run Database Migration:**

   ```sql
   -- In Supabase SQL Editor
   \i database/migration_add_timezone_support.sql
   ```

2. **API Usage:**

   ```typescript
   // Get user profile with timezone
   const profile = await api.getUserProfile();
   console.log(profile.data.timezone); // e.g., "America/New_York"

   // Update timezone
   await api.updateUserTimezone("Europe/London");
   ```

3. **Backend Usage:**
   ```typescript
   // Cron utilities with timezone support
   const nextRun = parseNextRunTime(
     "0 9 * * *",
     new Date(),
     "America/New_York",
   );
   const isDue = isScheduleDue("0 9 * * *", lastRunTime, "America/New_York");
   ```

## Testing

### Manual Testing

1. **Set Different Timezone:**

   - Go to Settings and select a timezone different from your current one
   - Create a report schedule like "Daily at 9:00 AM"
   - Verify the next run time calculations account for timezone difference

2. **Browser Timezone Detection:**

   - Clear timezone setting or create new account
   - Visit Settings page
   - Verify it detects your browser timezone correctly

3. **Schedule Examples:**
   - Test various cron expressions: hourly, daily, weekly, monthly
   - Verify they work correctly across timezone boundaries

### Timezone Edge Cases

1. **Daylight Saving Time (DST):**

   - Test schedules during DST transitions
   - Verify reports still run at correct local time

2. **Cross-Date Scheduling:**

   - Set timezone where it's a different date than server timezone
   - Verify daily schedules work correctly

3. **Invalid Timezones:**
   - API validates timezone names using JavaScript's Intl API
   - Invalid timezones are rejected with error message

## Technical Notes

### Timezone Conversion Strategy

1. **User Input:** User sets cron expression thinking in their local timezone
2. **Calculation:** System calculates next run time in user's timezone
3. **Storage:** Converts calculated time to UTC for database storage
4. **Comparison:** Scheduler compares current UTC time with stored UTC times

### Performance Considerations

- Added database index on `timezone` column
- Timezone conversions use native JavaScript Date methods
- No external timezone libraries required

### Error Handling

- Graceful fallback to UTC if user timezone is invalid
- API validates timezone format before saving
- Frontend shows error messages for invalid timezone updates

## Migration Guide

### For Existing Users

1. Run the database migration
2. Existing users will have timezone set to 'UTC' by default
3. Users can update their timezone in Settings
4. Existing scheduled reports will continue working but in UTC until user updates timezone

### Backward Compatibility

- All existing cron expressions continue to work
- No changes to cron expression format required
- Default timezone 'UTC' maintains previous behavior

## Future Enhancements

1. **Timezone Change Notifications:**

   - Notify users when their timezone setting affects scheduled reports
   - Show impact on existing schedules

2. **Multiple Timezone Support:**

   - Allow different timezones for different report configurations
   - Team-based timezone settings

3. **Smart Scheduling:**

   - Suggest optimal report times based on team locations
   - Handle international teams with multiple timezones

4. **Enhanced UI:**
   - Visual timezone map for selection
   - Time zone conversion preview in report configuration

## Related Files

- `database/migration_add_timezone_support.sql` - Database schema changes
- `apps/api/src/utils/cron-utils.ts` - Timezone-aware cron utilities
- `apps/api/src/services/supabase.service.ts` - Database operations with timezone
- `apps/api/src/controllers/users.controller.ts` - Timezone API endpoints
- `apps/web/src/lib/timezone-utils.ts` - Frontend timezone utilities
- `apps/web/src/components/timezone-settings.tsx` - Settings component
- `apps/web/src/app/settings/page.tsx` - Settings page
- `apps/web/src/components/app-header.tsx` - Navigation updates
