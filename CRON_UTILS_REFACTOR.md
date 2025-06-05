# Cron Utilities Refactor

## 🎯 Overview

Extracted complex cron expression logic from the React components into a reusable utility library.

## 📁 Files Changed

### New Files

- **`apps/web/src/lib/cron-utils.ts`** - New utility library for cron expression handling

### Modified Files

- **`apps/web/src/components/report-configuration-list.tsx`** - Removed inline cron logic, now imports utilities
- **`apps/web/src/components/add-report-config-dialog.tsx`** - Uses `isValidCronExpression` for validation
- **`apps/web/src/components/edit-report-config-dialog.tsx`** - Uses `isValidCronExpression` for validation

## 🔧 Utility Functions

### `getScheduleDisplay(schedule: string): string`

Converts cron expressions to human-readable descriptions:

- **Predefined schedules**: `"0 9 * * *"` → `"Daily at 9:00 AM"`
- **Hourly patterns**: `"0 * * * *"` → `"Every hour"`
- **Interval patterns**: `"0 */4 * * *"` → `"Every 4 hours"`
- **Weekly ranges**: `"0 9 * * 1-5"` → `"Mon-Fri at 09:00"`
- **Multiple days**: `"0 9 * * 1,3,5"` → `"Mon, Wed, Fri at 09:00"`
- **Monthly**: `"0 9 15 * *"` → `"Monthly on 15th at 09:00"`

### `parseNextRunTime(schedule: string): Date | null`

Calculates the next execution time for a cron expression:

- Handles daily, weekly, monthly, and interval patterns
- Returns `null` for unsupported complex patterns
- Accounts for current time and date boundaries

### `getNextRunTime(schedule: string, enabled: boolean): string`

Formats next run time into human-readable relative time:

- **Disabled**: `"Paused"`
- **Time formats**: `"2d 3h"`, `"5h 30m"`, `"15m"`, `"Soon"`
- Falls back to hardcoded logic for known patterns

### `isValidCronExpression(schedule: string): boolean`

Validates cron expression format using regex:

- Ensures all 5 fields are present and valid
- Used in form validation schemas

## ✅ Benefits

### 1. **Code Reusability**

- Logic can be used across multiple components
- Consistent behavior for cron handling
- Easier to test and maintain

### 2. **Cleaner Components**

- Removed ~300 lines of inline logic from `report-configuration-list.tsx`
- Components focus on UI rather than business logic
- Better separation of concerns

### 3. **Better Testing**

- Utility functions can be unit tested independently
- Easier to verify edge cases and complex patterns
- More reliable cron parsing

### 4. **Enhanced Features**

- Better support for custom cron expressions
- More accurate next run time calculations
- Improved human-readable descriptions

## 🧪 Usage Examples

```typescript
import {
  getScheduleDisplay,
  getNextRunTime,
  isValidCronExpression,
} from "@/lib/cron-utils";

// Display schedule
getScheduleDisplay("0 9 * * 1-5"); // "Mon-Fri at 09:00"
getScheduleDisplay("0 */6 * * *"); // "Every 6 hours"

// Next run time
getNextRunTime("0 9 * * *", true); // "2h 30m"
getNextRunTime("0 9 * * *", false); // "Paused"

// Validation
isValidCronExpression("0 9 * * *"); // true
isValidCronExpression("invalid cron"); // false
```

## 🔄 Migration Notes

- All existing functionality preserved
- No breaking changes to component APIs
- Custom schedules now display better descriptions
- Enhanced validation provides clearer error messages
