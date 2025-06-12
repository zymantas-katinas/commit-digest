import type { Metadata } from "next";
import { Noto_Sans, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Geist({ subsets: ["latin"] });
const mono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CommitDigest - Understand Your Code's Progress, Effortlessly",
    template: "%s - CommitDigest",
  },
  description:
    "Transform your development workflow with AI-powered Git commit summaries. CommitDigest automatically analyzes GitHub repositories and delivers intelligent, human-readable code progress reports directly to Slack, Discord, and custom integrations. Save developer time, improve team alignment, and keep stakeholders informed effortlessly.",
  keywords: [
    "AI git analysis",
    "automated commit summary",
    "GitHub digest",
    "git commit summarizer",
    "understand git history",
    "developer productivity tools git",
    "time-saving git workflow",
    "AI for GitHub",
    "automated git reporting",
    "team code progress tracking",
    "human-readable git log",
    "LLM for git commits",
    "intelligent code summary",
    "daily git activity report",
    "git reporting for managers",
    "engineering manager git dashboard",
    "Slack git integration",
    "Discord git updates",
    "webhook git notifications",
    "automated changelog generation",
    "code progress summary",
    "analyze git logs",
    "efficient code review",
    "share code updates team",
    "how to automatically summarize git commits",
    "send git summary to Slack",
    "GitHub to Discord webhook",
    "custom git reporting webhook",
    "reduce time reviewing git logs",
    "streamline git process",
    "developer efficiency platform",
    "project momentum tracking git",
    "keep stakeholders informed development",
    "GitHub activity feed",
  ],
  authors: [{ name: "CommitDigest Team" }],
  creator: "CommitDigest",
  publisher: "CommitDigest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://commitdigest.com",
    siteName: "CommitDigest",
    title: "CommitDigest - Understand Your Code's Progress, Effortlessly",
    description:
      "AI-powered Git commit summaries that save developer time. Automatically analyze GitHub repositories and get intelligent, human-readable code progress reports delivered to your team.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CommitDigest - AI-Powered Git Commit Analysis and Automated Reporting",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CommitDigest - AI-Powered Git Commit Summaries",
    description:
      "Transform endless Git logs into clear, actionable insights. Save developer time and improve team alignment with intelligent commit analysis.",
    images: ["/og-image.png"],
    creator: "@commitdigest",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "https://commitdigest.com",
  },
  category: "Developer Tools",
  manifest: `/favicon/site.webmanifest`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
