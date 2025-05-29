import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { SupabaseService } from "../services/supabase.service";

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

export interface UserProfile {
  id: string;
  stripe_customer_id: string;
  current_plan_id: string;
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
}

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    const stripeSecretKey = this.configService.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is required");
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
  }

  /**
   * Get all available subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await this.supabaseService["supabase"]
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price_usd", { ascending: true });

      if (error) {
        this.logger.error("Error fetching subscription plans:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      this.logger.error("Error fetching subscription plans:", error);
      throw error;
    }
  }

  /**
   * Get or create Stripe customer for user
   */
  async getOrCreateCustomer(
    userId: string,
    email: string,
    name?: string,
  ): Promise<string> {
    try {
      // Check if user already has a Stripe customer ID
      const { data: profile } = await this.supabaseService["supabase"]
        .from("user_profiles")
        .select("stripe_customer_id")
        .eq("id", userId)
        .single();

      if (profile?.stripe_customer_id) {
        return profile.stripe_customer_id;
      }

      // Create new Stripe customer
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          user_id: userId,
        },
      });

      // Update user profile with Stripe customer ID
      await this.supabaseService["supabase"]
        .from("user_profiles")
        .update({ stripe_customer_id: customer.id })
        .eq("id", userId);

      return customer.id;
    } catch (error) {
      this.logger.error("Error getting or creating Stripe customer:", error);
      throw error;
    }
  }

  /**
   * Create a subscription checkout session
   */
  async createCheckoutSession(
    userId: string,
    planId: string,
    email: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string }> {
    try {
      // Get the plan details
      const { data: plan, error: planError } = await this.supabaseService[
        "supabase"
      ]
        .from("subscription_plans")
        .select("*")
        .eq("id", planId)
        .single();

      if (planError || !plan) {
        throw new Error("Plan not found");
      }

      if (!plan.stripe_price_id) {
        throw new Error("Plan does not have a Stripe price ID");
      }

      // Get or create Stripe customer
      const customerId = await this.getOrCreateCustomer(userId, email);

      // Create checkout session
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: plan.stripe_price_id,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: userId,
          plan_id: planId,
        },
      });

      if (!session.url) {
        throw new Error("Failed to create checkout session");
      }

      return { url: session.url };
    } catch (error) {
      this.logger.error("Error creating checkout session:", error);
      throw error;
    }
  }

  /**
   * Create a billing portal session for managing subscription
   */
  async createBillingPortalSession(
    userId: string,
    returnUrl: string,
  ): Promise<{ url: string }> {
    try {
      // Get user's Stripe customer ID
      const { data: profile } = await this.supabaseService["supabase"]
        .from("user_profiles")
        .select("stripe_customer_id")
        .eq("id", userId)
        .single();

      if (!profile?.stripe_customer_id) {
        throw new Error("User does not have a Stripe customer ID");
      }

      // Create billing portal session
      const session = await this.stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: returnUrl,
      });

      return { url: session.url };
    } catch (error) {
      this.logger.error("Error creating billing portal session:", error);
      throw error;
    }
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await this.supabaseService["supabase"]
        .from("subscriptions")
        .select(
          `
          *,
          subscription_plans (
            name,
            description,
            price_usd,
            monthly_runs_limit,
            max_repositories,
            max_reports
          )
        `,
        )
        .eq("user_id", userId)
        .eq("status", "active")
        .single();

      if (error && error.code !== "PGRST116") {
        this.logger.error("Error fetching user subscription:", error);
        throw error;
      }

      return data || null;
    } catch (error) {
      this.logger.error("Error fetching user subscription:", error);
      return null;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      this.logger.log(`Processing Stripe webhook: ${event.type}`);

      switch (event.type) {
        case "checkout.session.completed":
          await this.handleCheckoutSessionCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;

        case "invoice.payment_succeeded":
          await this.handleInvoicePaymentSucceeded(
            event.data.object as Stripe.Invoice,
          );
          break;

        case "customer.subscription.updated":
          await this.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription,
          );
          break;

        case "customer.subscription.deleted":
          await this.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription,
          );
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }

      // Log the event
      await this.logBillingEvent(event);
    } catch (error) {
      this.logger.error("Error handling webhook:", error);
      throw error;
    }
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const userId = session.metadata?.user_id;
    const planId = session.metadata?.plan_id;

    if (!userId || !planId) {
      this.logger.error(
        "Missing user_id or plan_id in checkout session metadata",
      );
      return;
    }

    if (session.subscription && typeof session.subscription === "string") {
      // Get the subscription from Stripe
      const subscription = await this.stripe.subscriptions.retrieve(
        session.subscription,
      );
      await this.createOrUpdateSubscription(userId, planId, subscription);
    }
  }

  private async handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
  ): Promise<void> {
    if (invoice.subscription && typeof invoice.subscription === "string") {
      const subscription = await this.stripe.subscriptions.retrieve(
        invoice.subscription,
      );
      await this.updateSubscriptionFromStripe(subscription);
    }
  }

  private async handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    await this.updateSubscriptionFromStripe(subscription);
  }

  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    await this.updateSubscriptionFromStripe(subscription);
  }

  private async createOrUpdateSubscription(
    userId: string,
    planId: string,
    stripeSubscription: Stripe.Subscription,
  ): Promise<void> {
    try {
      const subscriptionData = {
        user_id: userId,
        plan_id: planId,
        stripe_subscription_id: stripeSubscription.id,
        stripe_customer_id: stripeSubscription.customer as string,
        status: stripeSubscription.status,
        current_period_start: new Date(
          stripeSubscription.current_period_start * 1000,
        ).toISOString(),
        current_period_end: new Date(
          stripeSubscription.current_period_end * 1000,
        ).toISOString(),
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        canceled_at: stripeSubscription.canceled_at
          ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
          : null,
      };

      // Upsert subscription
      const { error } = await this.supabaseService["supabase"]
        .from("subscriptions")
        .upsert(subscriptionData, {
          onConflict: "stripe_subscription_id",
        });

      if (error) {
        this.logger.error("Error upserting subscription:", error);
        throw error;
      }

      // Update user profile with current plan
      if (stripeSubscription.status === "active") {
        await this.supabaseService["supabase"]
          .from("user_profiles")
          .update({ current_plan_id: planId })
          .eq("id", userId);
      }
    } catch (error) {
      this.logger.error("Error creating/updating subscription:", error);
      throw error;
    }
  }

  private async updateSubscriptionFromStripe(
    stripeSubscription: Stripe.Subscription,
  ): Promise<void> {
    try {
      const subscriptionData = {
        status: stripeSubscription.status,
        current_period_start: new Date(
          stripeSubscription.current_period_start * 1000,
        ).toISOString(),
        current_period_end: new Date(
          stripeSubscription.current_period_end * 1000,
        ).toISOString(),
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        canceled_at: stripeSubscription.canceled_at
          ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
          : null,
      };

      const { error } = await this.supabaseService["supabase"]
        .from("subscriptions")
        .update(subscriptionData)
        .eq("stripe_subscription_id", stripeSubscription.id);

      if (error) {
        this.logger.error("Error updating subscription:", error);
        throw error;
      }

      // If subscription is canceled or inactive, revert user to free plan
      if (!["active", "trialing"].includes(stripeSubscription.status)) {
        const { data: freeplan } = await this.supabaseService["supabase"]
          .from("subscription_plans")
          .select("id")
          .eq("name", "Free")
          .single();

        if (freeplan) {
          // Get user ID from subscription
          const { data: subscription } = await this.supabaseService["supabase"]
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", stripeSubscription.id)
            .single();

          if (subscription) {
            await this.supabaseService["supabase"]
              .from("user_profiles")
              .update({ current_plan_id: freeplan.id })
              .eq("id", subscription.user_id);
          }
        }
      }
    } catch (error) {
      this.logger.error("Error updating subscription from Stripe:", error);
      throw error;
    }
  }

  private async logBillingEvent(event: Stripe.Event): Promise<void> {
    try {
      const eventData = {
        stripe_event_id: event.id,
        event_type: event.type,
        event_data: event.data,
      };

      // Try to extract user_id from the event
      let userId: string | null = null;

      if (
        event.data.object &&
        "metadata" in event.data.object &&
        event.data.object.metadata
      ) {
        userId = event.data.object.metadata.user_id || null;
      }

      if (!userId && event.data.object && "customer" in event.data.object) {
        // Look up user by customer ID
        const { data: profile } = await this.supabaseService["supabase"]
          .from("user_profiles")
          .select("id")
          .eq("stripe_customer_id", event.data.object.customer)
          .single();

        userId = profile?.id || null;
      }

      await this.supabaseService["supabase"].from("billing_events").insert({
        ...eventData,
        user_id: userId,
      });
    } catch (error) {
      this.logger.error("Error logging billing event:", error);
      // Don't throw here as this is just logging
    }
  }
}
