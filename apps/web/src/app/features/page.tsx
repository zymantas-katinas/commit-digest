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
  ArrowRight,
  Bot,
  Clock,
  Shield,
  Zap,
  Calendar,
  Github,
  Webhook,
  FileText,
  Users,
  Globe,
  Settings,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "How CommitDigest Simplifies Your Workflow - AI Git Analysis Features",
  description:
    "Discover how CommitDigest transforms your development workflow with intelligent AI git analysis, automated commit summaries, secure GitHub integration, flexible webhook delivery, and human-readable code progress reports. Save developer time and improve team collaboration with advanced LLM technology.",
  keywords: [
    "AI git analysis features",
    "automated commit summary tool",
    "intelligent git reporting",
    "AI code analysis platform",
    "LLM git summaries",
    "automated changelog generation",
    "GitHub integration features",
    "webhook git delivery options",
    "markdown code reports",
    "commit history analysis tools",
    "developer productivity features",
    "git workflow automation",
    "time-saving git tools",
    "team code progress tracking",
    "human-readable git logs",
    "git commit summarizer features",
    "engineering manager tools",
    "AI for GitHub repositories",
    "Slack git notifications",
    "Discord git integration",
    "custom webhook reporting",
  ],
  openGraph: {
    title:
      "How CommitDigest Simplifies Your Workflow - AI Git Analysis Features",
    description:
      "Explore CommitDigest's comprehensive feature set designed to save developer time and improve team collaboration through intelligent git analysis and automated reporting.",
    url: "https://commitdigest.com/features",
  },
  alternates: {
    canonical: "https://commitdigest.com/features",
  },
};

