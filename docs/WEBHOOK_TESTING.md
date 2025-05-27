# Webhook Testing & Date Range Logic

## Webhook Testing Feature

The Git Report AI application includes a webhook testing feature that allows you to manually trigger report generation and webhook delivery for any configured report configuration.

### How to Test Webhooks

1. **Navigate to your dashboard** and find the report configuration you want to test
2. **Click the test tube icon** (🧪) next to the configuration
3. **Wait for the test to complete** - you'll see a loading spinner while the test runs
4. **View the results** - a colored banner will appear showing:
   - Success/failure status
   - Number of commits found
   - Any error messages

### Test Webhook Behavior

When you trigger a webhook test:

- **Date Range**: Always fetches commits from the last 7 days (regardless of schedule)
- **Webhook Payload**: Includes `[TEST]` prefix in the content
- **Metadata**: Includes `"isTest": true` in the webhook payload
- **No State Changes**: Does not update the `last_run_timestamp` of the configuration

### Webhook Payload Structure

When a webhook is sent (both for tests and scheduled reports), it includes:

```json
{
  "content": "AI-generated commit summary...",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "repository": "https://github.com/user/repo",
  "branch": "main",
  "commitsCount": 15,
  "dateRange": {
    "since": "2024-01-08T10:30:00.000Z",
    "until": "2024-01-15T10:30:00.000Z"
  },
  "isTest": false
}
```

## Date Range Logic for Commit Fetching

### How Date Ranges Are Calculated

The system uses intelligent date range calculation based on the schedule type and previous run history:

#### First Run (No Previous Execution)

When a report configuration runs for the first time:

- **Daily schedules** (`0 9 * * *`): Fetches commits from 1 day ago
- **Weekly schedules** (`0 9 * * 1`): Fetches commits from 7 days ago
- **Custom schedules**: Defaults to 1 day ago

#### Subsequent Runs

For configurations that have run before:

- **Always fetches commits since the last successful run**
- Uses the `last_run_timestamp` from the database
- Ensures no commits are missed between runs

### Schedule Type Detection

The system automatically detects schedule types using cron expression analysis:

#### Daily Schedules

- Pattern: `* * * * *` where day-of-month and day-of-week are `*`
- Examples:
  - `0 9 * * *` - Daily at 9:00 AM
  - `30 8 * * *` - Daily at 8:30 AM
  - `0 */6 * * *` - Every 6 hours

#### Weekly Schedules

- Pattern: `* * * * X` where day-of-week is not `*`
- Examples:
  - `0 9 * * 1` - Weekly on Monday at 9:00 AM
  - `0 9 * * MON` - Weekly on Monday at 9:00 AM
  - `30 8 * * 5` - Weekly on Friday at 8:30 AM

#### Custom Schedules

- Any other cron pattern defaults to daily behavior
- Examples:
  - `0 9 1 * *` - Monthly on the 1st at 9:00 AM
  - `0 9 * * 1-5` - Weekdays at 9:00 AM

### Example Scenarios

#### Scenario 1: New Daily Configuration

```
Schedule: "0 9 * * *" (Daily at 9 AM)
First run: 2024-01-15 09:00
Date range: 2024-01-14 09:00 → 2024-01-15 09:00
```

#### Scenario 2: Existing Weekly Configuration

```
Schedule: "0 9 * * 1" (Weekly on Monday)
Last run: 2024-01-08 09:00
Current run: 2024-01-15 09:00
Date range: 2024-01-08 09:00 → 2024-01-15 09:00
```

#### Scenario 3: Webhook Test

```
Any schedule
Test triggered: 2024-01-15 14:30
Date range: 2024-01-08 14:30 → 2024-01-15 14:30 (always 7 days)
```

## Best Practices

### Setting Up Webhook Endpoints

1. **Use HTTPS** for production webhook URLs
2. **Implement proper error handling** for webhook failures
3. **Log webhook payloads** for debugging
4. **Validate webhook signatures** if implementing authentication

### Testing Recommendations

1. **Test webhooks before going live** using the test feature
2. **Use the provided webhook test server** during development
3. **Verify date ranges** match your expectations
4. **Check commit counts** to ensure proper filtering

### Troubleshooting

#### No Commits Found

- Check if there were actually commits in the date range
- Verify the repository branch is correct
- Ensure the GitHub PAT has proper permissions

#### Webhook Failures

- Verify the webhook URL is accessible
- Check for network connectivity issues
- Review webhook endpoint logs for errors
- Test with the provided webhook test server

#### Incorrect Date Ranges

- Review the cron schedule format
- Check the `last_run_timestamp` in the database
- Consider the timezone settings of your server

## API Endpoints

### Test Webhook

```http
POST /report-configurations/{id}/test
Authorization: Bearer <supabase-jwt>
```

**Response:**

```json
{
  "success": true,
  "message": "Test webhook sent successfully",
  "commitsFound": 15,
  "webhookSent": true,
  "dateRange": {
    "since": "2024-01-08T14:30:00.000Z",
    "until": "2024-01-15T14:30:00.000Z"
  }
}
```
