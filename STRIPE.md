# Stripe Subscription Setup GuideAdd commentMore actions

This guide will help you set up Stripe subscriptions for the CommitDigest project.

## Database Setup

1. **Run the subscription migration in your Supabase SQL Editor:**

```sql
-- Run this in your Supabase SQL Editor
\i database/migration_add_subscriptions.sql
```

This creates the following tables:

- `subscription_plans` - Available subscription plans
- `user_profiles` - Extended user data with Stripe customer IDs
- `subscriptions` - Active Stripe subscriptions
- `billing_events` - Webhook event audit trail

## Stripe Configuration

### 1. Create a Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or sign in
3. Get your API keys from the Developers section

### 2. Create Products and Prices

1. In Stripe Dashboard, go to **Products**
2. Create a product for "Pro Plan":

   - Name: "CommitDigest Pro"
   - Description: "Professional plan with advanced features"

3. Add a recurring price:
   - Amount: $15.00
   - Billing period: Monthly
   - Copy the Price ID (starts with `price_`)

### 3. Update Database with Stripe IDs

Run this SQL in Supabase to update the Pro plan with your Stripe Price ID:

```sql
UPDATE subscription_plans
SET
  stripe_price_id = 'price_YOUR_STRIPE_PRICE_ID',
  stripe_product_id = 'prod_YOUR_STRIPE_PRODUCT_ID'
WHERE name = 'Pro';
```

### 4. Environment Variables

#### Backend (apps/api/.env)

```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
```

#### Frontend (apps/web/.env.local)

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 5. Webhook Setup

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL to: `https://your-api-domain.com/api/subscriptions/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret and add it to your environment variables

## Installation

### Backend Dependencies

The Stripe Node.js SDK has already been added to the API package.json:

```bash
cd apps/api
npm install
```

### Frontend Dependencies

The Stripe React components have been added to the web package.json:

```bash
cd apps/web
npm install
```

## Features Implemented

### Backend Features

- **Subscription Management Service** (`subscriptions.service.ts`)

  - Create checkout sessions
  - Manage billing portal access
  - Handle Stripe webhooks
  - Track subscription status

- **Updated Usage Tracking**
  - Dynamic limits based on subscription plan
  - User limits function in database
  - Enhanced usage statistics

### Frontend Features

- **Pricing Page** (`/pricing`)

  - Display available plans
  - Upgrade flow with Stripe Checkout
  - Current plan highlighting

- **Subscription Management** (Dashboard)

  - Current plan display
  - Usage statistics with plan limits
  - Billing portal access
  - Upgrade prompts for free users

- **Enhanced Dashboard**
  - Plan-aware usage display
  - Upgrade buttons for free tier
  - Usage warnings and limits

## Usage Flow

### For New Users

1. Sign up for free account (automatically gets Free plan)
2. Use up to 50 monthly report runs
3. See upgrade prompts when approaching limits
4. Click upgrade to go to Stripe Checkout

### For Paid Users

1. Complete Stripe Checkout
2. Webhook updates subscription status
3. User limits automatically increase
4. Access to billing portal for subscription management

## Testing

### Test Mode

1. Use Stripe test keys for development
2. Use test credit card numbers from [Stripe Testing](https://stripe.com/docs/testing)
3. Monitor webhooks in Stripe Dashboard

### Webhook Testing

1. Use [Stripe CLI](https://stripe.com/docs/stripe-cli) for local webhook testing:

```bash
stripe listen --forward-to localhost:3003/subscriptions/webhook
```

## Production Deployment

1. Replace test keys with live keys
2. Update webhook endpoints to production URLs
3. Ensure HTTPS for webhook endpoints
4. Monitor subscription events in Stripe Dashboard

## Troubleshooting

### Common Issues

1. **Webhook signature verification fails**

   - Ensure `STRIPE_WEBHOOK_SECRET` is correct
   - Check that raw body parsing is enabled

2. **User limits not updating**

   - Check database functions are working
   - Verify webhook events are being processed

3. **Checkout session creation fails**
   - Ensure Stripe price IDs are correct in database
   - Check API keys have correct permissions

### Database Debugging

Use these SQL queries to debug subscription issues:

```sql
-- Check user limits
SELECT * FROM get_user_limits('user-uuid-here');

-- Check subscription status
SELECT * FROM subscriptions WHERE user_id = 'user-uuid-here';

-- Check billing events
SELECT * FROM billing_events WHERE user_id = 'user-uuid-here' ORDER BY created_at DESC;
```

## Security Considerations

1. **Webhook Security**

   - Always verify webhook signatures
   - Use HTTPS endpoints
   - Log and monitor webhook failures

2. **API Keys**

   - Never expose secret keys in frontend
   - Use environment variables
   - Rotate keys regularly

3. **User Data**
   - Ensure RLS policies are active
   - Validate user permissions for subscription access
   - Encrypt sensitive customer data

## Support

For issues with this implementation:

1. Check Stripe Dashboard for payment/subscription status
2. Review application logs for errors
3. Check database for data consistency
4. Monitor webhook delivery in Stripe Dashboard
