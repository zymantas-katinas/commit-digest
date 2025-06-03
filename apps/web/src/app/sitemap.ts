import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://commitdigest.com";
  const currentDate = new Date();

  // Static pages with their priority and change frequency
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    // {
    //   url: `${baseUrl}/blog`,
    //   lastModified: currentDate,
    //   changeFrequency: "weekly" as const,
    //   priority: 0.8,
    // },
    {
      url: `${baseUrl}/docs`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/integrations`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/integrations/slack`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/integrations/discord`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ];

  // Blog posts with recent dates and high priority for SEO
  // const blogPosts = [
  //   {
  //     url: `${baseUrl}/blog/beyond-diff-ai-git-history-understandable`,
  //     lastModified: new Date("2024-01-15"),
  //     changeFrequency: "monthly" as const,
  //     priority: 0.8,
  //   },
  //   {
  //     url: `${baseUrl}/blog/engineering-manager-guide-automated-code-insights`,
  //     lastModified: new Date("2024-01-12"),
  //     changeFrequency: "monthly" as const,
  //     priority: 0.8,
  //   },
  //   {
  //     url: `${baseUrl}/blog/team-drowning-git-logs-smarter-summary-tool`,
  //     lastModified: new Date("2024-01-10"),
  //     changeFrequency: "monthly" as const,
  //     priority: 0.8,
  //   },
  //   {
  //     url: `${baseUrl}/blog/raw-commits-clear-reports-summarization-process`,
  //     lastModified: new Date("2024-01-08"),
  //     changeFrequency: "monthly" as const,
  //     priority: 0.7,
  //   },
  //   {
  //     url: `${baseUrl}/blog/integrating-impact-git-summaries-team-daily-flow`,
  //     lastModified: new Date("2024-01-05"),
  //     changeFrequency: "monthly" as const,
  //     priority: 0.7,
  //   },
  //   {
  //     url: `${baseUrl}/blog/ai-transforming-developer-productivity-2024-data-insights`,
  //     lastModified: new Date("2024-01-03"),
  //     changeFrequency: "monthly" as const,
  //     priority: 0.7,
  //   },
  //   {
  //     url: `${baseUrl}/blog/critical-git-reporting-challenges-engineering-managers`,
  //     lastModified: new Date("2024-01-01"),
  //     changeFrequency: "monthly" as const,
  //     priority: 0.7,
  //   },
  //   {
  //     url: `${baseUrl}/blog/writing-better-git-commit-messages-ai-analysis`,
  //     lastModified: new Date("2023-12-28"),
  //     changeFrequency: "monthly" as const,
  //     priority: 0.6,
  //   },
  // ];

  return [...staticPages];
}
