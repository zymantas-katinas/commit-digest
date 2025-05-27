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
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

Then run the `init.sql` script again.
