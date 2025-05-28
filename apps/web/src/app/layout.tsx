import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Noto_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CommitDigest - Automated Git Commit Summaries",
  description:
    "CommitDigest uses AI to generate clear, actionable summaries from your GitHub commits. Delivered via webhook, on your schedule.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
