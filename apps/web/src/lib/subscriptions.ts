import { apiClient } from "./api";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_usd: number;
  stripe_price_id: string;
  stripe_product_id: string;
  monthly_runs_limit: number;
  max_repositories: number;
  max_reports: number;
  is_active: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  subscription_plans?: SubscriptionPlan;
}

export interface UserLimits {
  monthly_runs_limit: number;
  max_repositories: number;
  max_reports: number;
  plan_name: string;
}

export interface UsageStats {
  monthlyUsage: {
    user_id: string;
    month: string;
    total_runs: number;
    successful_runs: number;
    failed_runs: number;
    total_tokens: number;
    last_run_at: string | null;
  };
  canRunMore: boolean;
  limits: UserLimits;
  monthlyLimit: number;
  runsUsed: number;
  runsRemaining: number;
  currentRepositories: number;
  currentReports: number;
}

export const subscriptionService = {
  // Get available subscription plans
  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data } = await apiClient.get("/subscriptions/plans");
    return data;
  },

  // Get current user subscription
  async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      const { data } = await apiClient.get("/subscriptions/current");
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Create checkout session
  async createCheckoutSession(
    planId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string }> {
    const { data } = await apiClient.post("/subscriptions/checkout", {
      planId,
      successUrl,
      cancelUrl,
    });
    return data;
  },

  // Create billing portal session
  async createBillingPortalSession(
    returnUrl: string,
  ): Promise<{ url: string }> {
    const { data } = await apiClient.post("/subscriptions/billing-portal", {
      returnUrl,
    });
    return data;
  },

  // Get usage statistics with limits
  async getUsageStats(): Promise<UsageStats> {
    const { data } = await apiClient.get("/report-runs/usage");
    return data;
  },
};
