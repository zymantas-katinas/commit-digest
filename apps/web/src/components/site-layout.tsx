"use client";

import { AppHeader } from "@/components/app-header";
import { StatusIndicator } from "@/components/status-indicator";
import { GitBranch } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AuthRedirect } from "@/components/auth-redirect";
import { AuthLoading } from "@/components/auth-loading";

interface SiteLayoutProps {
  children: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="dark">
      {/* <AuthRedirect /> */}
      <AuthLoading />
      <div className="min-h-screen bg-background text-foreground">
        {/* Navigation Bar */}
        <AppHeader />

        {/* Main Content */}
        <main>{children}</main>

        {/* Footer */}
        <footer className="border-t border-border/40">
          <div className="container max-w-screen-2xl mx-auto px-4 py-8 md:py-10">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {/* Logo and Description */}
              <div className="flex flex-col items-center md:items-start space-y-4">
                <Link className="flex items-center space-x-2" href="/">
                  {/* Desktop logo */}
                  <div className="hidden md:block">
                    <Image
                      src="/images/logo.svg"
                      alt="CommitDigest"
                      width={140}
                      height={40}
                    />
                  </div>
                  {/* Mobile logo */}
                  <div className="md:hidden flex items-center space-x-2">
                    <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                      <GitBranch className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-lg">CommitDigest</span>
                  </div>
                </Link>
                <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
                  AI-powered Git commit summaries that save developer time and
                  improve team communication.
                </p>
              </div>

              {/* Navigation Links - Closer Together */}
              <div className="flex justify-center md:justify-start md:col-span-1 lg:col-span-2">
                <div className="grid grid-cols-2 gap-12 md:gap-16 lg:gap-20">
                  <div className="flex flex-col items-center md:items-start space-y-3">
                    <h3 className="font-semibold text-sm">Product</h3>
                    <div className="flex flex-col items-center md:items-start space-y-2 text-sm">
                      <Link
                        href="/features"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Features
                      </Link>
                      <Link
                        href="/pricing"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Pricing
                      </Link>
                      <Link
                        href="/integrations"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Integrations
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-col items-center md:items-start space-y-3">
                    <h3 className="font-semibold text-sm">Resources</h3>
                    <div className="flex flex-col items-center md:items-start space-y-2 text-sm">
                      <Link
                        href="/docs"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Documentation
                      </Link>
                      <Link
                        href="#privacy"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Privacy Policy
                      </Link>
                      <Link
                        href="#terms"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Terms of Service
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border/40">
              <p className="text-center md:text-left text-sm text-muted-foreground">
                © {new Date().getFullYear()} CommitDigest. All rights reserved.
              </p>

              <div className="flex items-center gap-4">
                {/* Status Indicator */}
                <StatusIndicator />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
