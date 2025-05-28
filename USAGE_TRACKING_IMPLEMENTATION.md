# Usage Tracking & Billing Implementation

This document outlines the comprehensive usage tracking and billing system implemented for the git-report project.

## Overview

The system now tracks every report generation run in detail, enabling:

- Monthly usage limits (50 successful runs per month for free tier)
- Token consumption and cost tracking
- Detailed audit trail of all report generations
- Usage statistics dashboard for users

## Database Changes

### New Table: `report_runs`

A comprehensive table that tracks every report generation attempt:

```sql
CREATE TABLE report_runs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  repository_id UUID REFERENCES repositories(id),
  report_configuration_id UUID REFERENCES report_configurations(id),

  -- Run metadata
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('running', 'success', 'failed', 'cancelled')),

  -- Configuration snapshot (for historical tracking)
  configuration_snapshot JSONB,

  -- AI/LLM usage tracking
  tokens_used INTEGER DEFAULT 0,
  model_used TEXT,
  cost_usd DECIMAL(10, 6) DEFAULT 0,

  -- Git data
  commits_processed INTEGER DEFAULT 0,
  commit_range_from TEXT,
  commit_range_to TEXT,

  -- Output
  report_content TEXT,
  report_format TEXT DEFAULT 'markdown',

  -- Error tracking
  error_message TEXT,
  error_code TEXT,

  -- Delivery tracking
  webhook_delivered BOOLEAN DEFAULT FALSE,
  webhook_delivery_attempts INTEGER DEFAULT 0,
  webhook_last_attempt_at TIMESTAMP WITH TIME ZONE,
  webhook_response_status INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### New View: `user_monthly_usage`

Aggregates monthly statistics per user:

- Total runs
- Successful vs failed runs
- Total tokens consumed
- Total cost in USD
- Last run timestamp

### New Function: `check_monthly_usage_limit()`

PostgreSQL function that checks if a user has exceeded their monthly limit:

- Takes user ID and limit (default 50) as parameters
- Returns boolean indicating if user can run more reports
- Only counts successful runs against the limit

## Backend Implementation

### New Service: `ReportRunsService`

Handles all report run tracking operations:

```typescript
class ReportRunsService {
  // Check if user can run more reports
  async checkUsageLimit(userId: string, limit: number = 50): Promise<boolean>;

  // Get monthly usage statistics
  async getMonthlyUsage(userId: string): Promise<MonthlyUsage | null>;

  // Create new report run record
  async createReportRun(data: CreateReportRunData): Promise<ReportRun>;

  // Update existing report run
  async updateReportRun(
    runId: string,
    userId: string,
    updates: UpdateReportRunData,
  ): Promise<ReportRun>;

  // Mark run as successful with metrics
  async markRunAsSuccess(
    runId: string,
    userId: string,
    data: SuccessData,
  ): Promise<ReportRun>;

  // Mark run as failed with error details
  async markRunAsFailed(
    runId: string,
    userId: string,
    errorMessage: string,
    errorCode?: string,
  ): Promise<ReportRun>;

  // Update webhook delivery status
  async updateWebhookDelivery(
    runId: string,
    userId: string,
    delivered: boolean,
    responseStatus?: number,
  ): Promise<ReportRun>;

