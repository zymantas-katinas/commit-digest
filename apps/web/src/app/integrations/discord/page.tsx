"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppHeader } from "@/components/app-header";
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
  Hash,
  Gamepad2,
  Github,
} from "lucide-react";
import Link from "next/link";

export default function DiscordIntegrationPage() {
  return (
    <div className="dark">
      <div className="min-h-screen bg-background text-foreground">
        {/* Navigation Bar */}
        <AppHeader />

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
                <svg
                  width="48"
                  height="48"
                  viewBox="0 -28.5 256 256"
                  className="text-[#5865F2]"
                >
                  <path
                    fill="currentColor"
                    d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:text-5xl lg:leading-[1.1]">
              Get Git Commit Summaries{" "}
              <span className="text-gradient">Delivered to Discord</span>
            </h1>
            <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
              Automated AI-powered commit summaries sent directly to your
              Discord server. Perfect for gaming communities, development teams,
              and open-source projects.
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
              Why Get Commit Summaries in Discord?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <Gamepad2 className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Perfect for Gaming Communities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Ideal for gaming communities building mods, indie
                    developers, and open-source projects with Discord-focused
                    development workflows.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <MessageSquare className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Rich Development Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Discord's native markdown support means your commit
                    summaries look great with full formatting, links, and code
                    blocks preserved.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Hash className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Organized Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Send summary notifications to specific channels -
                    #dev-updates, #releases, or project-specific channels for
                    organized team communication.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Clock className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Flexible Update Schedules</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Daily standup summaries, weekly sprint updates, or real-time
                    notifications - delivered exactly when your team needs them.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Bot className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Smart AI Summaries</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Transform technical commit messages into readable
                    development updates that both developers and community
                    members can understand.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Secure Summary Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Discord webhooks provide secure, direct summary delivery
                    without requiring bot permissions or server access.
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
              How to Get Commit Summaries in Discord
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Step 1 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      1
                    </div>
                    <CardTitle>Create Discord Webhook</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                    <li>Go to your Discord server settings</li>
                    <li>Navigate to "Integrations" → "Webhooks"</li>
                    <li>Click "New Webhook" or "Create Webhook"</li>
                    <li>Choose the channel and customize the name/avatar</li>
                    <li>Copy the webhook URL provided</li>
                  </ol>

                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Discord Webhook Guide
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
                    <li>Paste your Discord webhook URL</li>
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
              Example Commit Summary in Discord
            </h2>

            <Card className="overflow-hidden">
              <CardHeader className="bg-[#5865F2] text-white">
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  dev-updates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-[#313338] text-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">CommitDigest</div>
                      <div className="text-xs text-gray-400">
                        Today at 9:00 AM
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#2b2d31] rounded-lg p-4 border-l-4 border-[#5865F2]">
                    <div className="text-lg font-bold mb-2">
                      📊 **Weekly Development Summary**
                    </div>
                    <div className="text-sm text-gray-400 mb-4">
                      *Jan 15, 2024 • 12 commits*
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="font-semibold text-green-400 mb-1">
                          🚀 **New Features**
                        </div>
                        <div className="text-sm space-y-1 ml-4">
                          <div>
                            • Added user authentication with OAuth integration
                          </div>
                          <div>
                            • Implemented real-time notifications system
                          </div>
                          <div>• Created dashboard analytics page</div>
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold text-yellow-400 mb-1">
                          🐛 **Bug Fixes**
                        </div>
                        <div className="text-sm space-y-1 ml-4">
                          <div>• Fixed payment processing timeout issues</div>
                          <div>• Resolved mobile layout responsiveness</div>
                        </div>
                      </div>

                      <div className="border-t border-gray-600 pt-3 mt-4">
                        <div className="text-xs text-gray-400 space-y-1">
                          <div>
                            **Repository:**
                            https://github.com/user/awesome-project
                          </div>
                          <div>**Branch:** main • **Commits:** 12</div>
                        </div>
                      </div>
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
              Discord Commit Summary Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Full Markdown Summaries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Complete markdown formatting in summaries</li>
                    <li>• Code blocks with syntax highlighting</li>
                    <li>• Bold, italic, and strikethrough formatting</li>
                    <li>• Clickable links and mentions</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Flexible Summary Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• No character limits (unlike Slack)</li>
                    <li>
                      • Support for longer, detailed development summaries
                    </li>
                    <li>• Embedded links preview automatically</li>
                    <li>• Custom webhook name and avatar</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="container pb-8 md:pb-12 lg:pb-16">
          <div className="mx-auto max-w-[980px]">
            <h2 className="text-3xl font-bold text-center mb-12">
              Perfect Use Cases for Discord Summaries
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <Gamepad2 className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Gaming Communities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Keep your community updated on mod development, server
                    updates, and patch releases with automated summaries.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Open Source Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Showcase development progress to contributors and
                    maintainers with automated commit summary notifications.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Bot className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Development Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Replace manual standup reports with automated development
                    summary notifications of team progress and achievements.
                  </p>
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
                  Ready to Get Commit Summaries in Discord?
                </h2>
                <p className="text-xl text-muted-foreground">
                  Start receiving AI-powered development progress summaries in
                  your Discord server today. Free forever for public
                  repositories.
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

        {/* Footer */}
        <footer className="border-t py-8">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-muted-foreground">
                © 2024 CommitDigest. All rights reserved.
              </div>
              <div className="flex gap-6">
                <Link
                  href="/docs"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Documentation
                </Link>
                <Link
                  href="/integrations/slack"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Slack Integration
                </Link>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
