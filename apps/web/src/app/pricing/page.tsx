import { Pricing } from "@/components/pricing";
import { AppHeader } from "@/components/app-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affordable AI Git Analysis Plans - CommitDigest Pricing",
  description:
    "Choose the perfect CommitDigest plan for your development team. Transparent pricing for AI-powered git commit summaries, automated reporting, and intelligent webhook integrations. Free plan available with no setup fees. Save developer time and improve team productivity with affordable git analysis starting today.",
  keywords: [
    "CommitDigest pricing",
    "affordable git summary tool",
    "AI code reporting plans",
    "commit analysis pricing",
    "developer productivity pricing",
    "git analysis subscription",
    "automated commit reports cost",
    "webhook git integration pricing",
    "AI git analysis plans",
    "GitHub analysis pricing",
    "team git reporting cost",
    "intelligent commit summary pricing",
    "development tool subscription",
    "git workflow automation pricing",
    "engineering manager tools pricing",
    "Slack git integration cost",
    "Discord git updates pricing",
    "enterprise git analysis pricing",
    "startup developer tools pricing",
    "free git commit summarizer",
  ],
  openGraph: {
    title: "Affordable AI Git Analysis Plans - CommitDigest Pricing",
    description:
      "Transparent pricing for AI-powered git commit summaries and automated reporting. Plans starting free for small teams, with enterprise options available for larger organizations.",
    url: "https://commitdigest.com/pricing",
  },
  alternates: {
    canonical: "https://commitdigest.com/pricing",
  },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pt-16">
        <Pricing />
      </main>
    </div>
  );
}
