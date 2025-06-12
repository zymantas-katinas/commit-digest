"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CheckCircle, Star, Zap } from "lucide-react";
import { subscriptionService, SubscriptionPlan } from "@/lib/subscriptions";
import { useAuthStore } from "@/stores/auth";

interface PricingProps {
  showHeader?: boolean;
  embedded?: boolean;
}

export function Pricing({ showHeader = true, embedded = false }: PricingProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: subscriptionService.getPlans,
  });

  const { data: currentSubscription } = useQuery({
    queryKey: ["current-subscription"],
    queryFn: subscriptionService.getCurrentSubscription,
    enabled: !!user,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      const successUrl = `${window.location.origin}/dashboard?success=true`;
      const cancelUrl = `${window.location.origin}/pricing?canceled=true`;

      return subscriptionService.createCheckoutSession(
        planId,
        successUrl,
        cancelUrl,
      );
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      console.error("Error creating checkout session:", error);
      setLoadingPlanId(null);
    },
  });

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (!user) return;

    setLoadingPlanId(plan.id);
    checkoutMutation.mutate(plan.id);
  };

  const getPlanFeatures = (plan: SubscriptionPlan) => {
    const features = [
      `${plan.monthly_runs_limit} monthly report runs`,
      plan.max_repositories >= 9999
        ? "Unlimited repositories"
        : `Up to ${plan.max_repositories} repositories`,
      plan.max_reports >= 9999
        ? "Unlimited total reports"
        : `Up to ${plan.max_reports} total reports`,
    ];

    if (plan.name === "Pro") {
      features.push("Priority support");
      features.push("Advanced analytics");
      features.push("Custom integrations");
    }

    if (plan.name === "Free") {
      features.push("Basic webhook integration");
      features.push("Community support");
    }

    return features;
  };

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    if (plan.name === "Free" && !currentSubscription) return true;
    return currentSubscription?.subscription_plans?.id === plan.id;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!plans) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to load pricing plans.</p>
      </div>
    );
  }

  return (
    <div className={embedded ? "" : "container mx-auto px-4 py-8"}>
      {showHeader && (
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Scale your commit reporting with plans designed for teams of all
            sizes. Start free and upgrade as you grow.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const isPopular = plan.name === "Pro";
          const isCurrent = isCurrentPlan(plan);
          const features = getPlanFeatures(plan);

          return (
            <Card
              key={plan.id}
              className={`relative ${
                isPopular ? "border-primary shadow-lg" : ""
              } ${isCurrent ? "ring-2 ring-primary" : ""}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                  {plan.name === "Pro" && (
                    <Zap className="h-6 w-6 text-yellow-500" />
                  )}
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price_usd}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {user ? (
                  <Button
                    onClick={() => handleUpgrade(plan)}
                    disabled={
                      isCurrent ||
                      loadingPlanId === plan.id ||
                      checkoutMutation.isPending
                    }
                    className="w-full"
                    variant={isPopular ? "default" : "outline"}
                  >
                    {loadingPlanId === plan.id ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : null}
                    {isCurrent
                      ? "Current Plan"
                      : plan.name === "Free"
                        ? "Get Started Free"
                        : "Upgrade Now"}
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" asChild>
                    <a href="/login">Sign Up to Get Started</a>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <p className="text-muted-foreground">
          Need more? Contact us for enterprise plans with custom limits and
          features.
        </p>
        <Button variant="link" className="mt-2">
          Contact Sales
        </Button>
      </div>
    </div>
  );
}
