"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteLayout } from "@/components/site-layout";
import {
  CheckCircle,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Users,
  Clock,
  Zap,
  Shield,
  Bot,
  Calendar,
  Github,
} from "lucide-react";
import Link from "next/link";

export default function SlackIntegrationPage() {
  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="container space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-24">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <Github className="h-8 w-8 text-foreground" />
            </div>
            <ArrowRight className="h-8 w-8 text-muted-foreground" />
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
              <svg
                width="48"
                height="48"
                viewBox="0 0 384 384"
                className="text-white"
              >
                <path
                  fill="currentColor"
                  d="M320,64 L320,320 L64,320 L64,64 L320,64 Z M171.749388,128 L146.817842,128 L99.4840387,256 L121.976629,256 L130.913039,230.977 L187.575039,230.977 L196.319607,256 L220.167172,256 L171.749388,128 Z M260.093778,128 L237.691519,128 L237.691519,256 L260.093778,256 L260.093778,128 Z M159.094727,149.47526 L181.409039,213.333 L137.135039,213.333 L159.094727,149.47526 Z"
                />
              </svg>
            </div>
            <ArrowRight className="h-8 w-8 text-muted-foreground" />
            <div className="p-4 rounded-lg bg-muted/50 border">
              <svg width="48" height="48" viewBox="0 0 16 16">
                <path
                  fill="#E01E5A"
                  d="M2.471 11.318a1.474 1.474 0 001.47-1.471v-1.47h-1.47A1.474 1.474 0 001 9.846c.001.811.659 1.469 1.47 1.47zm3.682-2.942a1.474 1.474 0 00-1.47 1.471v3.683c.002.811.66 1.468 1.47 1.47a1.474 1.474 0 001.47-1.47V9.846a1.474 1.474 0 00-1.47-1.47z"
                />
                <path
                  fill="#36C5F0"
                  d="M4.683 2.471c.001.811.659 1.469 1.47 1.47h1.47v-1.47A1.474 1.474 0 006.154 1a1.474 1.474 0 00-1.47 1.47zm2.94 3.682a1.474 1.474 0 00-1.47-1.47H2.47A1.474 1.474 0 001 6.153c.002.812.66 1.469 1.47 1.47h3.684a1.474 1.474 0 001.47-1.47z"
                />
                <path
                  fill="#2EB67D"
                  d="M9.847 7.624a1.474 1.474 0 001.47-1.47V2.47A1.474 1.474 0 009.848 1a1.474 1.474 0 00-1.47 1.47v3.684c.002.81.659 1.468 1.47 1.47zm3.682-2.941a1.474 1.474 0 00-1.47 1.47v1.47h1.47A1.474 1.474 0 0015 6.154a1.474 1.474 0 00-1.47-1.47z"
                />
                <path
                  fill="#ECB22E"
                  d="M8.377 9.847c.002.811.659 1.469 1.47 1.47h3.683A1.474 1.474 0 0015 9.848a1.474 1.474 0 00-1.47-1.47H9.847a1.474 1.474 0 00-1.47 1.47zm2.94 3.682a1.474 1.474 0 00-1.47-1.47h-1.47v1.47c.002.812.659 1.469 1.47 1.47a1.474 1.474 0 001.47-1.47z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:text-5xl lg:leading-[1.1]">
            Get Git Commit Summaries{" "}
            <span className="text-gradient">Delivered to Slack</span>
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Automated AI-powered commit summaries sent directly to your Slack
            channels. Keep your team updated with beautiful development progress
            notifications on your schedule.
          </p>

          <div className="flex gap-4 mt-6">
            <Button asChild>
              <Link href="/login">Get Started Free</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/docs">View Documentation</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container pb-8 md:pb-12 lg:pb-16">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Get Commit Summaries in Slack?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Native Slack Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Development updates formatted perfectly for Slack with rich
                  blocks format, clickable links and team-friendly layout.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Keep Teams Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automatically notify your entire team about project progress
                  without manual status updates or lengthy meetings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Scheduled Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Set up daily, weekly, or custom schedules to receive
                  development summary notifications when they're most valuable
                  to your team.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Simple Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Just paste your Slack webhook URL and you're ready to receive
                  commit summaries. No complex configurations needed.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Bot className="h-8 w-8 text-primary mb-2" />
                <CardTitle>AI-Generated Summaries</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get intelligent development progress summaries that highlight
                  key features, bug fixes, and improvements rather than raw
                  commit messages.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Reliable Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Enterprise-grade security with automatic retry logic ensures
                  your development summaries always reach your team.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Setup Guide */}
      <section className="container pb-8 md:pb-12 lg:pb-16">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-3xl font-bold text-center mb-12">
            How to Get Commit Summaries in Slack
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Step 1 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    1
                  </div>
                  <CardTitle>Create Slack Webhook</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                  <li>Go to your Slack workspace settings</li>
                  <li>Navigate to "Apps" → "Manage" → "Custom Integrations"</li>
                  <li>Click "Incoming Webhooks" → "Add Configuration"</li>
                  <li>Choose the channel for your reports</li>
                  <li>Copy the webhook URL provided</li>
                </ol>

                <Button variant="outline" className="w-full" asChild>
                  <a
                    href="https://api.slack.com/messaging/webhooks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Slack Webhook Documentation
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    2
                  </div>
                  <CardTitle>Configure CommitDigest</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                  <li>Sign up for CommitDigest (free to start)</li>
                  <li>Connect your GitHub repositories</li>
                  <li>Create a new report configuration</li>
                  <li>Paste your Slack webhook URL</li>
                  <li>Set your preferred schedule and format</li>
                </ol>

                <Button className="w-full" asChild>
                  <Link href="/login" className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Start Free Setup
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Example Output */}
      <section className="container pb-8 md:pb-12 lg:pb-16">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-3xl font-bold text-center mb-12">
            Example Commit Summary in Slack
          </h2>

          <Card className="overflow-hidden">
            <CardHeader className="bg-[#4A154B] text-white">
              <CardTitle className="flex items-center gap-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 16 16"
                  className="text-white"
                >
                  <path
                    fill="currentColor"
                    d="M2.471 11.318a1.474 1.474 0 001.47-1.471v-1.47h-1.47A1.474 1.474 0 001 9.846c.001.811.659 1.469 1.47 1.47zm3.682-2.942a1.474 1.474 0 00-1.47 1.471v3.683c.002.811.66 1.468 1.47 1.47a1.474 1.474 0 001.47-1.47V9.846a1.474 1.474 0 00-1.47-1.47z"
                  />
                  <path
                    fill="currentColor"
                    d="M4.683 2.471c.001.811.659 1.469 1.47 1.47h1.47v-1.47A1.474 1.474 0 006.154 1a1.474 1.474 0 00-1.47 1.47zm2.94 3.682a1.474 1.474 0 00-1.47-1.47H2.47A1.474 1.474 0 001 6.153c.002.812.66 1.469 1.47 1.47h3.684a1.474 1.474 0 001.47-1.47z"
                  />
                  <path
                    fill="currentColor"
                    d="M9.847 7.624a1.474 1.474 0 001.47-1.47V2.47A1.474 1.474 0 009.848 1a1.474 1.474 0 00-1.47 1.47v3.684c.002.81.659 1.468 1.47 1.47zm3.682-2.941a1.474 1.474 0 00-1.47 1.47v1.47h1.47A1.474 1.474 0 0015 6.154a1.474 1.474 0 00-1.47-1.47z"
                  />
                  <path
                    fill="currentColor"
                    d="M8.377 9.847c.002.811.659 1.469 1.47 1.47h3.683A1.474 1.474 0 0015 9.848a1.474 1.474 0 00-1.47-1.47H9.847a1.474 1.474 0 00-1.47 1.47zm2.94 3.682a1.474 1.474 0 00-1.47-1.47h-1.47v1.47c.002.812.659 1.469 1.47 1.47a1.474 1.474 0 001.47-1.47z"
                  />
                </svg>
                #development
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white text-black">
              <div className="space-y-4">
                <div>
                  <div className="font-bold text-lg mb-2">
                    📊 Weekly Development Summary
                  </div>
                  <div className="text-sm text-slate-600 mb-4">
                    Jan 15, 2024 • 12 commits
                  </div>
                </div>

                <div>
                  <div className="font-semibold mb-2">🚀 New Features</div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 ml-4">
                    <li>Added user authentication with OAuth integration</li>
                    <li>Implemented real-time notifications system</li>
                    <li>Created dashboard analytics page</li>
                  </ul>
                </div>

                <div>
                  <div className="font-semibold mb-2">🐛 Bug Fixes</div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 ml-4">
                    <li>Fixed payment processing timeout issues</li>
                    <li>Resolved mobile layout responsiveness</li>
                  </ul>
                </div>

                <div className="border-t pt-3 mt-4">
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>
                      <strong>Repository:</strong>{" "}
                      <a href="#" className="text-blue-600">
                        user/awesome-project
                      </a>
                    </span>
                    <span>
                      <strong>Branch:</strong> main
                    </span>
                    <span>
                      <strong>Commits:</strong> 12
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="container pb-8 md:pb-12 lg:pb-16">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-3xl font-bold text-center mb-12">
            Slack Commit Summary Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Rich Slack Formatting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>
                    • Slack's native blocks format for beautiful summaries
                  </li>
                  <li>• Markdown automatically converted to Slack format</li>
                  <li>• Clickable repository and commit links</li>
                  <li>• Emoji and formatting preserved</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Smart Summary Delivery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Automatic retry on failed summary deliveries</li>
                  <li>• Respects Slack's 4000 character limit</li>
                  <li>• Thread support for follow-up summaries</li>
                  <li>• Channel-specific summary customization</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container pb-8 md:pb-12 lg:pb-16">
        <div className="mx-auto max-w-[980px] text-center">
          <Card className="p-8">
            <CardContent className="space-y-6">
              <h2 className="text-3xl font-bold">
                Ready to Get Commit Summaries in Slack?
              </h2>
              <p className="text-xl text-muted-foreground">
                Start receiving AI-powered development progress summaries in
                your Slack channels today. Free forever for public repositories.
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/login">Start Getting Summaries</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/docs">Read Full Docs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </SiteLayout>
  );
}
