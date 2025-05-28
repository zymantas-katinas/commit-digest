# Enable/Disable Reports Feature

This document outlines the implementation of the enable/disable functionality for report configurations in the Git Report application.

## Overview

Users can now enable or disable report configurations without deleting them. When a configuration is disabled, it will not generate automatic reports but can be re-enabled at any time.

## Changes Made

### 1. Database Changes

#### Migration File: `database/migration_add_enabled_to_report_configurations.sql`

- Added `enabled` column to `report_configurations` table
- Column type: `BOOLEAN NOT NULL DEFAULT true`
- Existing configurations will be enabled by default

**To apply the migration:**

1. Go to your Supabase Dashboard → SQL Editor
2. Copy and run the contents of `database/migration_add_enabled_to_report_configurations.sql`

### 2. Backend Changes

#### DTOs Updated

- **CreateReportConfigurationDto**: Added optional `enabled` field
- **UpdateReportConfigurationDto**: Added optional `enabled` field

#### Supabase Service

- **ReportConfiguration interface**: Added `enabled: boolean` field
- **createReportConfiguration**: Added `enabled` parameter (defaults to `true`)
- **getDueReportConfigurations**: Now filters by `enabled = true` to only process active configurations

#### Controller

- **createReportConfiguration**: Passes `enabled` field from DTO to service

### 3. Frontend Changes

#### API Client (`apps/web/src/lib/api.ts`)

- Updated `createReportConfiguration` to accept optional `enabled` field
- Updated `updateReportConfiguration` to accept optional `enabled` field

#### Components

##### Report Configuration List (`apps/web/src/components/report-configuration-list.tsx`)

- Added `enabled` field to `ReportConfiguration` interface
- Added toggle functionality with mutation to update enabled status
- Added visual indicator showing enabled/disabled status
- Added enable/disable button in each configuration card

##### Add Report Config Dialog (`apps/web/src/components/add-report-config-dialog.tsx`)

- Added `enabled` field to form schema (defaults to `true`)
- Added checkbox for "Enable automatic reports"

##### Edit Report Config Dialog (`apps/web/src/components/edit-report-config-dialog.tsx`)

- Added `enabled` field to form schema and interface
- Added checkbox for "Enable automatic reports"

#### UI Components

- Created `Switch` component (`apps/web/src/components/ui/switch.tsx`) for toggle functionality
- Note: Currently using a button instead of switch due to import issues, but the Switch component is ready for use

## How It Works

### Creating Configurations

- New configurations are enabled by default
- Users can uncheck "Enable automatic reports" to create disabled configurations

### Managing Existing Configurations

- Each configuration card shows the current enabled/disabled status
- Users can click the "Enable"/"Disable" button to toggle the status
- The change is immediately saved and reflected in the UI

### Automatic Report Generation

- Only enabled configurations are processed by the scheduler
- Disabled configurations are completely skipped during automatic runs
- Manual webhook testing still works for disabled configurations

## User Experience

### Visual Indicators

- Configuration cards show "Enabled" or "Disabled" status
- Descriptive text explains what each status means:
  - Enabled: "Reports will be generated automatically"
  - Disabled: "Reports are paused"

### Actions Available

- **Enable**: Activates automatic report generation
- **Disable**: Pauses automatic report generation without losing configuration
- **Edit**: Modify configuration settings including enabled status
- **Test**: Manual webhook testing (works regardless of enabled status)
- **Delete**: Permanently remove configuration

## Benefits

1. **Flexibility**: Users can temporarily pause reports without losing configuration
2. **Convenience**: No need to recreate configurations when resuming reports
3. **Control**: Fine-grained control over which repositories generate reports
4. **Efficiency**: Scheduler only processes active configurations

## Migration Instructions

For existing installations:

1. **Run the database migration:**

   ```sql
   -- Copy and run this in Supabase SQL Editor
   ALTER TABLE report_configurations
   ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT true NOT NULL;
   ```

2. **Deploy the updated code:**

   - Backend changes are backward compatible
   - Frontend will show the new toggle controls
   - Existing configurations will be enabled by default

3. **Verify the feature:**
   - Check that existing configurations show as "Enabled"
   - Test toggling configurations on/off
   - Verify that disabled configurations don't generate automatic reports

## Technical Notes

- The `enabled` field is required in the database but optional in API calls
- Default value ensures backward compatibility
- Scheduler query includes `WHERE enabled = true` filter
- Frontend gracefully handles configurations without the enabled field (treats as enabled)
