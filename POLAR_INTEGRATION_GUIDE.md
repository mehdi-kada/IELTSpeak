# Polar Payment Integration Guide for Beginners

## Table of Contents
1. [Overview](#overview)
2. [What is Polar?](#what-is-polar)
3. [Architecture Overview](#architecture-overview)
4. [Environment Setup](#environment-setup)
5. [Code Structure](#code-structure)
6. [How It Works: Step by Step](#how-it-works-step-by-step)
7. [API Routes](#api-routes)
8. [Webhooks](#webhooks)
9. [Database Schema](#database-schema)
10. [Frontend Components](#frontend-components)
11. [Testing](#testing)
12. [Production Deployment](#production-deployment)
13. [Troubleshooting](#troubleshooting)

---

## Overview

This guide explains how the IELTSpeak application integrates with Polar for subscription payments. Polar is a modern payment platform that handles subscriptions, billing, and customer management for your SaaS application.

## What is Polar?

**Polar** is a payment and subscription management platform that provides:
- 🔐 Secure payment processing
- 📊 Subscription management
- 🎯 Customer billing
- 📈 Analytics and reporting
- 🔄 Webhook notifications
- 🛡️ Built-in fraud protection

Think of it as a complete payment backend for your app - you send customers to Polar to pay, and it handles everything else.

## Architecture Overview

```
[User] → [Your App] → [Polar Checkout] → [Payment] → [Webhook] → [Your Database]
                   ↓                                    ↓
              [Database Update] ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

### Key Components:
1. **Frontend**: React components for subscription UI
2. **API Routes**: Next.js API endpoints that communicate with Polar
3. **Webhook Handler**: Receives updates from Polar about subscription changes
4. **Database Helpers**: Functions that update your Supabase database
5. **Polar SDK**: Official SDK for communicating with Polar's API

## Environment Setup

### Required Environment Variables

Add these to your `.env.local` file:

```bash
# Polar Configuration
POLAR_ACCESS_TOKEN=polar_oat_your_access_token_here
POLAR_WEBHOOK_SECRET=polar_whs_your_webhook_secret_here
NEXT_PUBLIC_POLAR_MONTHLY_PRODUCT_ID=your_monthly_product_id
NEXT_PUBLIC_POLAR_YEARLY_PRODUCT_ID=your_yearly_product_id
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (for database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Getting Polar Credentials:

1. **Sign up at [Polar.sh](https://polar.sh)**
2. **Create an Organization** in your Polar dashboard
3. **Create Products** (monthly/yearly subscriptions)
4. **Get API Credentials**:
   - Access Token: Go to Settings → API Keys
   - Webhook Secret: Go to Settings → Webhooks
   - Product IDs: Found in your Products section

## Code Structure

```
lib/polar/
├── polar.ts              # Main Polar API functions
└── subscription-helpers.ts   # Database operations

app/api/subscriptions/
├── create-checkout/route.ts   # Create payment checkout
├── cancel/route.ts           # Cancel subscription
└── status/route.ts           # Get subscription status

app/api/webhooks/polar/
└── route.ts                  # Handle Polar webhooks

components/subscription/
├── SubscriptionCard.tsx      # Subscription plans UI
└── SubscriptionStatus.tsx    # Show current status
```

## How It Works: Step by Step

### 1. User Wants to Subscribe

```typescript
// User clicks "Subscribe" button
<SubscriptionCard 
  plan="monthly" 
  productId="6e17e204-8de4-4bea-99d5-642f1d318380" 
/>
```

### 2. Create Checkout Session

```typescript
// API route: /api/subscriptions/create-checkout
const checkoutUrl = await createPolarCheckout(
  productId,
  userId,
  userEmail,
  successUrl
);
```

**What happens:**
- Your app calls Polar API to create a checkout session
- Polar returns a secure checkout URL
- User is redirected to Polar's payment page

### 3. User Pays at Polar

- User enters payment details on Polar's secure page
- Polar processes the payment
- User is redirected back to your app

### 4. Polar Sends Webhook

When payment is successful, Polar automatically sends a webhook to your app:

```typescript
// Webhook endpoint: /api/webhooks/polar
POST https://yourapp.com/api/webhooks/polar

// Payload example:
{
  "type": "subscription.created",
  "data": {
    "id": "sub_123",
    "customer_id": "cust_456", 
    "status": "active",
    "current_period_end": "2025-08-22T10:00:00Z",
    "metadata": {
      "user_id": "your_user_id"
    }
  }
}
```

### 5. Update Your Database

The webhook handler updates your Supabase database:

```typescript
// Save subscription to database
await upsertSubscription({
  user_id: "your_user_id",
  polar_subscription_id: "sub_123",
  status: "active",
  current_period_end: "2025-08-22T10:00:00Z",
  // ... other fields
});

// Update user's premium status
await updateUserStatus("your_user_id", true);
```

### 6. User Gets Premium Access

Your app checks the database and grants premium features:

```typescript
// Check if user has premium access
const isPremium = await checkUserPremiumStatus(userId);

if (isPremium) {
  // Show premium features
}
```

## API Routes

### Create Checkout (`/api/subscriptions/create-checkout`)

**Purpose**: Creates a Polar checkout session for payment

**Request:**
```typescript
POST /api/subscriptions/create-checkout
{
  "productId": "6e17e204-8de4-4bea-99d5-642f1d318380",
  "successUrl": "https://yourapp.com/dashboard?success=true"
}
```

**Response:**
```typescript
{
  "url": "https://checkout.polar.sh/checkout_session_123"
}
```

### Get Status (`/api/subscriptions/status`)

**Purpose**: Get user's current subscription status

**Response:**
```typescript
{
  "status": "active",
  "subData": {
    "plan_name": "Monthly Plan",
    "current_period_end": "2025-08-22T10:00:00Z",
    "cancel_at_period_end": false
  }
}
```

### Cancel Subscription (`/api/subscriptions/cancel`)

**Purpose**: Cancel a user's subscription

**Request:**
```typescript
POST /api/subscriptions/cancel
{
  "subscriptionId": "sub_123"
}
```

## Webhooks

Webhooks are HTTP requests that Polar sends to your app when events happen (like payments, cancellations, etc.).

### Webhook Events We Handle:

1. **`checkout.created`**: User started checkout process
2. **`subscription.created`**: New subscription was created
3. **`subscription.updated`**: Subscription details changed
4. **`subscription.canceled`**: Subscription was cancelled

### Webhook Security

Polar signs each webhook with a secret to ensure it's authentic:

```typescript
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';

try {
  const event = validateEvent(
    body,           // Raw webhook body
    headers,        // HTTP headers
    process.env.POLAR_WEBHOOK_SECRET
  );
  // Process the event...
} catch (error) {
  if (error instanceof WebhookVerificationError) {
    return Response.json({ error: "Invalid signature" }, { status: 403 });
  }
}
```

### Webhook URL Setup

In your Polar dashboard, set your webhook URL to:
```
https://yourapp.com/api/webhooks/polar
```

## Database Schema

Your Supabase database needs these tables:

### `subscriptions` table:
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  polar_subscription_id TEXT UNIQUE NOT NULL,
  polar_customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  renews_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `profiles` table (existing):
```sql
-- Add premium column to existing profiles
ALTER TABLE profiles 
ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
```

## Frontend Components

### SubscriptionCard Component

Shows available subscription plans:

```typescript
<SubscriptionCard
  title="Monthly Plan"
  price="$29"
  productId={process.env.NEXT_PUBLIC_POLAR_MONTHLY_PRODUCT_ID}
  features={[
    "Unlimited practice sessions",
    "AI feedback",
    "Progress tracking"
  ]}
/>
```

### SubscriptionStatus Component

Shows current subscription status:

```typescript
<SubscriptionStatus />
```

Displays:
- ✅ Active subscription with details
- ❌ Inactive/expired status
- ⚠️ Cancelled (but still active until period end)
- 🔄 Loading states

## Testing

### 1. Test Checkout Flow

```typescript
// Create a test checkout
const response = await fetch('/api/subscriptions/create-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: process.env.NEXT_PUBLIC_POLAR_MONTHLY_PRODUCT_ID
  })
});

const { url } = await response.json();
// Visit this URL to test payment
```

### 2. Test Webhooks Locally

Use a tool like **ngrok** to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000

# Use the ngrok URL in Polar webhook settings
# Example: https://abc123.ngrok.io/api/webhooks/polar
```

### 3. Monitor Webhook Events

Check your app logs to see webhook events:

```bash
# In your Next.js console, you'll see:
Received Polar webhook: subscription.created
Handling subscription creation: sub_123
Updated database with subscription data successfully
```

## Production Deployment

### 1. Update Environment Variables

```bash
# Change to production values
POLAR_ACCESS_TOKEN=polar_oat_PRODUCTION_TOKEN
POLAR_WEBHOOK_SECRET=polar_whs_PRODUCTION_SECRET
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Update Polar Server URL

```typescript
// In lib/polar/polar.ts
export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  serverURL: "https://api.polar.sh"  // Remove "sandbox-" for production
});
```

### 3. Set Production Webhook URL

In Polar dashboard, update webhook URL to:
```
https://yourdomain.com/api/webhooks/polar
```

### 4. Test Production Flow

1. Create a real subscription
2. Verify webhook delivery
3. Check database updates
4. Confirm user gets premium access

## Troubleshooting

### Common Issues:

#### 1. "No signature provided" Error
**Problem**: Webhook signature verification failing
**Solution**: 
- Check `POLAR_WEBHOOK_SECRET` is correct
- Ensure webhook URL is set in Polar dashboard
- Verify webhook endpoint is accessible

#### 2. "Invalid signature" Error  
**Problem**: Webhook signature doesn't match
**Solution**:
- Regenerate webhook secret in Polar dashboard
- Update `POLAR_WEBHOOK_SECRET` in your environment
- Ensure you're using the raw request body for verification

#### 3. Database Upsert Failing
**Problem**: Subscription data not saving
**Solution**:
- Check Supabase connection
- Verify `SUPABASE_SERVICE_ROLE_KEY` permissions
- Check database schema matches code

#### 4. Checkout URL Not Working
**Problem**: Polar checkout not creating properly
**Solution**:
- Verify `POLAR_ACCESS_TOKEN` is valid
- Check product IDs are correct
- Ensure user data is being passed correctly

#### 5. User Not Getting Premium Access
**Problem**: Premium status not updating
**Solution**:
- Check webhook is being received
- Verify `updateUserStatus` function is working
- Check database for subscription record

### Debugging Tips:

1. **Enable Logging**: Add console logs to track flow
2. **Check Polar Dashboard**: Monitor webhook deliveries
3. **Use Supabase Dashboard**: Check database updates
4. **Test Each Step**: Isolate where the process breaks

### Support Resources:

- **Polar Documentation**: [docs.polar.sh](https://docs.polar.sh)
- **Polar Discord**: [discord.gg/polar](https://discord.gg/polar)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

## Quick Start Checklist

- [ ] Set up Polar account and get credentials
- [ ] Add environment variables
- [ ] Create database tables
- [ ] Test checkout flow locally
- [ ] Set up webhook endpoint
- [ ] Test webhook delivery
- [ ] Deploy to production
- [ ] Update production settings
- [ ] Test end-to-end flow

---

**Congratulations!** 🎉 You now have a complete understanding of how Polar payments work in your application. The system handles everything from checkout creation to webhook processing, giving your users a seamless subscription experience.
