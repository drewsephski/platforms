# Stripe Webhook Configuration Guide

## Overview
This guide walks you through setting up Stripe webhooks for the Platforms subscription system.

## Webhook Endpoint

**Endpoint URL:** `https://your-domain.com/api/webhooks/stripe`

**Local Development:** Use Stripe CLI to forward webhooks to localhost

## Required Webhook Events

Configure your Stripe webhook to listen for these events:

### Subscription Events
- `customer.subscription.created` - New subscription created
- `customer.subscription.updated` - Subscription changed (plan upgrade/downgrade)
- `customer.subscription.deleted` - Subscription canceled

### Checkout Events
- `checkout.session.completed` - Successful checkout (subscription or credit purchase)

### Invoice Events
- `invoice.paid` - Successful payment (triggers credit reset)
- `invoice.payment_failed` - Failed payment (marks subscription as past_due)

## Setup Instructions

### 1. Production Environment

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select the events listed above
5. Click "Add endpoint"
6. Copy the **Webhook signing secret** (starts with `whsec_`)
7. Add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

### 2. Local Development with Stripe CLI

```bash
# Install Stripe CLI (if not already installed)
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to your local dev server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI will output a webhook signing secret. Add it to your `.env.local`:
```
STRIPE_WEBHOOK_SECRET=whsec_... (from stripe listen output)
```

## Environment Variables

Ensure these are set in your environment:

```bash
# Required
STRIPE_SECRET_KEY=sk_live_... (production) or sk_test_... (development)
STRIPE_WEBHOOK_SECRET=whsec_... (from webhook configuration)
NEXT_PUBLIC_APP_URL=https://your-domain.com (or http://localhost:3000 for dev)

# Price IDs (from Stripe Dashboard)
STRIPE_PRICE_INDIE_MONTHLY=price_...
STRIPE_PRICE_INDIE_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRICE_AGENCY_MONTHLY=price_...
STRIPE_PRICE_AGENCY_YEARLY=price_...
```

## Testing Webhooks

### Using Stripe Dashboard
1. Go to your webhook endpoint in Stripe Dashboard
2. Click "Send test event"
3. Select an event type (e.g., `invoice.paid`)
4. Verify your application receives and processes the event

### Using Stripe CLI
```bash
# Trigger a test event
stripe trigger invoice.paid

# Or trigger checkout completion
stripe trigger checkout.session.completed
```

### Check Application Logs
Your application logs should show:
```
🔔 Webhook received: { hasSignature: true, signatureLength: ..., bodyLength: ... }
✅ Webhook signature verified: invoice.paid ID: evt_...
✅ Subscription updated from invoice payment
✅ Reset monthly credits for pro user: user_id (50/month)
✅ Webhook processed successfully
```

## Idempotency

The webhook handler implements idempotency using Redis. Events are tracked for 24 hours to prevent duplicate processing. If you see:
```
⏭️ Event already processed, skipping: evt_...
```
This is expected behavior for retries.

## Troubleshooting

### Webhook Signature Verification Failed
- Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
- Check that the raw body is being passed to `constructEvent` (not parsed JSON)

### Events Not Received
- Verify the endpoint URL is accessible from the internet (for production)
- Check Stripe Dashboard webhook logs for failed delivery attempts
- Ensure your server responds with 200 status for successful processing

### Credits Not Resetting
- Verify `invoice.paid` webhook is configured
- Check that the subscription has a `plan_tier` value in the database
- Look for errors in the webhook processing logs

## Security Notes

- The webhook endpoint is protected by signature verification
- Only Stripe can send valid webhook requests
- Failed signature verification returns 400 error
- No sensitive operations are performed without signature verification
