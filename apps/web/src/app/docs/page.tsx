import { AlertCircle, CheckCircle, Info, Zap } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";

export default function DocsPage() {
  return (
    <SiteLayout>
      <div className="container max-w-screen-xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-16">
              <nav className="space-y-2">
                <div className="pb-2">
                  <h3 className="font-semibold text-sm text-foreground mb-2">
                    Getting Started
                  </h3>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <a
                        href="#introduction"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Introduction
                      </a>
                    </li>
                    <li>
                      <a
                        href="#quick-start"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Quick Start Guide
                      </a>
                    </li>
                    <li>
                      <a
                        href="#account-setup"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Account Setup
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="pb-2">
                  <h3 className="font-semibold text-sm text-foreground mb-2">
                    Core Features
                  </h3>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <a
                        href="#connecting-repositories"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Connecting Repositories
                      </a>
                    </li>
                    <li>
                      <a
                        href="#configuring-reports"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Configuring Reports
                      </a>
                    </li>
                    <li>
                      <a
                        href="#understanding-summaries"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Understanding AI Summaries
                      </a>
                    </li>
                    <li>
                      <a
                        href="#usage-limits"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Usage Limits
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="pb-2">
                  <h3 className="font-semibold text-sm text-foreground mb-2">
                    Webhook Integration
                  </h3>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <a
                        href="#receiving-reports"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Receiving Reports
                      </a>
                    </li>
                    <li>
                      <a
                        href="#platform-examples"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Platform Examples
                      </a>
                    </li>
                    <li>
                      <a
                        href="#delivery-retries"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Delivery & Retries
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="pb-2">
                  <h3 className="font-semibold text-sm text-foreground mb-2">
                    Support
                  </h3>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <a
                        href="#troubleshooting"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Troubleshooting
                      </a>
                    </li>
                    <li>
                      <a
                        href="#faq"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        FAQ
                      </a>
                    </li>
                    <li>
                      <a
                        href="#security"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Security
                      </a>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              {/* Introduction */}
              <section id="introduction" className="mb-12">
                <h1 className="text-4xl font-bold mb-6">
                  CommitDigest Documentation
                </h1>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        What is CommitDigest?
                      </h3>
                      <p className="text-blue-800 dark:text-blue-200 mb-0">
                        CommitDigest is an AI-powered Git commit summarization
                        and reporting tool that automatically generates
                        intelligent summaries of your repository's commit
                        activity. It helps developers, team leads, and project
                        managers stay informed about code progress without
                        manually reviewing commit logs.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-lg text-muted-foreground mb-4">
                  Save time on manual log reviews and improve team awareness of
                  development progress with automated, AI-generated commit
                  summaries delivered directly to your preferred communication
                  channels.
                </p>

                <h3 className="text-xl font-semibold mb-3">
                  Who is CommitDigest for?
                </h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    <strong>Developers</strong> who want to track progress
                    across multiple repositories
                  </li>
                  <li>
                    <strong>Team Leads</strong> who need regular updates on team
                    productivity
                  </li>
                  <li>
                    <strong>Project Managers</strong> who require high-level
                    summaries of development activity
                  </li>
                  <li>
                    <strong>DevOps Teams</strong> who want to monitor
                    deployment-related changes
                  </li>
                </ul>
              </section>

              {/* Quick Start Guide */}
              <section id="quick-start" className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Quick Start Guide</h2>

                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                      Get your first report in 4 steps
                    </h3>
                  </div>
                </div>

                <ol className="list-decimal list-inside space-y-4 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Sign Up</strong> for a
                    CommitDigest account using your email
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Connect your GitHub Repository
                    </strong>{" "}
                    by providing the repository URL and a Personal Access Token
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Configure a Report Schedule & Webhook
                    </strong>{" "}
                    to receive summaries daily, weekly, or monthly
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Receive your first AI-generated summary
                    </strong>{" "}
                    via webhook to your preferred platform
                  </li>
                </ol>
              </section>

              {/* Account Setup */}
              <section id="account-setup" className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Account Setup</h2>

                <h3 className="text-xl font-semibold mb-3">
                  Creating Your Account
                </h3>
                <p className="text-muted-foreground mb-4">
                  CommitDigest uses secure email/password authentication powered
                  by Supabase. Simply provide your email address and create a
                  strong password to get started.
                </p>

                <h3 className="text-xl font-semibold mb-3">
                  Dashboard Overview
                </h3>
                <p className="text-muted-foreground mb-4">
                  Once logged in, your dashboard provides access to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>
                    <strong>Repositories</strong> - Manage your connected GitHub
                    repositories
                  </li>
                  <li>
                    <strong>Report Configurations</strong> - Set up and manage
                    automated report schedules
                  </li>
                  <li>
                    <strong>Usage Statistics</strong> - Monitor your monthly
                    usage and remaining report runs
                  </li>
                </ul>
              </section>

              {/* Connecting Repositories */}
              <section id="connecting-repositories" className="mb-12">
                <h2 className="text-3xl font-bold mb-6">
                  Connecting Repositories
                </h2>

                <h3 className="text-xl font-semibold mb-3">
                  GitHub Integration
                </h3>
                <p className="text-muted-foreground mb-4">
                  CommitDigest currently supports GitHub repositories (both
                  public and private). To connect a repository:
                </p>

                <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-6">
                  <li>Click the "+" button in the Repositories section</li>
                  <li>
                    Enter your GitHub repository URL (e.g.,{" "}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono">
                      https://github.com/username/repo
                    </code>
                    )
                  </li>
                  <li>
                    Specify the branch to monitor (usually{" "}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono">
                      main
                    </code>{" "}
                    or{" "}
                    <code className="bg-muted px-1 py-0.5 rounded font-mono">
                      master
                    </code>
                    )
                  </li>
                  <li>Provide a Personal Access Token (PAT)</li>
                </ol>

                <h3 className="text-xl font-semibold mb-3">
                  Personal Access Tokens (PATs)
                </h3>

                <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                        Security Best Practices
                      </h4>
                      <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-0">
                        Always set an expiration date for your PATs and use the
                        minimum required scopes. Never share your tokens with
                        others.
                      </p>
                    </div>
                  </div>
                </div>

                <h4 className="text-lg font-semibold mb-2">
                  Creating a GitHub PAT
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                  <li>
                    Go to GitHub Settings → Developer settings → Personal access
                    tokens → Tokens (classic)
                  </li>
                  <li>Click "Generate new token (classic)"</li>
                  <li>Set an expiration date (recommended: 90 days or less)</li>
                  <li>Select the required scopes:</li>
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded font-mono">
                        repo
                      </code>{" "}
                      - For private repositories
                    </li>
                    <li>
                      <code className="bg-muted px-1 py-0.5 rounded font-mono">
                        public_repo
                      </code>{" "}
                      - For public repositories only
                    </li>
                  </ul>
                  <li>Generate and copy the token immediately</li>
                </ol>

                <h4 className="text-lg font-semibold mb-2">
                  How CommitDigest Protects Your PAT
                </h4>
                <p className="text-muted-foreground mb-4">
                  Your Personal Access Token is encrypted at rest using
                  industry-standard encryption. CommitDigest only uses your PAT
                  to read commit information and never accesses your source
                  code.
                </p>

                <h4 className="text-lg font-semibold mb-2">
                  Troubleshooting Connection Issues
                </h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    <strong>Invalid PAT:</strong> Ensure your token has the
                    correct scopes and hasn't expired
                  </li>
                  <li>
                    <strong>Repository not found:</strong> Verify the URL is
                    correct and your PAT has access to the repository
                  </li>
                  <li>
                    <strong>Branch not found:</strong> Check that the specified
                    branch exists in your repository
                  </li>
                </ul>
              </section>

              {/* Configuring Reports */}
              <section id="configuring-reports" className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Configuring Reports</h2>

                <p className="text-muted-foreground mb-4">
                  After connecting a repository, you can create automated report
                  configurations that will generate and deliver AI summaries on
                  your chosen schedule.
                </p>

                <h3 className="text-xl font-semibold mb-3">
                  Creating a Report Configuration
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-6">
                  <li>
                    Click "Add Report Configuration" in the main dashboard
                  </li>
                  <li>Give your configuration a descriptive name</li>
                  <li>Select the repository to monitor</li>
                  <li>Choose your preferred schedule</li>
                  <li>Enter your webhook URL</li>
                  <li>Save and enable the configuration</li>
                </ol>

                <h3 className="text-xl font-semibold mb-3">
                  Scheduling Options
                </h3>
                <div className="space-y-4 mb-6">
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Daily Reports</h4>
                    <p className="text-muted-foreground text-sm">
                      Generated once per day at 9:00 AM UTC, summarizing commits
                      from the previous 24 hours.
                    </p>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Weekly Reports</h4>
                    <p className="text-muted-foreground text-sm">
                      Generated every Monday at 9:00 AM UTC, summarizing commits
                      from the previous 7 days.
                    </p>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Monthly Reports</h4>
                    <p className="text-muted-foreground text-sm">
                      Generated on the 1st of each month at 9:00 AM UTC,
                      summarizing commits from the previous month.
                    </p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  Webhook Configuration
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your webhook URL is where CommitDigest will send the generated
                  reports. This should be a publicly accessible HTTPS endpoint
                  that can receive POST requests.
                </p>

                <h3 className="text-xl font-semibold mb-3">
                  Managing Configurations
                </h3>
                <p className="text-muted-foreground mb-4">
                  From your dashboard, you can:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                  <li>
                    <strong>Test</strong> configurations to verify webhook
                    delivery
                  </li>
                  <li>
                    <strong>Manually trigger</strong> reports for custom date
                    ranges
                  </li>
                  <li>
                    <strong>Edit</strong> schedules, webhook URLs, or names
                    using the actions menu (⋯)
                  </li>
                  <li>
                    <strong>Enable/disable</strong> configurations with the
                    toggle switch
                  </li>
                  <li>
                    <strong>Delete</strong> configurations you no longer need
                  </li>
                </ul>
              </section>

              {/* Understanding AI Summaries */}
              <section id="understanding-summaries" className="mb-12">
                <h2 className="text-3xl font-bold mb-6">
                  Understanding Your AI Summaries
                </h2>

                <h3 className="text-xl font-semibold mb-3">
                  What the AI Analyzes
                </h3>
                <p className="text-muted-foreground mb-4">
                  CommitDigest's AI analyzes commit messages, file changes, and
                  metadata to extract and summarize:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                  <li>New features and enhancements</li>
                  <li>Bug fixes and patches</li>
                  <li>Refactoring and code improvements</li>
                  <li>Documentation updates</li>
                  <li>Configuration and dependency changes</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">Report Format</h3>
                <p className="text-muted-foreground mb-4">
                  All reports are generated in Markdown format for easy
                  readability and integration with various platforms. A typical
                  report includes:
                </p>

                <div className="bg-muted rounded-lg p-4 mb-4">
                  <pre className="text-sm overflow-x-auto font-mono">
                    {`# Commit Digest for repository-name

## Summary
Brief overview of the period's activity

## New Features
- Feature A: Description (commit: abc1234)
- Feature B: Description (commit: def5678)

## Bug Fixes
- Fixed issue X (commit: ghi9012)
- Resolved problem Y (commit: jkl3456)

## Other Changes
- Updated documentation
- Refactored component Z`}
                  </pre>
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  Tips for Better Summaries
                </h3>
                <p className="text-muted-foreground mb-4">
                  To help the AI generate more accurate summaries:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                  <li>Write clear, descriptive commit messages</li>
                  <li>Use conventional commit formats when possible</li>
                  <li>Include context about why changes were made</li>
                  <li>Mention issue numbers or ticket references</li>
                </ul>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        AI Limitations
                      </h4>
                      <p className="text-blue-800 dark:text-blue-200 text-sm mb-0">
                        While our AI provides powerful summaries, it may
                        occasionally miss nuances or require context not present
                        in commit messages alone. The summaries are designed to
                        complement, not replace, human review.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Usage Limits */}
              <section id="usage-limits" className="mb-12">
                <h2 className="text-3xl font-bold mb-6">
                  Usage Limits & Tracking
                </h2>

                <h3 className="text-xl font-semibold mb-3">Free Tier Limits</h3>
                <p className="text-muted-foreground mb-4">
                  CommitDigest offers a generous free tier with the following
                  limits:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                  <li>
                    <strong>50 successful report runs per month</strong>
                  </li>
                  <li>Failed runs don't count against your limit</li>
                  <li>Test webhook runs don't count against your limit</li>
                  <li>Limits reset on the 1st of each month</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">Usage Tracking</h3>
                <p className="text-muted-foreground mb-4">
                  Your dashboard includes a real-time usage statistics widget
                  that shows:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                  <li>Current month's usage progress</li>
                  <li>Remaining runs available</li>
                  <li>Total successful and failed runs</li>
                  <li>Visual progress bar with color-coded warnings</li>
                </ul>

                <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                        Usage Alerts
                      </h4>
                      <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-0">
                        You'll see warnings when you reach 80% of your monthly
                        limit, and reports will be blocked when you exceed 100%
                        until the next month.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Receiving Reports */}
              <section id="receiving-reports" className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Receiving Reports</h2>

                <h3 className="text-xl font-semibold mb-3">
                  Webhook Payload Structure
                </h3>
                <p className="text-muted-foreground mb-4">
                  CommitDigest sends reports as HTTP POST requests with the
                  following JSON payload:
                </p>

                <div className="bg-muted rounded-lg p-4 mb-6">
                  <pre className="text-sm overflow-x-auto font-mono">
                    {`{
  "content": "AI-generated commit summary...",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "repository": "https://github.com/user/repo",
  "branch": "main",
  "commitsCount": 15,
  "dateRange": {
    "since": "2024-01-08T10:30:00.000Z",
    "until": "2024-01-15T10:30:00.000Z"
  },
  "isTest": false,
  "isManual": false
}`}
                  </pre>
                </div>

                <h3 className="text-xl font-semibold mb-3">Payload Fields</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                  <li>
                    <strong>content</strong> (string) - The AI-generated commit
                    summary/report
                  </li>
                  <li>
                    <strong>timestamp</strong> (string) - ISO timestamp when the
                    webhook was sent
                  </li>
                  <li>
                    <strong>repository</strong> (string, optional) - Repository
                    URL
                  </li>
                  <li>
                    <strong>branch</strong> (string, optional) - Branch name
                  </li>
                  <li>
                    <strong>commitsCount</strong> (number, optional) - Number of
                    commits included in the report
                  </li>
                  <li>
                    <strong>dateRange</strong> (object, optional) - Date range
                    used for commit fetching
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>
                        <strong>since</strong> (string) - ISO timestamp of start
                        date
                      </li>
                      <li>
                        <strong>until</strong> (string) - ISO timestamp of end
                        date
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>isTest</strong> (boolean, optional) - true if this
                    was triggered by manual testing
                  </li>
                  <li>
                    <strong>isManual</strong> (boolean, optional) - true if this
                    was triggered manually (outside of scheduled runs)
                  </li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">
                  Expected Endpoint Behavior
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your webhook endpoint should:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                  <li>Accept HTTP POST requests</li>
                  <li>Return a 2xx status code for successful receipt</li>
                  <li>
                    Process the JSON payload containing the Markdown report
                  </li>
                  <li>Be publicly accessible via HTTPS</li>
                </ul>
              </section>

              {/* Platform Examples */}
              <section id="platform-examples" className="mb-12">
                <h2 className="text-3xl font-bold mb-6">
                  Platform Integration Examples
                </h2>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Automatic Platform Detection
                      </h3>
                      <p className="text-blue-800 dark:text-blue-200 mb-0">
                        CommitDigest automatically detects your platform based
                        on the webhook URL and formats the payload accordingly.
                        Slack receives optimized blocks format with markdown
                        conversion, Discord gets standard markdown in the
                        content field, and generic endpoints receive a clean
                        content field with full metadata.
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  Slack Integration
                </h3>
                <p className="text-muted-foreground mb-4">
                  For Slack webhooks (detected automatically when URL contains
                  `hooks.slack.com`):
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Create a Slack app in your workspace</li>
                  <li>Add an incoming webhook to your desired channel</li>
                  <li>
                    Use the webhook URL directly in your CommitDigest
                    configuration
                  </li>
                </ol>

                <div className="bg-muted rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-2">Slack Payload Example:</h4>
                  <pre className="text-sm overflow-x-auto font-mono">
                    {`{
  "text": "Formatted markdown content...",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "# Weekly Report\\n\\n## Features\\n• Added user authentication\\n• Fixed bug in payments"
      }
    },
    {
      "type": "context", 
      "elements": [
        {
          "type": "mrkdwn",
          "text": "*Repository:* <https://github.com/user/repo|user/repo>"
        },
        {
          "type": "mrkdwn",
          "text": "*Branch:* main"
        },
        {
          "type": "mrkdwn", 
          "text": "*Commits:* 15"
        }
      ]
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}`}
                  </pre>
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  Discord Integration
                </h3>
                <p className="text-muted-foreground mb-4">
                  For Discord webhooks (detected automatically when URL contains
                  `discord.com/api/webhooks`):
                </p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                  <li>Create a webhook in your Discord server settings</li>
                  <li>
                    Use the webhook URL directly in your CommitDigest
                    configuration
                  </li>
                </ol>

                <div className="bg-muted rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-2">
                    Discord Payload Example:
                  </h4>
                  <pre className="text-sm overflow-x-auto font-mono">
                    {`{
  "content": "# Weekly Report\\n\\n## Features\\n- Added user authentication\\n- Fixed bug in payments\\n\\n**Repository:** https://github.com/user/repo\\n**Branch:** main\\n**Commits:** 15",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "repository": "https://github.com/user/repo",
  "branch": "main",
  "commitsCount": 15
}`}
                  </pre>
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  Generic/Custom Endpoints
                </h3>
                <p className="text-muted-foreground mb-4">
                  For custom endpoints or other platforms:
                </p>

                <div className="bg-muted rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-2">
                    Generic Payload Example:
                  </h4>
                  <pre className="text-sm overflow-x-auto font-mono">
                    {`{
  "content": "AI-generated commit summary...",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "repository": "https://github.com/user/repo", 
  "branch": "main",
  "commitsCount": 15,
  "dateRange": {
    "since": "2024-01-08T10:30:00.000Z",
    "until": "2024-01-15T10:30:00.000Z"
  }
}`}
                  </pre>
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  Platform-Specific Features
                </h3>
                <div className="space-y-4">
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Slack</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                      <li>
                        Markdown converted to Slack&apos;s format (headers
                        become bold, bullets become •)
                      </li>
                      <li>
                        Rich blocks format with metadata displayed in context
                        section
                      </li>
                      <li>Repository links become clickable</li>
                      <li>
                        Content limited to 4000 characters for Slack limits
                      </li>
                      <li>
                        Uses both `text` field (fallback) and `blocks` format
                      </li>
                    </ul>
                  </div>

                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Discord</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                      <li>Full markdown support preserved</li>
                      <li>Uses `content` field as expected by Discord</li>
                      <li>Metadata included as separate fields</li>
                      <li>No character limits imposed</li>
                    </ul>
                  </div>

                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Generic</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                      <li>Clean `content` field with raw markdown</li>
                      <li>Full metadata object included</li>
                      <li>No platform-specific formatting applied</li>
                      <li>Ideal for custom integrations and processing</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Delivery & Retries */}
              <section id="delivery-retries" className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Delivery & Retries</h2>

                <h3 className="text-xl font-semibold mb-3">Retry Policy</h3>
                <p className="text-muted-foreground mb-4">
                  If webhook delivery fails, CommitDigest will:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                  <li>Attempt redelivery up to 3 times</li>
                  <li>
                    Wait progressively longer between attempts (1min, 5min,
                    15min)
                  </li>
                  <li>
                    Mark the delivery as failed after all attempts are exhausted
                  </li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">
                  Monitoring Delivery Status
                </h3>
                <p className="text-muted-foreground mb-4">
                  Check the "Last Run" status in your dashboard to see:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                  <li>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Success
                    </span>{" "}
                    - Report generated and delivered successfully
                  </li>
                  <li>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Failed
                    </span>{" "}
                    - Report generation or delivery failed
                  </li>
                </ul>
              </section>

              {/* Troubleshooting */}
              <section id="troubleshooting" className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Troubleshooting</h2>

                <h3 className="text-xl font-semibold mb-3">Common Issues</h3>

                <div className="space-y-6">
                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Reports Not Arriving</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                      <li>Verify your webhook URL is correct and accessible</li>
                      <li>Check that your configuration is enabled</li>
                      <li>Ensure your GitHub PAT is still valid</li>
                      <li>Review the "Last Run" status for error details</li>
                    </ul>
                  </div>

                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">
                      GitHub Connection Errors
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                      <li>Regenerate your GitHub PAT with correct scopes</li>
                      <li>Verify the repository URL format</li>
                      <li>Check that the specified branch exists</li>
                    </ul>
                  </div>

                  <div className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">
                      Webhook Delivery Failures
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                      <li>Ensure your endpoint returns a 2xx status code</li>
                      <li>Verify the URL is publicly accessible</li>
                      <li>Check for firewall or security restrictions</li>
                      <li>Test your endpoint with the "Test" button</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* FAQ */}
              <section id="faq" className="mb-12">
                <h2 className="text-3xl font-bold mb-6">
                  Frequently Asked Questions
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Is my source code accessed or stored?
                    </h3>
                    <p className="text-muted-foreground">
                      No. CommitDigest only accesses commit messages, file
                      names, and metadata. Your actual source code is never
                      read, stored, or processed.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      How is my GitHub PAT protected?
                    </h3>
                    <p className="text-muted-foreground">
                      Your Personal Access Token is encrypted at rest using
                      industry-standard encryption and is only used to read
                      commit information from your repositories.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      What AI model is used for summaries?
                    </h3>
                    <p className="text-muted-foreground">
                      We use leading Large Language Models via LangChain to
                      provide high-quality, contextual summaries of your commit
                      activity.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Can I customize the summary format?
                    </h3>
                    <p className="text-muted-foreground">
                      Currently, summaries use our optimized format. Custom
                      templates and formatting options are planned for future
                      releases.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      What happens if my PAT expires?
                    </h3>
                    <p className="text-muted-foreground">
                      You'll see error messages in your dashboard, and reports
                      will fail to generate. Simply update your repository
                      settings with a new, valid PAT.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Can I get reports for multiple branches?
                    </h3>
                    <p className="text-muted-foreground">
                      Currently, each configuration monitors one branch. To
                      track multiple branches, create separate configurations
                      for each branch.
                    </p>
                  </div>
                </div>
              </section>

              {/* Security */}
              <section id="security" className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Security & Privacy</h2>

                <h3 className="text-xl font-semibold mb-3">Data Protection</h3>
                <p className="text-muted-foreground mb-4">
                  CommitDigest is built with security and privacy as core
                  principles:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                  <li>
                    <strong>Encryption:</strong> All data is encrypted at rest
                    and in transit
                  </li>
                  <li>
                    <strong>Minimal Access:</strong> Only commit metadata is
                    accessed, never source code
                  </li>
                  <li>
                    <strong>Secure Authentication:</strong> Powered by Supabase
                    with industry-standard security
                  </li>
                  <li>
                    <strong>Token Security:</strong> GitHub PATs are encrypted
                    and securely stored
                  </li>
                  <li>
                    <strong>Data Isolation:</strong> Row-level security ensures
                    users only access their own data
                  </li>
                </ul>

                <h3 className="text-xl font-semibold mb-3">Compliance</h3>
                <p className="text-muted-foreground mb-4">
                  We follow security best practices and maintain compliance
                  with:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                  <li>SOC 2 Type II standards (via Supabase infrastructure)</li>
                  <li>GDPR privacy requirements</li>
                  <li>Industry-standard encryption protocols</li>
                </ul>

                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        Your Data is Safe
                      </h4>
                      <p className="text-green-800 dark:text-green-200 text-sm mb-0">
                        CommitDigest processes only the minimum data necessary
                        to generate summaries and never stores or accesses your
                        source code.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Getting Help */}
              <section id="getting-help" className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Getting Help</h2>

                <p className="text-muted-foreground mb-4">
                  Need assistance? We're here to help:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Email Support</h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      For technical issues or questions
                    </p>
                    <a
                      href="mailto:support@commitdigest.com"
                      className="text-blue-600 hover:text-blue-800 text-sm font-mono"
                    >
                      support@commitdigest.com
                    </a>
                  </div>

                  <div className="border border-border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Documentation</h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      Browse this documentation for detailed guides
                    </p>
                    <a
                      href="#introduction"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Back to top
                    </a>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
