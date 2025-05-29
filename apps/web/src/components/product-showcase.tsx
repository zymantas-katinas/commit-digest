"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <section
      id="product-showcase"
      className="container space-y-6 py-8 md:py-12 lg:py-20"
    >
      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-bold leading-tight tracking-tighter md:text-4xl">
          Clean. Clear. Concise.
        </h2>
      </div>
      <div className="mx-auto max-w-[800px]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
            </CardTitle>

            {/* Tab Navigation */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "summary"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab("raw")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "raw"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Webhook Payload
              </button>
              <button
                onClick={() => setActiveTab("commits")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "commits"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Source Commits
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Tab */}
            {activeTab === "summary" && (
              <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                <div className="text-green-400">
                  # Weekly Development Summary
                </div>
                <div className="mt-2 text-muted-foreground">
                  **Repository:** my-awesome-project
                  <br />
                  **Period:** Dec 1-7, 2024
                  <br />
                  **Total Commits:** 23
                </div>
                <div className="mt-4">
                  <div className="text-blue-400">## Key Highlights</div>
                  <div className="mt-2 space-y-1 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Implemented user authentication system</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Added comprehensive test coverage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Optimized database queries for performance</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-blue-400">## Breaking Changes</div>
                  <div className="mt-2 text-orange-400">
                    • Updated API endpoints for authentication
                  </div>
                </div>
              </div>
            )}

            {/* Raw Response Tab */}
            {activeTab === "raw" && (
              <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                <div className="text-yellow-400"># Webhook Payload (JSON)</div>
                <div className="mt-2 text-xs text-muted-foreground mb-4">
                  This is the actual JSON payload delivered to your webhook
                  endpoint
                </div>
                <div className="bg-black/50 rounded p-3 overflow-x-auto">
                  <pre className="text-xs text-muted-foreground">
                    {`{
  "content": "# Weekly Development Summary\\n\\n**Repository:** my-awesome-project\\n**Period:** Dec 1-7, 2024\\n**Total Commits:** 23\\n\\n## Key Highlights\\n\\n✅ Implemented user authentication system\\n✅ Added comprehensive test coverage\\n✅ Optimized database queries for performance\\n\\n## Breaking Changes\\n\\n• Updated API endpoints for authentication\\n\\n## Next Week Focus\\n\\n• Deploy authentication to staging\\n• Performance testing and optimization",
  "timestamp": "2024-12-07T15:30:00.000Z",
  "repository": "https://github.com/mycompany/my-awesome-project",
  "branch": "main",
  "commitsCount": 23,
  "dateRange": {
    "since": "2024-12-01T00:00:00.000Z",
    "until": "2024-12-07T23:59:59.000Z"
  },
  "isTest": false,
  "isManual": false
}`}
                  </pre>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-blue-400 font-medium">
                        Key Fields:
                      </div>
                      <div className="mt-1 space-y-1">
                        <div>
                          <span className="text-green-400">content</span> -
                          Markdown report
                        </div>
                        <div>
                          <span className="text-green-400">timestamp</span> -
                          When sent
                        </div>
                        <div>
                          <span className="text-green-400">repository</span> -
                          GitHub URL
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-medium">Metadata:</div>
                      <div className="mt-1 space-y-1">
                        <div>
                          <span className="text-green-400">branch</span> - Git
                          branch
                        </div>
                        <div>
                          <span className="text-green-400">commitsCount</span> -
                          # of commits
                        </div>
                        <div>
                          <span className="text-green-400">dateRange</span> -
                          Time period
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Source Commits Tab */}
            {activeTab === "commits" && (
              <div className="rounded-lg bg-muted p-4 font-mono text-sm max-h-96 overflow-y-auto">
                <div className="text-purple-400"># Original Commit History</div>
                <div className="mt-4 space-y-3 text-muted-foreground">
                  <div className="border-l-2 border-green-500 pl-3">
                    <div className="text-white">
                      feat: implement JWT authentication system
                    </div>
                    <div className="text-xs text-muted-foreground">
                      abc123d • john.doe@company.com • 2 hours ago
                    </div>
                  </div>
                  <div className="border-l-2 border-blue-500 pl-3">
                    <div className="text-white">
                      test: add comprehensive auth service tests
                    </div>
                    <div className="text-xs text-muted-foreground">
                      def456e • jane.smith@company.com • 4 hours ago
                    </div>
                  </div>
                  <div className="border-l-2 border-yellow-500 pl-3">
                    <div className="text-white">
                      perf: optimize database connection pooling
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ghi789f • mike.wilson@company.com • 6 hours ago
                    </div>
                  </div>
                  <div className="border-l-2 border-green-500 pl-3">
                    <div className="text-white">
                      feat: add password reset functionality
                    </div>
                    <div className="text-xs text-muted-foreground">
                      jkl012g • sarah.johnson@company.com • 8 hours ago
                    </div>
                  </div>
                  <div className="border-l-2 border-red-500 pl-3">
                    <div className="text-white">
                      fix: resolve session timeout edge case
                    </div>
                    <div className="text-xs text-muted-foreground">
                      mno345h • david.brown@company.com • 10 hours ago
                    </div>
                  </div>
                  <div className="border-l-2 border-blue-500 pl-3">
                    <div className="text-white">
                      test: integration tests for login endpoints
                    </div>
                    <div className="text-xs text-muted-foreground">
                      pqr678i • lisa.garcia@company.com • 12 hours ago
                    </div>
                  </div>
                  <div className="border-l-2 border-yellow-500 pl-3">
                    <div className="text-white">
                      perf: improve query performance in user lookup
                    </div>
                    <div className="text-xs text-muted-foreground">
                      stu901j • alex.kim@company.com • 14 hours ago
                    </div>
                  </div>
                  <div className="text-center text-xs text-muted-foreground pt-2 border-t">
                    ... and 16 more commits
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
