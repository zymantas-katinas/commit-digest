# Database Setup for Git Report

This directory contains the SQL scripts needed to initialize your Supabase database.

## Setup Instructions

### 1. Access Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar

### 2. Run the Initialization Script

1. Click **New Query** in the SQL Editor
2. Copy the entire contents of `init.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute the script

### 3. Verify Setup

After running the script, you should see:

- Two new tables: `repositories` and `report_configurations`
- Row Level Security (RLS) enabled on both tables
- Proper indexes for performance
- Triggers for automatic `updated_at` timestamps

### 4. Check Tables

You can verify the tables were created by running:

```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('repositories', 'report_configurations')
ORDER BY table_name;
```

## Database Schema

### `repositories` Table

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `github_url` (Text)
- `branch` (Text, default: 'main')
- `encrypted_access_token` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### `report_configurations` Table

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `repository_id` (UUID, Foreign Key to repositories)
- `schedule` (Text) - Cron expression
- `webhook_url` (Text)
- `last_run_at` (Timestamp, Nullable)
- `last_run_status` (Text, Nullable)
- `last_run_content` (Text, Nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### `report_runs` Table

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `repository_id` (UUID, Foreign Key to repositories)
- `status` (Text)
- `error_details` (Text, Nullable)
- `webhook_delivery_status` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Foreign Key Constraints**: Ensures data integrity
- **Cascade Deletes**: When a user is deleted, their data is automatically removed
- **Automatic Timestamps**: `updated_at` is automatically updated on record changes

## Troubleshooting

### Common Issues

1. **Permission Denied**: Make sure you're using the correct Supabase project and have admin access
2. **Table Already Exists**: The script uses `IF NOT EXISTS` so it's safe to run multiple times
3. **RLS Policies**: If you get permission errors, check that RLS policies are correctly applied

### Reset Database (if needed)

If you need to start fresh:

```sql
-- WARNING: This will delete all data!
DROP TABLE IF EXISTS report_configurations CASCADE;
DROP TABLE IF EXISTS repositories CASCADE;
DROP TABLE IF EXISTS report_runs CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

Then run the `init.sql` script again.

## Git Report Database

This directory contains the database schema and migrations for the Git Report application.

### Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:

#### Core Tables

1. **repositories** - Stores GitHub repository connections

   - User's connected repositories with encrypted access tokens
   - Branch information and metadata

2. **report_configurations** - Stores report generation settings

   - Scheduling configuration (cron expressions)
   - Webhook URLs for delivery
   - Last run status and content

3. **report_runs** - Tracks each report generation execution
   - Detailed logging of each report run
   - Usage tracking (tokens, cost, processing time)
   - Success/failure status and error details
   - Webhook delivery status

#### Usage Tracking & Billing

The `report_runs` table enables comprehensive usage tracking:

- **Tokens Used**: Tracks AI/LLM token consumption per run
- **Cost Tracking**: Calculates cost in USD based on model pricing
- **Monthly Limits**: Built-in function to check if user has exceeded monthly limits (default: 50 successful runs/month)
- **Historical Data**: Complete audit trail of all report generations

#### Views and Functions

- **user_monthly_usage** - Aggregated monthly statistics per user
- **check_monthly_usage_limit()** - Function to verify if user can run more reports

### Setup Instructions

1. **Initial Setup**

   ```sql
   -- Run in Supabase SQL Editor
   \i database/init.sql
   ```

2. **Apply Migrations**

   ```sql
   -- Add enabled field to report configurations
   \i database/migration_add_enabled_to_report_configurations.sql

   -- Add name field to report configurations
   \i database/migration_add_name_to_report_configurations.sql

   -- Add report runs tracking (REQUIRED for usage limits)
   \i database/migration_add_report_runs_table.sql
   ```

### Usage Tracking Features

#### Monthly Usage Limits

- Free tier users are limited to 50 successful report runs per month
- Usage is tracked automatically when reports are generated
- Failed runs don't count against the limit
- Test webhook runs don't count against the limit (currently)

#### API Endpoints

- `GET /report-runs` - List user's report runs with pagination
- `GET /report-runs/usage` - Get current month's usage statistics
- `GET /report-runs/:id` - Get details of a specific report run

#### Usage Statistics Include:

- Total runs this month
- Successful vs failed runs
- Total tokens consumed
- Total cost in USD
- Last run timestamp
- Whether user can run more reports

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data:

- Users can only see their own repositories
- Users can only see their own report configurations
- Users can only see their own report runs
- Monthly usage view is filtered by user

### Indexes

Performance indexes are created for:

- User-based queries
- Date-based queries (for usage tracking)
- Status-based queries
- Monthly aggregation queries

### Environment Variables

Make sure these are set in your environment:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for server-side operations
- `OPENAI_API_KEY` - For AI-powered commit summarization

### Migration History

1. `init.sql` - Initial schema with repositories and report_configurations
2. `migration_add_enabled_to_report_configurations.sql` - Added enabled field
3. `migration_add_name_to_report_configurations.sql` - Added name field
4. `migration_add_report_runs_table.sql` - Added comprehensive usage tracking
