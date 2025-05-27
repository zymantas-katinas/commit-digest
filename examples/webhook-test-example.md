# Webhook Testing Example

This example demonstrates how to test the webhook functionality end-to-end.

## Step 1: Start the Webhook Test Server

First, start the provided webhook test server to receive webhook payloads:

```bash
# In the git-report directory
pnpm webhook:test
```

You should see output like:

```
[2024-01-15T10:30:00.000Z] 🚀 Webhook test server running on http://localhost:3002
[2024-01-15T10:30:00.000Z] 📡 Webhook URL: http://localhost:3002/webhook
[2024-01-15T10:30:00.000Z] 💚 Health check: http://localhost:3002/health
[2024-01-15T10:30:00.000Z] ────────────────────────────────────────────────────────────────────────────────
[2024-01-15T10:30:00.000Z] Waiting for webhooks...
```

## Step 2: Configure Your Report

1. **Start the application**:

   ```bash
   pnpm dev
   ```

2. **Open the dashboard** at `http://localhost:3000`

3. **Add a repository** with your GitHub PAT

4. **Create a report configuration** with:
   - Repository: Select your added repository
   - Schedule: Choose any schedule (e.g., "Daily at 9:00 AM")
   - Webhook URL: `http://localhost:3002/webhook`

## Step 3: Test the Webhook

1. **Find your report configuration** in the dashboard
2. **Click the test tube icon** (🧪) next to the configuration
3. **Wait for the test to complete** - you'll see a loading spinner
4. **Check the results** in both places:
   - Dashboard: Success/failure banner with commit count
   - Webhook server console: Detailed payload information

## Expected Webhook Payload

When the test succeeds, you should see a payload like this in the webhook server console:

```json
{
  "content": "[TEST] ## Weekly Commit Summary\n\n### Repository Activity\n\nThis week, the repository saw 5 commits across 3 files...",
  "timestamp": "2024-01-15T10:31:15.000Z",
  "repository": "https://github.com/user/repo",
  "branch": "main",
  "commitsCount": 5,
  "dateRange": {
    "since": "2024-01-08T10:31:15.000Z",
    "until": "2024-01-15T10:31:15.000Z"
  },
  "isTest": true
}
```

## Understanding the Results

### Success Scenarios

- **Green banner**: "Test webhook sent successfully"
- **Commit count**: Shows number of commits found in the last 7 days
- **Webhook server**: Displays the full payload with AI-generated summary

### Common Issues

#### "No commits found in the last 7 days"

- **Cause**: Repository has no recent activity
- **Solution**: This is normal for inactive repositories
- **Result**: Webhook is still sent with empty commit summary

#### "Test webhook failed to send"

- **Cause**: Webhook URL is unreachable
- **Solutions**:
  - Verify the webhook test server is running
  - Check the webhook URL is correct
  - Ensure no firewall is blocking the connection

#### "Repository not found" or "Access denied"

- **Cause**: GitHub PAT issues
- **Solutions**:
  - Verify the PAT has repository access
  - Check the repository URL is correct
  - Ensure the PAT hasn't expired

## Production Webhook Setup

For production use, replace `http://localhost:3002/webhook` with your actual webhook endpoint:

### Example: Discord Webhook

```
https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

### Example: Slack Webhook

```
https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### Example: Custom Server

```
https://your-server.com/api/git-reports
```

## Webhook Payload Processing

Here's an example of how to process the webhook payload in your own server:

### Node.js/Express Example

```javascript
app.post("/webhook", express.json(), (req, res) => {
  const { content, repository, branch, commitsCount, dateRange, isTest } =
    req.body;

  console.log(
    `Received ${isTest ? "test " : ""}report for ${repository}/${branch}`,
  );
  console.log(
    `Commits: ${commitsCount}, Period: ${dateRange.since} to ${dateRange.until}`,
  );
  console.log(`Summary: ${content}`);

  // Process the report (send to chat, save to database, etc.)

  res.status(200).json({ received: true });
});
```

### Python/Flask Example

```python
@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.json

    print(f"Received {'test ' if data.get('isTest') else ''}report")
    print(f"Repository: {data['repository']}/{data['branch']}")
    print(f"Commits: {data['commitsCount']}")
    print(f"Summary: {data['content']}")

    # Process the report

    return {'received': True}
```

## Next Steps

1. **Set up your production webhook endpoint**
2. **Update the webhook URL** in your report configuration
3. **Test again** to ensure everything works
4. **Wait for scheduled reports** or continue testing manually
5. **Monitor webhook delivery** through the dashboard status indicators
