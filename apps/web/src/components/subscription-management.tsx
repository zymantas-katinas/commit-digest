"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  CreditCard,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
} from "lucide-react";
import { subscriptionService } from "@/lib/subscriptions";
import { useAuthStore } from "@/stores/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SubscriptionManagement() {
  const { user } = useAuthStore();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["current-subscription"],
    queryFn: subscriptionService.getCurrentSubscription,
    enabled: !!user,
  });

  const { data: usageStats, isLoading: usageLoading } = useQuery({
    queryKey: ["usage-stats"],
    queryFn: subscriptionService.getUsageStats,
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const billingPortalMutation = useMutation({
    mutationFn: async () => {
      const returnUrl = `${window.location.origin}/dashboard`;
      return subscriptionService.createBillingPortalSession(returnUrl);
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      console.error("Error opening billing portal:", error);
      setIsLoadingPortal(false);
    },
  });

  const handleBillingPortal = () => {
    setIsLoadingPortal(true);
    billingPortalMutation.mutate();
  };

  if (subscriptionLoading || usageLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const planName =
    subscription?.subscription_plans?.name ||
    usageStats?.limits.plan_name ||
    "Free";
  const isFreePlan = planName === "Free";
  const usagePercentage = usageStats
    ? (usageStats.runsUsed / usageStats.monthlyLimit) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{planName} Plan</h3>
              {subscription?.subscription_plans && (
                <p className="text-sm text-muted-foreground">
                  ${subscription.subscription_plans.price_usd}/month
                </p>
              )}
            </div>
            <div className="text-right">
              {subscription && (
                <div className="space-y-1">
                  <p className="text-sm">
                    Status:{" "}
                    <span className="capitalize font-medium">
                      {subscription.status}
                    </span>
                  </p>
                  {subscription.current_period_end && (
                    <p className="text-sm text-muted-foreground">
                      Next billing:{" "}
                      {new Date(
                        subscription.current_period_end,
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {!isFreePlan && subscription && (
              <Button
                onClick={handleBillingPortal}
                disabled={isLoadingPortal || billingPortalMutation.isPending}
                variant="outline"
              >
                {isLoadingPortal ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Manage Billing
              </Button>
            )}

            {isFreePlan && (
              <Button asChild>
                <a href="/pricing">
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics Card */}
      {usageStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Usage This Month
            </CardTitle>
            <CardDescription>
              Track your report generation usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Usage Alert */}
            {usagePercentage >= 80 && (
              <Alert
                variant={usagePercentage >= 100 ? "destructive" : "default"}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {usagePercentage >= 100
                    ? `You've reached your monthly limit of ${usageStats.monthlyLimit} reports. Upgrade to continue generating reports.`
                    : `You've used ${Math.round(usagePercentage)}% of your monthly limit. Consider upgrading if you need more reports.`}
                </AlertDescription>
              </Alert>
            )}

            {/* Usage Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Report Runs</span>
                <span>
                  {usageStats.runsUsed} / {usageStats.monthlyLimit}
                </span>
              </div>
              <Progress
                value={Math.min(usagePercentage, 100)}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {usageStats.runsRemaining} runs remaining this month
              </p>
            </div>

            {/* Plan Limits */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <p className="text-sm font-medium">Monthly Runs</p>
                <p className="text-2xl font-bold">
                  {usageStats.limits.monthly_runs_limit}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Repositories</p>
                <p className="text-2xl font-bold">
                  {usageStats.currentRepositories}
                  {usageStats.limits.max_repositories >= 9999
                    ? ""
                    : `/${usageStats.limits.max_repositories}`}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Total Reports</p>
                <p className="text-2xl font-bold">
                  {usageStats.currentReports}
                  {usageStats.limits.max_reports >= 9999
                    ? ""
                    : `/${usageStats.limits.max_reports}`}
                </p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>
                  Successful: {usageStats.monthlyUsage.successful_runs}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span>Failed: {usageStats.monthlyUsage.failed_runs}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span>
                  Tokens Used:{" "}
                  {usageStats.monthlyUsage.total_tokens.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span>
                  Last Run:{" "}
                  {usageStats.monthlyUsage.last_run_at
                    ? new Date(
                        usageStats.monthlyUsage.last_run_at,
                      ).toLocaleDateString()
                    : "Never"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
