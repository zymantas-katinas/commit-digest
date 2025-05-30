import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Headers,
  RawBodyRequest,
  BadRequestException,
  UnauthorizedException,
  Req,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { SupabaseAuthGuard } from "../guards/supabase-auth.guard";
import { SubscriptionsService } from "./subscriptions.service";

@Controller("subscriptions")
export class SubscriptionsController {
  private stripe: Stripe;

  constructor(
    private subscriptionsService: SubscriptionsService,
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get("STRIPE_SECRET_KEY");
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });
  }

  @Get("plans")
  @UseGuards(SupabaseAuthGuard)
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get("current")
  @UseGuards(SupabaseAuthGuard)
  async getCurrentSubscription(@Request() req) {
    const userId = req.user.id;
    return this.subscriptionsService.getUserSubscription(userId);
  }

  @Post("checkout")
  @UseGuards(SupabaseAuthGuard)
  async createCheckoutSession(
    @Request() req,
    @Body() body: { planId: string; successUrl: string; cancelUrl: string },
  ) {
    const userId = req.user.id;
    const email = req.user.email;

    if (!body.planId || !body.successUrl || !body.cancelUrl) {
      throw new BadRequestException("Missing required fields");
    }

    return this.subscriptionsService.createCheckoutSession(
      userId,
      body.planId,
      email,
      body.successUrl,
      body.cancelUrl,
    );
  }

  @Post("billing-portal")
  @UseGuards(SupabaseAuthGuard)
  async createBillingPortalSession(
    @Request() req,
    @Body() body: { returnUrl: string },
  ) {
    const userId = req.user.id;

    if (!body.returnUrl) {
      throw new BadRequestException("Missing returnUrl");
    }

    return this.subscriptionsService.createBillingPortalSession(
      userId,
      body.returnUrl,
    );
  }

  @Post("webhook")
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers("stripe-signature") signature: string,
    @Req() req: any,
  ) {
    // Debug logging
    console.log("=== STRIPE WEBHOOK DEBUG ===");
    console.log("Headers:", {
      "stripe-signature": signature,
      "content-type": req.headers["content-type"],
      "user-agent": req.headers["user-agent"],
    });
    console.log("Body type:", typeof req.body);
    console.log("Body instanceof Buffer:", req.body instanceof Buffer);
    console.log("Body length:", req.body?.length);
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);

    if (!signature) {
      console.log("ERROR: Missing stripe-signature header");
      throw new BadRequestException("Missing stripe-signature header");
    }

    const webhookSecret = this.configService.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.log("ERROR: Webhook secret not configured");
      throw new BadRequestException("Webhook secret not configured");
    }

    let event: Stripe.Event;

    try {
      // Use the raw body stored during parsing for signature verification
      const body = req.rawBody || req.body;

      if (!body) {
        console.log("ERROR: No webhook payload was provided");
        throw new BadRequestException("No webhook payload was provided");
      }

      console.log("Attempting to construct Stripe event...");
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret,
      );
      console.log("SUCCESS: Stripe event constructed:", event.type);
    } catch (err) {
      console.log("ERROR: Webhook signature verification failed:", err.message);
      throw new BadRequestException(
        `Webhook signature verification failed: ${err.message}`,
      );
    }

    try {
      console.log("Processing webhook event:", event.type);
      await this.subscriptionsService.handleWebhook(event);
      console.log("SUCCESS: Webhook processed successfully");
    } catch (error) {
      console.log("ERROR: Failed to process webhook:", error.message);
      throw error;
    }

    return { received: true };
  }
}