  // Get user's report runs with pagination
  async getReportRunsByUserId(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<ReportRun[]>;

  // Get specific report run
  async getReportRunById(
    runId: string,
    userId: string,
  ): Promise<ReportRun | null>;
}
```

### Updated Services

#### `SchedulerService`

- Now checks usage limits before processing any report configuration
- Creates report run record at the start of each generation
- Tracks tokens used, cost, and processing details
- Updates run status throughout the process
- Handles webhook delivery tracking

#### `LLMService`

- Updated to return detailed usage information:
  ```typescript
  interface LLMSummaryResult {
    summary: string;
    tokensUsed: number;
    costUsd: number;
    model: string;
  }
  ```
- Estimates token usage and calculates costs based on GPT-4o-mini pricing
- Provides fallback values for error cases

### New Controller: `ReportRunsController`

Provides API endpoints for usage tracking:

```typescript
// Get user's report runs with pagination
GET /report-runs?limit=50&offset=0

// Get current month's usage statistics
GET /report-runs/usage

// Get specific report run details
GET /report-runs/:id
```

### Updated Controller: `ReportConfigurationsController`

The test webhook endpoint now includes usage information:

- Returns tokens used and cost for test runs
- Provides detailed metrics for debugging

## Frontend Implementation

### New Component: `UsageStats`

A comprehensive React component that displays:

- Monthly usage progress bar with visual indicators
- Remaining runs counter
- Detailed statistics (successful/failed runs, tokens, cost)
- Usage alerts when approaching or exceeding limits
- Last run timestamp

Features:

- Real-time usage data fetching
- Visual progress indicators with color coding
- Alert messages for limit warnings
- Responsive grid layout for statistics
- Loading and error states

## API Endpoints

### Report Runs

- `GET /report-runs` - List user's report runs (paginated)
- `GET /report-runs/usage` - Get monthly usage statistics
- `GET /report-runs/:id` - Get specific report run details

### Usage Statistics Response

```json
{
  "monthlyUsage": {
    "user_id": "uuid",
    "month": "2024-01-01T00:00:00.000Z",
    "total_runs": 25,
    "successful_runs": 23,
    "failed_runs": 2,
    "total_tokens": 15420,
    "total_cost_usd": 0.0234,
    "last_run_at": "2024-01-15T10:30:00.000Z"
  },
  "canRunMore": true,
  "monthlyLimit": 50
}
```

## Usage Limits & Billing Logic

### Free Tier Limits

- 50 successful report runs per month
- Failed runs don't count against the limit
- Test webhook runs currently don't count (can be changed)
- Limits reset on the 1st of each month

### Cost Tracking

- Tracks actual token usage from OpenAI API
- Calculates costs based on current GPT-4o-mini pricing:
  - Input tokens: $0.00015 per 1K tokens
  - Output tokens: $0.0006 per 1K tokens
- Stores costs in USD with 6 decimal precision

### Usage Enforcement

- Scheduler checks limits before processing any configuration
- Users are blocked from running reports when limit is exceeded
- Clear error messages indicate when limits are reached
- Frontend shows usage warnings at 80% of limit

## Security & Privacy

### Row Level Security (RLS)

- All tables have RLS enabled
- Users can only access their own data
- Policies enforce user isolation at the database level

### Data Protection

- Configuration snapshots stored for audit purposes
- Error messages logged for debugging
- Webhook delivery status tracked for reliability

## Migration Instructions

1. **Run the database migration:**

   ```sql
   -- In Supabase SQL Editor
   \i database/migration_add_report_runs_table.sql
   ```

2. **Update environment variables:**

   - Ensure `OPENAI_API_KEY` is set for cost tracking
   - Verify Supabase credentials are configured

3. **Deploy backend changes:**

   - New services and controllers are automatically included
   - No additional configuration required

4. **Update frontend:**
   - Add `UsageStats` component to dashboard
   - Import and use in appropriate pages

## Monitoring & Analytics

The system now provides comprehensive data for:

- User engagement tracking
- Cost analysis and optimization
- Error rate monitoring
- Usage pattern analysis
- Revenue optimization (for future paid tiers)

## Future Enhancements

Potential improvements:

- Real-time usage notifications
- Usage-based pricing tiers
- Advanced analytics dashboard
- Usage prediction and recommendations
- Automated billing integration
- Custom usage limits per user
- Usage export functionality

## Testing

To test the implementation:

1. **Create a report configuration**
2. **Trigger a test webhook** - should show token usage and cost
3. **Check usage statistics** - should reflect the test run
4. **Approach the monthly limit** - should show warnings
5. **Exceed the limit** - should prevent further runs

The system is now ready for production use with comprehensive usage tracking and billing capabilities.