export default function FeaturesPage() {
  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="container space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-24">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:text-5xl lg:leading-[1.1]">
            How CommitDigest{" "}
            <span className="text-gradient">Simplifies Your Workflow</span>
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Transform your development process with intelligent commit analysis,
            automated git reporting, and seamless team collaboration. Every
            feature designed to save developer time and provide clear insights
            into your code's progress.
          </p>
          <div className="max-w-[650px] py-4">
            <p className="text-base text-muted-foreground">
              Stop wasting time manually reviewing git logs. Our AI-powered
              platform analyzes your GitHub commit history and delivers
              human-readable summaries that help development teams, engineering
              managers, and stakeholders understand progress effortlessly.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="container py-8 md:py-12 lg:py-16">
        <div className="mx-auto max-w-[980px]">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* AI-Generated Summaries */}
            <Card className="relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">
                  Intelligent AI Commit Analysis
                </CardTitle>
                <CardDescription>
                  Advanced LLM technology transforms complex commit histories
                  into clear, human-readable insights that everyone on your team
                  can understand, regardless of technical background.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    <span>Natural language commit explanations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    <span>Context-aware code change analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    <span>Markdown formatted progress reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                    <span>Multi-repository support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Automated Reporting */}
            <Card className="relative overflow-hidden border-2 border-green-500/20 hover:border-green-500/40 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">
                  Automated Git Reporting That Saves Time
                </CardTitle>
                <CardDescription>
                  Schedule daily, weekly, or custom frequency reports that keep
                  your development team synchronized without manual intervention
                  or time-consuming status meetings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    <span>Flexible scheduling options for any workflow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    <span>Consistent team updates without overhead</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    <span>Zero maintenance required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    <span>Smart commit filtering and organization</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GitHub Integration */}
            <Card className="relative overflow-hidden border-2 border-blue-500/20 hover:border-blue-500/40 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#24292e]">
                  <Github className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">
                  Secure GitHub Integration
                </CardTitle>
                <CardDescription>
                  Connect private and public repositories safely using Personal
                  Access Tokens with enterprise-grade security. Your code stays
                  private and protected.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    <span>Personal Access Token security model</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    <span>Private repository support included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    <span>Multi-organization access management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    <span>Simple repository setup and management</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Webhook Delivery */}
            <Card className="relative overflow-hidden border-2 border-purple-500/20 hover:border-purple-500/40 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
                  <Webhook className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">
                  Flexible Webhook Delivery Options
                </CardTitle>
                <CardDescription>
                  Send intelligent commit summaries to Slack, Discord, email, or
                  any custom webhook endpoint with full JSON payload support.
                  Integrate seamlessly with your existing communication tools.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                    <span>Slack & Discord native integrations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                    <span>Custom webhook endpoints support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                    <span>Rich JSON payload delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                    <span>Real-time notification delivery</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time-Saving Efficiency */}
            <Card className="relative overflow-hidden border-2 border-orange-500/20 hover:border-orange-500/40 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-600">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">
                  Significant Developer Time Savings
                </CardTitle>
                <CardDescription>
                  Eliminate hours of manual git log review with automated
                  analysis that instantly highlights important changes,
                  patterns, and development progress without the tedious
                  scanning.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                    <span>Skip time-consuming manual log reviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                    <span>Get instant code progress insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                    <span>Focus more time on actual development</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                    <span>Streamlined development workflow</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Alignment */}
            <Card className="relative overflow-hidden border-2 border-teal-500/20 hover:border-teal-500/40 transition-colors">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-600">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">
                  Enhanced Team Collaboration & Alignment
                </CardTitle>
                <CardDescription>
                  Keep engineering teams, project managers, and stakeholders
                  perfectly aligned with clear, accessible progress updates that
                  everyone can understand, regardless of technical background.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                    <span>Cross-team transparency and communication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                    <span>Non-technical progress summaries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                    <span>Automated stakeholder updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                    <span>Improved project communication</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className="container py-8 md:py-12 lg:py-16 bg-muted/30">
        <div className="mx-auto max-w-[980px]">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Advanced AI Git Analysis Capabilities
            </h2>
            <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
              Powered by cutting-edge AI technology and advanced LLM models to
              deliver intelligent insights that traditional git tools simply
              can't provide for modern development teams.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">
                    Professional Markdown Report Generation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Generate beautifully formatted Markdown reports with proper
                    headers, organized lists, and highlighted code blocks that
                    are easy to read, share, and integrate into documentation
                    workflows.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">
                    Multi-Repository Analysis & Tracking
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Track and summarize commits across multiple GitHub
                    repositories simultaneously, perfect for microservices
                    architectures, complex project setups, and distributed
                    development teams.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">
                    Enterprise-Grade Security
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Bank-level encryption for stored access tokens, secure API
                    connections, and full compliance with enterprise security
                    requirements. Your code and data remain completely private
                    and protected.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">
                    Fully Customizable Reporting Options
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure report frequency, content filtering, delivery
                    preferences, and formatting options to perfectly match your
                    team's unique workflow requirements and communication
                    preferences.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">
                    Lightning-Fast AI Processing
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Optimized AI models and efficient processing pipelines
                    ensure your intelligent commit summaries are generated and
                    delivered in seconds, not minutes, keeping your workflow
                    moving smoothly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">
                    Context-Aware AI Intelligence
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced language models understand code context, commit
                    patterns, and development workflows to provide meaningful,
                    relevant insights that actually help your team make better
                    decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container py-8 md:py-12 lg:py-16">
        <div className="mx-auto max-w-[980px]">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Built for Every Development Team & Workflow
            </h2>
            <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
              Whether you're a startup, growing company, or enterprise
              organization, CommitDigest adapts to your team's needs, workflow
              preferences, and communication requirements.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-blue-600">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Development Teams</CardTitle>
                <CardDescription>
                  Streamline daily standups, sprint reviews, and team
                  communication with automated git progress summaries that save
                  hours of manual reporting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Effortless daily standup preparation</li>
                  <li>• Automated sprint review documentation</li>
                  <li>• Enhanced cross-team visibility</li>
                  <li>• Significantly reduced meeting time</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-green-600">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Engineering Managers</CardTitle>
                <CardDescription>
                  Get high-level insights into team productivity, project
                  momentum, and development progress without micromanaging your
                  developers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Clear team velocity tracking</li>
                  <li>• Stakeholder progress reporting</li>
                  <li>• Data-driven resource allocation</li>
                  <li>• Early risk identification</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-purple-600">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Project Managers</CardTitle>
                <CardDescription>
                  Understand technical progress and development milestones
                  without needing to dive into complex code changes or technical
                  details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Clear non-technical progress summaries</li>
                  <li>• Accurate milestone tracking</li>
                  <li>• Professional client update preparation</li>
                  <li>• Improved timeline management</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-8 md:py-12 lg:py-16 bg-muted/30">
        <div className="mx-auto max-w-[600px] text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Experience the Power of Intelligent Git Analysis
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of developers and engineering teams who have
            transformed their git workflow with AI-powered automation. Start
            understanding your code's progress effortlessly today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/login">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/pricing">
                View Pricing Plans
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
