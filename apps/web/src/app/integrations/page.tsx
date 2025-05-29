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
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Users,
  Bot,
  Hash,
  Gamepad2,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function IntegrationsPage() {
  return (
    <div className="dark">
      <div className="min-h-screen bg-background text-foreground">
        {/* Navigation Bar */}
        <AppHeader />

        {/* Hero Section */}
        <section className="container space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-24">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:text-5xl lg:leading-[1.1]">
              Get Commit Summaries{" "}
              <span className="text-gradient">Delivered Anywhere</span>
            </h1>
            <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
              Receive AI-powered commit summaries directly where your team
              works. Automated development progress notifications delivered to
              your favorite platforms and tools.
            </p>
          </div>
        </section>

        {/* Featured Integrations */}
        <section className="container pb-8 md:pb-12 lg:pb-16">
          <div className="mx-auto max-w-[980px]">
            <h2 className="text-3xl font-bold text-center mb-12">
              Popular Summary Destinations
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Slack Integration */}
              <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <svg width="40" height="40" viewBox="0 0 16 16">
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
                    <div>
                      <CardTitle className="text-xl">
                        Commit Summaries in Slack
                      </CardTitle>
                      <CardDescription>
                        Perfect for team collaboration
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Get beautifully formatted development progress summaries
                    delivered directly to your Slack channels. Native blocks
                    format, clickable links, and team-friendly notifications.
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span>Rich formatting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>Team updates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span>Simple setup</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary" />
                      <span>AI summaries</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button asChild className="flex-1">
                      <Link href="/integrations/slack">
                        Get Slack Summaries
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <a
                        href="https://api.slack.com/messaging/webhooks"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Discord Integration */}
              <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 -28.5 256 256"
                        className="text-[#5865F2]"
                      >
                        <path
                          fill="currentColor"
                          d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
                        />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Commit Summaries in Discord
                      </CardTitle>
                      <CardDescription>
                        Perfect for gaming communities
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Bring AI-powered development summaries to your Discord
                    server. Full markdown support, no character limits, and
                    perfect for gaming communities and open-source projects.
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="h-4 w-4 text-primary" />
                      <span>Gaming focused</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-primary" />
                      <span>Channel notifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span>Full markdown</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>Community updates</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button asChild className="flex-1">
                      <Link href="/integrations/discord">
                        Get Discord Summaries
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <a
                        href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Other Integrations */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">
                Other Summary Destinations
              </h3>
              <p className="text-muted-foreground">
                CommitDigest can deliver summaries to any platform that supports
                webhooks
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="text-center p-6">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 32 32"
                  className="mx-auto mb-3"
                >
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
                <h4 className="font-semibold">Email / Gmail</h4>
              </Card>

              <Card className="text-center p-6">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 256 256"
                  className="mx-auto mb-3 text-[#FF4A00]"
                >
                  <path
                    fill="currentColor"
                    d="M128.080089,-0.000183105 C135.311053,0.0131003068 142.422517,0.624138494 149.335663,1.77979593 L149.335663,76.2997796 L202.166953,23.6044907 C208.002065,27.7488446 213.460883,32.3582023 218.507811,37.3926715 C223.557281,42.4271407 228.192318,47.8867213 232.346817,53.7047992 L179.512985,106.400063 L254.227854,106.400063 C255.387249,113.29414 256,120.36111 256,127.587243 L256,127.759881 C256,134.986013 255.387249,142.066204 254.227854,148.960282 L179.500273,148.960282 L232.346817,201.642324 C228.192318,207.460402 223.557281,212.919983 218.523066,217.954452 L218.507811,217.954452 C213.460883,222.988921 208.002065,227.6115 202.182208,231.742607 L149.335663,179.04709 L149.335663,253.5672 C142.435229,254.723036 135.323765,255.333244 128.092802,255.348499 L127.907197,255.348499 C120.673691,255.333244 113.590195,254.723036 106.677048,253.5672 L106.677048,179.04709 L53.8457596,231.742607 C42.1780766,223.466917 31.977435,213.278734 23.6658953,201.642324 L76.4997269,148.960282 L1.78485803,148.960282 C0.612750404,142.052729 0,134.946095 0,127.719963 L0.0121454869,125.473817 0.134939797,123.182933 0.311311815,120.812834 L0.36577283,120.099764 C0.887996182,113.428547 1.78485803,106.400063 1.78485803,106.400063 L76.4997269,106.400063 L23.6658953,53.7047992 C27.8076812,47.8867213 32.4300059,42.4403618 37.4769335,37.4193681 L37.5023588,37.3926715 C42.5391163,32.3582023 48.0106469,27.7488446 53.8457596,23.6044907 L106.677048,76.2997796 L106.677048,1.77979593 C113.590195,0.624138494 120.688946,0.0131003068 127.932622,-0.000183105 L128.080089,-0.000183105 Z M128.067377,95.7600714 L127.945335,95.7600714 C118.436262,95.7600714 109.32891,97.5001809 100.910584,100.661566 C97.7553011,109.043534 96.0085811,118.129275 95.9958684,127.613685 L95.9958684,127.733184 C96.0085811,137.217594 97.7553011,146.303589 100.923296,154.685303 C109.32891,157.846943 118.436262,159.587052 127.945335,159.587052 L128.067377,159.587052 C137.576449,159.587052 146.683802,157.846943 155.089415,154.685303 C158.257411,146.290368 160.004131,137.217594 160.004131,127.733184 L160.004131,127.613685 C160.004131,118.129275 158.257411,109.043534 155.089415,100.661566 C146.683802,97.5001809 137.576449,95.7600714 128.067377,95.7600714 Z"
                  />
                </svg>
                <h4 className="font-semibold">Zapier</h4>
              </Card>

              <Card className="text-center p-6">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  className="mx-auto mb-3"
                >
                  <path
                    fill="currentColor"
                    d="M5,3H7V5H5v5a2,2,0,0,1-2,2,2,2,0,0,1,2,2v5H7v2H5c-1.07-.27-2-.9-2-2V15a2,2,0,0,0-2-2H0V11H1A2,2,0,0,0,3,9V5A2,2,0,0,1,5,3M19,3a2,2,0,0,1,2,2V9a2,2,0,0,0,2,2h1v2H23a2,2,0,0,0-2,2v4a2,2,0,0,1-2,2H17V19h2V14a2,2,0,0,1,2-2,2,2,0,0,1-2-2V5H17V3h2M12,15a1,1,0,1,1-1,1,1,1,0,0,1,1-1M8,15a1,1,0,1,1-1,1,1,1,0,0,1,1-1m8,0a1,1,0,1,1-1,1A1,1,0,0,1,16,15Z"
                  />
                </svg>
                <h4 className="font-semibold">Custom Webhook</h4>
              </Card>

              <Card className="text-center p-6">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 1024 1024"
                  className="mx-auto mb-3 text-[#1B9BDB]"
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
                <h4 className="font-semibold">Database</h4>
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
                  Ready to Get Commit Summaries Delivered?
                </h2>
                <p className="text-xl text-muted-foreground">
                  Start receiving AI-powered development progress summaries
                  wherever your team works. Free forever for public
                  repositories.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link href="/login">Start Getting Summaries</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/docs">Read Documentation</Link>
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
                  Slack
                </Link>
                <Link
                  href="/integrations/discord"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Discord
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
