"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, ArrowUp } from "lucide-react";
import { subscriptionService } from "@/lib/subscriptions";
import { Button } from "@/components/ui/button";

export function UsageStats() {
  const {
    data: usageStats,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["usage-stats"],
    queryFn: subscriptionService.getUsageStats,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });

  if (loading) {
    return (
      <div className="bg-card rounded-lg border p-3">
        <div className="animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !usageStats) {
    return (
      <div className="bg-card rounded-lg border p-3">
        <div className="flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="h-3 w-3" />
          <span>Usage stats unavailable</span>
        </div>
      </div>
    );
  }

  const { monthlyUsage, canRunMore, limits, runsUsed, runsRemaining } =
    usageStats;
  const usagePercentage = (runsUsed / limits.monthly_runs_limit) * 100;
  const isFreePlan = limits.plan_name === "Free";

  return (
    <div className="bg-card rounded-lg border border-l-4 border-l-green-500">
      <div className="p-4 border-b bg-muted/30">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-green-400 uppercase tracking-wide">
            {limits.plan_name} Plan
          </h3>
          {isFreePlan && (
            <Button
              size="sm"
              variant="ghost"
              asChild
              className="h-6 text-xs p-1"
            >
              <a href="/pricing">
                <ArrowUp className="h-3 w-3 mr-1" />
                Upgrade
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Usage Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Monthly Runs
            </span>
            <span className="text-xs text-muted-foreground">
              {runsUsed}/{limits.monthly_runs_limit}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                usagePercentage >= 100
                  ? "bg-red-500"
                  : usagePercentage >= 80
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            {canRunMore ? (
              <>
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">
                  {runsRemaining} runs remaining
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span className="text-xs text-red-600">
                  Monthly limit reached
                </span>
              </>
            )}
          </div>
        </div>

        {/* Plan Limits */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
          <div>
            <div className="text-muted-foreground">Repositories</div>
            <div className="font-medium">{limits.max_repositories}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Reports/Repo</div>
            <div className="font-medium">{limits.max_reports}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
