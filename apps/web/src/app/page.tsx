import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteLayout } from "@/components/site-layout";
import { ProductShowcase } from "@/components/product-showcase";
import {
  GitBranch,
  Clock,
  Zap,
  Shield,
  Github,
  ArrowRight,
  Webhook,
  Bot,
  Calendar,
  Users,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Understand Your Code's Progress, Effortlessly - CommitDigest",
  description:
    "Transform Git commit logs into clear summaries with AI. CommitDigest automatically analyzes your GitHub repositories and delivers human-readable progress reports to Slack, Discord, or webhooks. Save time and improve team communication.",
  keywords: [
    "AI git analysis",
    "automated commit summary",
    "GitHub digest",
    "git commit summarizer",
    "developer productivity tools",
    "git workflow automation",
    "team code progress",
    "Slack git integration",
    "Discord git updates",
    "webhook git notifications",
  ],
  openGraph: {
    title: "Understand Your Code's Progress, Effortlessly - CommitDigest",
    description:
      "AI-powered Git commit summaries that save developer time. Get intelligent, human-readable code progress reports automatically.",
    url: "https://commitdigest.com",
  },
  alternates: {
    canonical: "https://commitdigest.com",
  },
};

export default function Home() {
  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="container space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-24">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-bold leading-tight mb-4 tracking-tighter md:text-4xl lg:text-5xl lg:leading-[1.1]">
            Code Progress, Simplified: <br /> Get Your{" "}
            <span className="text-gradient">Scheduled AI Summaries</span>
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Stop deciphering endless Git logs. CommitDigest delivers clear,
            human-readable reports from your GitHub activity, automatically, on
            your schedule.
          </p>

          {/* Flowchart Section */}
          <div className="w-full max-w-4xl py-8">
            <div className="flex flex-col items-center space-y-6">
              {/* First Row: GitHub -> AI */}
              <div className="flex items-center justify-center space-x-6">
                {/* GitHub Icon */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-4 rounded-lg bg-muted/50 ">
                    <Github className="h-8 w-8 text-foreground" />
                  </div>
                  <span className="text-sm font-medium">GitHub Commits</span>
                </div>

                {/* Arrow */}
                <ArrowRight className="h-6 w-6 text-muted-foreground" />

                {/* AI Icon */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 384 384"
                      className="text-white"
                    >
                      <path
                        fill="currentColor"
                        d="M320,64 L320,320 L64,320 L64,64 L320,64 Z M171.749388,128 L146.817842,128 L99.4840387,256 L121.976629,256 L130.913039,230.977 L187.575039,230.977 L196.319607,256 L220.167172,256 L171.749388,128 Z M260.093778,128 L237.691519,128 L237.691519,256 L260.093778,256 L260.093778,128 Z M159.094727,149.47526 L181.409039,213.333 L137.135039,213.333 L159.094727,149.47526 Z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">AI Analysis</span>
                </div>
              </div>

              {/* Webhook Icon */}
              <div className="flex justify-center">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/5 border-primary/20">
                  <Webhook className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary/70">
                    Automated Delivery
                  </span>
                </div>
              </div>

              {/* Arrow down */}
              <div className="flex justify-center">
                <div className="rotate-90">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>

              {/* Output Icons Grid */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4 w-full max-w-3xl">
                {/* Discord */}
                <Link
                  href="/integrations/discord"
                  className="flex flex-col items-center space-y-2 hover:scale-105 transition-transform cursor-pointer"
                >
                  <div className="p-4 rounded-lg bg-muted/50 hover:border-[#5865F2]/50">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 -28.5 256 256"
                      className="text-[#5865F2]"
                    >
                      <path
                        fill="currentColor"
                        d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium">Discord</span>
                </Link>

                {/* Slack */}
                <Link
                  href="/integrations/slack"
                  className="flex flex-col items-center space-y-2 hover:scale-105 transition-transform cursor-pointer"
                >
                  <div className="p-4 rounded-lg bg-muted/50 hover:border-green-500/50">
                    <svg width="28" height="28" viewBox="0 0 16 16">
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
                  <span className="text-xs font-medium">Slack</span>
                </Link>

                {/* Gmail */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-4 rounded-lg bg-muted/50 ">
                    <svg width="28" height="28" viewBox="0 0 32 32">
                      <path
                        d="M22.0515 8.52295L16.0644 13.1954L9.94043 8.52295V8.52421L9.94783 8.53053V15.0732L15.9954 19.8466L22.0515 15.2575V8.52295Z"
                        fill="#EA4335"
                      />
                      <path
                        d="M23.6231 7.38639L22.0508 8.52292V15.2575L26.9983 11.459V9.17074C26.9983 9.17074 26.3978 5.90258 23.6231 7.38639Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M22.0508 15.2575V23.9924H25.8428C25.8428 23.9924 26.9219 23.8813 26.9995 22.6513V11.459L22.0508 15.2575Z"
                        fill="#34A853"
                      />
                      <path
                        d="M5 11.4668V22.6591C5.07646 23.8904 6.15673 24.0003 6.15673 24.0003H9.94877L9.94014 15.0671L5 11.4668Z"
                        fill="#4285F4"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium">Email</span>
                </div>

                {/* JSON */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-4 rounded-lg bg-muted/50 ">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <title>language_json</title>
                      <rect width="24" height="24" fill="none"></rect>
                      <path
                        fill="currentColor"
                        d="M5,3H7V5H5v5a2,2,0,0,1-2,2,2,2,0,0,1,2,2v5H7v2H5c-1.07-.27-2-.9-2-2V15a2,2,0,0,0-2-2H0V11H1A2,2,0,0,0,3,9V5A2,2,0,0,1,5,3M19,3a2,2,0,0,1,2,2V9a2,2,0,0,0,2,2h1v2H23a2,2,0,0,0-2,2v4a2,2,0,0,1-2,2H17V19h2V14a2,2,0,0,1,2-2,2,2,0,0,1-2-2V5H17V3h2M12,15a1,1,0,1,1-1,1,1,1,0,0,1,1-1M8,15a1,1,0,1,1-1,1,1,1,0,0,1,1-1m8,0a1,1,0,1,1-1,1A1,1,0,0,1,16,15Z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium">JSON</span>
                </div>

                {/* Zapier */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-4 rounded-lg bg-muted/50 ">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 256 256"
                      className="text-[#FF4A00]"
                    >
                      <path
                        fill="currentColor"
                        d="M128.080089,-0.000183105 C135.311053,0.0131003068 142.422517,0.624138494 149.335663,1.77979593 L149.335663,76.2997796 L202.166953,23.6044907 C208.002065,27.7488446 213.460883,32.3582023 218.507811,37.3926715 C223.557281,42.4271407 228.192318,47.8867213 232.346817,53.7047992 L179.512985,106.400063 L254.227854,106.400063 C255.387249,113.29414 256,120.36111 256,127.587243 L256,127.759881 C256,134.986013 255.387249,142.066204 254.227854,148.960282 L179.500273,148.960282 L232.346817,201.642324 C228.192318,207.460402 223.557281,212.919983 218.523066,217.954452 L218.507811,217.954452 C213.460883,222.988921 208.002065,227.6115 202.182208,231.742607 L149.335663,179.04709 L149.335663,253.5672 C142.435229,254.723036 135.323765,255.333244 128.092802,255.348499 L127.907197,255.348499 C120.673691,255.333244 113.590195,254.723036 106.677048,253.5672 L106.677048,179.04709 L53.8457596,231.742607 C42.1780766,223.466917 31.977435,213.278734 23.6658953,201.642324 L76.4997269,148.960282 L1.78485803,148.960282 C0.612750404,142.052729 0,134.946095 0,127.719963 L0.0121454869,125.473817 0.134939797,123.182933 0.311311815,120.812834 L0.36577283,120.099764 C0.887996182,113.428547 1.78485803,106.400063 1.78485803,106.400063 L76.4997269,106.400063 L23.6658953,53.7047992 C27.8076812,47.8867213 32.4300059,42.4403618 37.4769335,37.4193681 L37.5023588,37.3926715 C42.5391163,32.3582023 48.0106469,27.7488446 53.8457596,23.6044907 L106.677048,76.2997796 L106.677048,1.77979593 C113.590195,0.624138494 120.688946,0.0131003068 127.932622,-0.000183105 L128.080089,-0.000183105 Z M128.067377,95.7600714 L127.945335,95.7600714 C118.436262,95.7600714 109.32891,97.5001809 100.910584,100.661566 C97.7553011,109.043534 96.0085811,118.129275 95.9958684,127.613685 L95.9958684,127.733184 C96.0085811,137.217594 97.7553011,146.303589 100.923296,154.685303 C109.32891,157.846943 118.436262,159.587052 127.945335,159.587052 L128.067377,159.587052 C137.576449,159.587052 146.683802,157.846943 155.089415,154.685303 C158.257411,146.290368 160.004131,137.217594 160.004131,127.733184 L160.004131,127.613685 C160.004131,118.129275 158.257411,109.043534 155.089415,100.661566 C146.683802,97.5001809 137.576449,95.7600714 128.067377,95.7600714 Z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium">Zapier</span>
                </div>

                {/* Database */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-4 rounded-lg bg-muted/50 ">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 1024 1024"
                      className="text-[#1B9BDB]"
                    >
                      <path
                        fill="currentColor"
                        d="M117 608.4v178.5c1.5 93.7 155.7 169.5 395 169.5s393.4-75.8 395-169.5V608.4H117z"
                      />
                      <path
                        fill="#FFFFFF"
                        d="M907 607.7c0 99.4-154.8 180-395 180s-395-80.6-395-180 154.8-180 395-180 395 80.5 395 180z"
                      />
                      <path
                        fill="currentColor"
                        d="M117 428.4v158.5c1.5 93.7 155.7 179.5 395 179.5s393.4-85.8 395-179.5V428.4H117z"
                      />
                      <path
                        fill="#FFFFFF"
                        d="M907 427.7c0 99.4-154.8 180-395 180s-395-80.6-395-180 154.8-180 395-180 395 80.5 395 180z"
                      />
                      <path
                        fill="currentColor"
                        d="M117 248.4v158.5c1.5 93.7 155.7 179.5 395 179.5s393.4-85.8 395-179.5V248.4H117z"
                      />
                      <path
                        fill="#3ED6FF"
                        d="M907 247.7c0 99.4-154.8 180-395 180s-395-80.6-395-180 154.8-180 395-180 395 80.5 395 180z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium">Database</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-center space-x-4 py-4 md:pb-10">
            <Button size="lg" asChild>
              <Link href="/login">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Link href="#product-showcase">
              <Button variant="outline" size="lg">
                View Example
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Elaboration Section */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-16 bg-muted/30">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-bold leading-tight tracking-tighter md:text-4xl">
            Stop Losing Time to Manual Git Reviews
          </h2>
          <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            Development teams waste hours scanning commit histories to
            understand what happened. Managers struggle to communicate progress
            to stakeholders while developers lose focus explaining their work.
          </p>
          <div className="grid gap-6 md:grid-cols-3 mt-8 w-full max-w-4xl">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <Clock className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="font-semibold">Time Drain</h3>
              <p className="text-sm text-muted-foreground">
                Hours lost weekly reviewing and explaining commit activity
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold">Communication Gap</h3>
              <p className="text-sm text-muted-foreground">
                Difficulty keeping non-technical stakeholders informed
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold">Lost Momentum</h3>
              <p className="text-sm text-muted-foreground">
                Context switching between development and reporting tasks
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Features Section */}
      <section
        id="features"
        className="container space-y-6 py-8 md:py-12 lg:py-20 border-t border-border/60"
      >
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-bold leading-tight tracking-tighter md:text-4xl">
            How CommitDigest Saves Your Time
          </h2>
          <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            Our AI automatically processes your GitHub commits and creates clear
            summaries. Stop scanning logs manually and start understanding your
            progress effortlessly.
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Clock className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Save Developer Time</CardTitle>
              <CardDescription>
                Get automated daily and weekly commit summaries instead of
                reviewing git logs manually. Focus on coding, not reporting.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Zap className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Understand Changes</CardTitle>
              <CardDescription>
                AI explains what happened in your code using plain English that
                everyone on your team can understand.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Shield className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Keep Teams Aligned</CardTitle>
              <CardDescription>
                Automatic delivery to Slack, Discord, or webhooks keeps everyone
                informed without manual updates.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-20 bg-muted/30">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-bold leading-tight tracking-tighter md:text-4xl">
            Get Started in Minutes
          </h2>
          <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            Set up your team in under 5 minutes. No complex configurations
            required.
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-4">
          <div className="relative flex flex-col items-center space-y-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Github className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold">Connect GitHub Repositories</h3>
            <p className="text-sm text-muted-foreground">
              Link your repositories using GitHub tokens. Your code stays
              private and secure.
            </p>
          </div>
          <div className="relative flex flex-col items-center space-y-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Calendar className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold">Configure Schedule</h3>
            <p className="text-sm text-muted-foreground">
              Choose when and where you want to receive your summaries.
            </p>
          </div>
          <div className="relative flex flex-col items-center space-y-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Bot className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold">AI Analyzes Commits</h3>
            <p className="text-sm text-muted-foreground">
              Our AI processes your commits and creates clear reports
              automatically.
            </p>
          </div>
          <div className="relative flex flex-col items-center space-y-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Webhook className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold">Receive Summaries</h3>
            <p className="text-sm text-muted-foreground">
              Get readable reports delivered to your team's communication
              channels.
            </p>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-16">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-bold leading-tight tracking-tighter md:text-4xl">
            Built for Modern Development Teams
          </h2>
          <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
            Whether you're a development team looking to save time, an
            engineering manager needing better visibility, or a project manager
            tracking progress, CommitDigest provides the insights you need.
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-6 md:grid-cols-3 max-w-5xl">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl">Development Teams</CardTitle>
              <CardDescription>
                Focus on coding instead of explaining what you built. Automated
                summaries keep everyone informed without disrupting your
                workflow.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl">Engineering Managers</CardTitle>
              <CardDescription>
                Track team progress and communicate updates effortlessly. Get
                clear insights without micromanaging your developers.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl">Project Managers</CardTitle>
              <CardDescription>
                Understand development progress in plain language. No more
                deciphering technical commits or waiting for status updates.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Product Showcase Section */}
      <ProductShowcase />

      {/* CTA Section */}
      <section className="container space-y-6 py-8 md:py-12 lg:py-20">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-bold leading-tight tracking-tighter md:text-4xl">
            Start Understanding Your Progress Today
          </h2>
          <p className="max-w-[600px] text-lg text-muted-foreground sm:text-xl">
            Join teams already saving hours weekly with automated git summaries.
            Start free and see the difference.
          </p>
          <div className="flex w-full items-center justify-center space-x-4 py-4">
            <Button size="lg" asChild>
              <Link href="/login">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Link href="/features">
              <Button variant="outline" size="lg">
                Explore Features
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
