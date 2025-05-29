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
  BadRequestException,
  UnauthorizedException,
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
    @Request() req: any,
  ) {
    if (!signature) {
      throw new BadRequestException("Missing stripe-signature header");
    }

    const webhookSecret = this.configService.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new BadRequestException("Webhook secret not configured");
    }

    let event: Stripe.Event;

    try {
      const body = req.body;

      if (!body) {
        throw new BadRequestException("No webhook payload was provided");
      }

      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(
        `Webhook signature verification failed: ${err.message}`,
      );
    }

    await this.subscriptionsService.handleWebhook(event);

    return { received: true };
  }
}
