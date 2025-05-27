# Testing Tools

This directory contains tools to help test and develop the Git Report application.

## Webhook Test Server

A simple Express server to receive and display webhook payloads for testing.

### Usage

```bash
# Start the webhook test server
pnpm webhook:test

# Or with custom port
WEBHOOK_PORT=4000 pnpm webhook:test
```

### Features

- **Receives webhooks** at `POST /webhook`
- **Health check** at `GET /health`
- **Pretty logging** with timestamps
- **JSON payload display** for debugging
- **Automatic response** to confirm receipt

### Example Output

```
[2024-01-15T10:30:00.000Z] 🚀 Webhook test server running on http://localhost:3002
[2024-01-15T10:30:00.000Z] 📡 Webhook URL: http://localhost:3002/webhook
[2024-01-15T10:30:00.000Z] 💚 Health check: http://localhost:3002/health
[2024-01-15T10:30:00.000Z] ────────────────────────────────────────────────────────────────────────────────
[2024-01-15T10:30:00.000Z] Waiting for webhooks...

[2024-01-15T10:31:15.000Z] 🎯 Webhook received!
[2024-01-15T10:31:15.000Z] Headers:
{
  "content-type": "application/json",
  "user-agent": "Git-Report-AI/1.0.0"
}
[2024-01-15T10:31:15.000Z] Body:
{
  "repository": "user/repo",
  "branch": "main",
  "summary": "AI-generated commit summary...",
  "commits": [...]
}
```

### Testing Your Setup

1. **Start the webhook server:**

   ```bash
   pnpm webhook:test
   ```

2. **Use the webhook URL in your report configuration:**

   ```
   http://localhost:3002/webhook
   ```

3. **Create a test report configuration** in your Git Report dashboard

4. **Watch the console** for incoming webhook payloads

### Environment Variables

- `WEBHOOK_PORT` - Port to run the server on (default: 3002)

### Endpoints

- `POST /webhook` - Receives webhook payloads
- `GET /health` - Health check endpoint
- `GET /*` - Returns 404 with available endpoints

### Tips

- Keep this server running while testing your Git Report application
- Use different ports if you need multiple webhook endpoints
- The server automatically responds with 200 OK to all webhook requests
- Check the console output to see the full webhook payload structure
