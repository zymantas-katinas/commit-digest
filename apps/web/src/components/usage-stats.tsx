"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

interface MonthlyUsage {
  user_id: string;
  month: string;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  total_tokens: number;
  total_cost_usd: number;
  last_run_at: string | null;
}

interface UsageStats {
  monthlyUsage: MonthlyUsage;
  canRunMore: boolean;
  monthlyLimit: number;
}

export function UsageStats() {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      setLoading(true);
      const response = await api.getUsageStats();
      setUsageStats(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

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

  const { monthlyUsage, canRunMore, monthlyLimit } = usageStats;
  const usagePercentage = (monthlyUsage.successful_runs / monthlyLimit) * 100;

  return (
    <div className="bg-card rounded-lg border p-3">
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Monthly Usage
          </span>
          <span className="text-xs text-muted-foreground">
            {monthlyUsage.successful_runs}/{monthlyLimit}
          </span>
        </div>

        {/* Progress Bar */}
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

        {/* Status */}
        <div className="flex items-center gap-1.5">
          {canRunMore ? (
            <>
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">
                {monthlyLimit - monthlyUsage.successful_runs} runs remaining
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
    </div>
  );
}
