# Comprehensive Polar Payment Integration Guide for Beginners

## Table of Contents

1. [Payment Gateway Fundamentals](#payment-gateway-fundamentals)
2. [Understanding Polar](#understanding-polar)
3. [Key Payment Concepts](#key-payment-concepts)
4. [Polar Setup & Configuration](#polar-setup--configuration)
5. [Implementation Guide](#implementation-guide)
6. [Security Best Practices](#security-best-practices)
7. [Testing & Debugging](#testing--debugging)
8. [Production Checklist](#production-checklist)

## Payment Gateway Fundamentals

### What is a Payment Gateway?

A payment gateway is a service that processes online payments by securely transmitting payment information between your website, the customer's bank, and the merchant's bank.

### How Payment Processing Works:

1. **Customer initiates payment** → Enters card details on your website
2. **Data encryption** → Payment info is encrypted and sent to payment gateway
3. **Authorization** → Gateway contacts customer's bank to verify funds
4. **Response** → Bank approves/declines and sends response back
5. **Settlement** → If approved, funds are transferred to your account

### Key Players:

- **Customer**: The person making the payment
- **Merchant**: You (the business receiving payment)
- **Payment Gateway**: Polar (handles the technical processing)
- **Acquiring Bank**: Your bank that receives the money
- **Issuing Bank**: Customer's bank that issued their card

## Understanding Polar

### What is Polar?

Polar is a modern payment platform designed for creators and SaaS businesses. It specializes in:

- Subscription management
- One-time payments
- Digital product sales
- Creator monetization

### Why Polar?

- **Developer-friendly**: Great APIs and SDKs
- **Built for creators**: Perfect for apps like yours (TOEFL practice)
- **Low fees**: Competitive pricing
- **Modern features**: Supports modern payment methods
- **Global reach**: Supports international payments

## Key Payment Concepts

### 1. Products vs Subscriptions

- **Products**: One-time purchases (e.g., single practice session)
- **Subscriptions**: Recurring payments (e.g., monthly access)

### 2. Webhooks

Webhooks are HTTP callbacks that Polar sends to your server when events happen:

- Payment completed
- Subscription canceled
- Payment failed

**Why webhooks matter**: They ensure your app stays in sync with payment status even if the user closes their browser.

### 3. Customer vs User

- **Customer**: Entity in Polar's system who makes payments
- **User**: Entity in your app (they can be linked)

### 4. Checkout Sessions

A secure, hosted payment page where customers enter payment details. Polar handles all the complexity.

### 5. Payment States

- **Pending**: Payment initiated but not completed
- **Succeeded**: Payment completed successfully
- **Failed**: Payment was declined or failed
- **Canceled**: Payment was canceled by user

## Polar Setup & Configuration

### Step 1: Create Polar Account

1. Go to [polar.sh](https://polar.sh)
2. Sign up for a developer account
3. Verify your email
4. Complete organization setup

### Step 2: Get API Credentials

1. Go to Settings → API Keys
2. Create a new API key
3. Note down:
   - **Access Token**: For API calls
   - **Webhook Secret**: For verifying webhook authenticity

### Step 3: Configure Webhooks

1. In Polar dashboard → Settings → Webhooks
2. Add webhook endpoint: `https://yourdomain.com/api/webhooks/polar`
3. Select events to listen for:
   - `order.created`
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`

### Step 4: Create Products

1. Go to Products section
2. Create products for your app:
   - Individual practice sessions
   - Monthly subscription
   - Premium features

## Implementation Guide

The implementation consists of several key components. Each code example below includes detailed comments explaining what each part does and why it's necessary.

### 1. Environment Configuration

First, update your `.env.local` file with actual Polar credentials:

```bash
# Google API for your existing functionality
GOOGLE_API_KEY=your_google_api_key

# VAPI for voice functionality
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_key

# Polar Payment Gateway Configuration
# Access token - used to authenticate API calls to Polar
# Get this from Polar Dashboard → Settings → API Keys
POLAR_ACCESS_TOKEN=polar_pat_your_actual_access_token

# Webhook secret - used to verify that webhooks actually come from Polar
# This prevents malicious actors from sending fake payment notifications
# Get this from Polar Dashboard → Settings → Webhooks
POLAR_WEBHOOK_SECRET=polar_wh_your_actual_webhook_secret

# Your organization ID from Polar (found in dashboard)
POLAR_ORGANIZATION_ID=your_org_id

# Supabase configuration (your existing database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Types and Interfaces

Create or update `types/types.ts` to include payment-related types:

```typescript
// types/types.ts

// Existing types...
// ...existing code...

// Polar-specific types for type safety
export interface PolarProduct {
  id: string; // Unique identifier for the product
  name: string; // Display name (e.g., "Premium TOEFL Practice")
  description?: string; // Optional description for the product
  price: number; // Price in cents (e.g., 999 = $9.99)
  currency: string; // Currency code (e.g., "USD")
  type: "one_time" | "recurring"; // Whether it's a one-time purchase or subscription
  recurring_interval?: "month" | "year"; // For subscriptions only
}

// Represents a customer in Polar's system
export interface PolarCustomer {
  id: string; // Polar's customer ID
  email: string; // Customer's email address
  name?: string; // Optional customer name
  metadata?: Record<string, any>; // Custom data you want to store
}

// Checkout session for payment processing
export interface CheckoutSession {
  id: string; // Session ID from Polar
  url: string; // URL to redirect user for payment
  customer_id?: string; // Associated customer ID
  product_id: string; // Product being purchased
  success_url: string; // Where to redirect after successful payment
  cancel_url: string; // Where to redirect if user cancels
}

// Subscription information
export interface Subscription {
  id: string; // Subscription ID
  customer_id: string; // Who owns this subscription
  product_id: string; // What product they're subscribed to
  status: "active" | "canceled" | "past_due" | "trialing"; // Current status
  current_period_start: string; // When current billing period started
  current_period_end: string; // When current billing period ends
  created_at: string; // When subscription was created
}

// Payment/Order information
export interface Order {
  id: string; // Order ID from Polar
  customer_id: string; // Who made the purchase
  product_id: string; // What was purchased
  amount: number; // Amount paid (in cents)
  currency: string; // Currency used
  status: "pending" | "succeeded" | "failed"; // Payment status
  created_at: string; // When order was created
}

// Database schema for storing payment info in Supabase
export interface UserSubscription {
  id: string; // Primary key
  user_id: string; // Your app's user ID (links to auth.users)
  polar_customer_id: string; // Polar's customer ID
  polar_subscription_id?: string; // Polar's subscription ID (if applicable)
  product_type: string; // What they purchased ("premium", "basic", etc.)
  status: string; // Current subscription status
  expires_at?: string; // When subscription expires
  created_at: string; // When record was created
  updated_at: string; // When record was last updated
}
```

### 3. Polar Client Configuration

Create `lib/polar-client.ts` to handle all Polar API interactions:

```typescript
// lib/polar-client.ts
import { PolarApi, Configuration } from "@polar-sh/sdk";

// Initialize Polar API client with authentication
// This client will be used for all API calls to Polar
const configuration = new Configuration({
  // Access token from environment variables
  // This authenticates our server with Polar's API
  accessToken: process.env.POLAR_ACCESS_TOKEN,

  // Base URL for Polar API (use sandbox for testing)
  // Switch to production URL when going live
  basePath:
    process.env.NODE_ENV === "production"
      ? "https://api.polar.sh"
      : "https://sandbox-api.polar.sh",
});

// Create the main API client instance
// This handles HTTP requests, authentication, and response parsing
export const polarApi = new PolarApi(configuration);

// Helper function to get organization ID from environment
// Organization ID is required for most Polar API calls
export const getOrganizationId = (): string => {
  const orgId = process.env.POLAR_ORGANIZATION_ID;
  if (!orgId) {
    throw new Error("POLAR_ORGANIZATION_ID environment variable is required");
  }
  return orgId;
};

// Helper function to verify webhook signatures
// This ensures webhooks actually come from Polar, not malicious actors
export const verifyWebhookSignature = (
  payload: string, // Raw webhook payload
  signature: string, // Signature from webhook headers
  secret: string // Your webhook secret from environment
): boolean => {
  try {
    // Import crypto for signature verification
    const crypto = require("crypto");

    // Create HMAC hash using your webhook secret
    // HMAC ensures the payload hasn't been tampered with
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("hex");

    // Compare signatures securely (prevents timing attacks)
    // This is safer than simple string comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
};

// Helper to create a customer in Polar
// This links your app's users with Polar's customer system
export const createPolarCustomer = async (
  email: string, // User's email address
  name?: string, // Optional user name
  metadata?: Record<string, any> // Custom data to store with customer
) => {
  try {
    const response = await polarApi.customersCreate({
      organization_id: getOrganizationId(),
      customer_create: {
        email,
        name,
        metadata: {
          // Add source information to track where customer came from
          source: "toeilet_app",
          ...metadata,
        },
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating Polar customer:", error);
    throw error;
  }
};

// Helper to create a checkout session for payment
// This generates a secure payment URL that users can visit
export const createCheckoutSession = async (
  productId: string, // ID of product to purchase
  customerId: string, // Customer making the purchase
  successUrl: string, // Where to redirect after successful payment
  cancelUrl: string // Where to redirect if payment is canceled
) => {
  try {
    const response = await polarApi.checkoutSessionsCreate({
      checkout_session_create: {
        product_id: productId,
        customer_id: customerId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        // Additional configuration
        payment_processor: "stripe", // Polar uses Stripe under the hood
        metadata: {
          source: "toeilet_app",
          timestamp: new Date().toISOString(),
        },
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};
```

### 4. Database Schema

Add these tables to your Supabase database. Run these SQL commands in Supabase SQL Editor:

```sql
-- Create subscriptions table to track user purchases
-- This table links your app's users with their Polar payments
CREATE TABLE IF NOT EXISTS user_subscriptions (
  -- Primary key for this record
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Links to your existing users table (from Supabase Auth)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Polar's customer ID for this user
  polar_customer_id TEXT NOT NULL,

  -- Polar's subscription ID (if this is a recurring subscription)
  polar_subscription_id TEXT,

  -- What type of product they purchased ("premium", "basic", etc.)
  product_type TEXT NOT NULL,

  -- Current status of their subscription
  status TEXT NOT NULL DEFAULT 'active',

  -- When their subscription expires (for one-time purchases or subscription end)
  expires_at TIMESTAMPTZ,

  -- Automatic timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups by user_id
-- This makes queries like "what subscriptions does this user have?" faster
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id
ON user_subscriptions(user_id);

-- Create index for faster lookups by polar_customer_id
-- This helps when processing webhooks from Polar
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_polar_customer_id
ON user_subscriptions(polar_customer_id);

-- Create function to automatically update updated_at timestamp
-- This ensures updated_at is always current when records change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create payment_logs table for debugging and audit trail
-- This helps track all payment-related events
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Type of event (webhook, api_call, error, etc.)
  event_type TEXT NOT NULL,

  -- Polar's event ID (for webhooks)
  polar_event_id TEXT,

  -- Associated user (if applicable)
  user_id UUID REFERENCES auth.users(id),

  -- Full event data as JSON for debugging
  event_data JSONB,

  -- Any error messages
  error_message TEXT,

  -- Processing status
  status TEXT DEFAULT 'pending',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster log queries
CREATE INDEX IF NOT EXISTS idx_payment_logs_event_type
ON payment_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at
ON payment_logs(created_at);
```

### 5. Webhook Handler Implementation

Create `app/api/webhooks/polar/route.ts` to handle payment notifications:

```typescript
// app/api/webhooks/polar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { verifyWebhookSignature } from "@/lib/polar-client";

// Initialize Supabase client for database operations
// This uses service role key to bypass RLS for webhook processing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Note: You'll need to add this to .env.local
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Main webhook handler function
// This processes all events sent by Polar when payments happen
export async function POST(request: NextRequest) {
  try {
    // Get the raw request body for signature verification
    // We need the exact raw bytes to verify the webhook signature
    const body = await request.text();

    // Get the signature from request headers
    // Polar sends this to prove the webhook is authentic
    const signature = request.headers.get("polar-signature");
    if (!signature) {
      console.error("No signature found in webhook headers");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // Verify the webhook actually came from Polar
    // This prevents malicious actors from sending fake payment notifications
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("POLAR_WEBHOOK_SECRET environment variable not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const isValid = verifyWebhookSignature(body, signature, webhookSecret);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse the webhook payload
    // Now we know it's safe to process the data
    const event = JSON.parse(body);

    // Log the webhook for debugging and audit trail
    // This helps track all payment events in your database
    await supabase.from("payment_logs").insert({
      event_type: "webhook",
      polar_event_id: event.id,
      event_data: event,
      status: "received",
    });

    console.log("Processing Polar webhook:", event.type);

    // Handle different types of events from Polar
    // Each event type requires different processing logic
    switch (event.type) {
      case "order.created":
        // When a one-time payment is completed
        await handleOrderCreated(event.data);
        break;

      case "subscription.created":
        // When a new subscription starts
        await handleSubscriptionCreated(event.data);
        break;

      case "subscription.updated":
        // When subscription status changes (renewal, cancellation, etc.)
        await handleSubscriptionUpdated(event.data);
        break;

      case "subscription.canceled":
        // When a subscription is canceled
        await handleSubscriptionCanceled(event.data);
        break;

      default:
        // Log unknown event types for debugging
        console.log("Unhandled webhook event type:", event.type);
    }

    // Update log status to show successful processing
    await supabase
      .from("payment_logs")
      .update({ status: "processed" })
      .eq("polar_event_id", event.id);

    // Return success response to Polar
    // This tells Polar the webhook was processed successfully
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);

    // Log the error for debugging
    await supabase.from("payment_logs").insert({
      event_type: "webhook_error",
      error_message: error instanceof Error ? error.message : "Unknown error",
      status: "error",
    });

    // Return error response
    // Polar will retry the webhook if we return an error
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

// Handle completed one-time payments
// This runs when someone buys a single session or one-time feature
async function handleOrderCreated(order: any) {
  try {
    console.log("Processing order created:", order.id);

    // Find the user associated with this Polar customer
    // We need to link the payment to a user in our system
    const { data: subscription, error } = await supabase
      .from("user_subscriptions")
      .select("user_id")
      .eq("polar_customer_id", order.customer_id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    // If we don't have a subscription record, this might be a new customer
    // You might want to handle this case differently based on your app logic
    if (!subscription) {
      console.warn("No user found for customer:", order.customer_id);
      return;
    }

    // Determine what was purchased and set appropriate access
    // This logic depends on how you structure your products
    let productType = "unknown";
    let expiresAt = null;

    // Example: Map Polar product IDs to your app's features
    // You'll need to replace these with your actual product IDs
    switch (order.product_id) {
      case "your_single_session_product_id":
        productType = "single_session";
        // Single sessions might not expire, or expire after use
        break;

      case "your_premium_access_product_id":
        productType = "premium_access";
        // Premium access for 30 days from purchase
        expiresAt = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString();
        break;
    }

    // Create or update subscription record
    // This gives the user access to the purchased features
    const { error: upsertError } = await supabase
      .from("user_subscriptions")
      .upsert(
        {
          user_id: subscription.user_id,
          polar_customer_id: order.customer_id,
          product_type: productType,
          status: "active",
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,polar_customer_id,product_type",
        }
      );

    if (upsertError) {
      throw upsertError;
    }

    console.log("Successfully processed order:", order.id);
  } catch (error) {
    console.error("Error handling order created:", error);
    throw error;
  }
}

// Handle new subscription creation
// This runs when someone starts a recurring subscription
async function handleSubscriptionCreated(subscription: any) {
  try {
    console.log("Processing subscription created:", subscription.id);

    // Find the user associated with this customer
    const { data: existingUser, error } = await supabase
      .from("user_subscriptions")
      .select("user_id")
      .eq("polar_customer_id", subscription.customer_id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!existingUser) {
      console.warn("No user found for customer:", subscription.customer_id);
      return;
    }

    // Determine subscription type based on product
    let productType = "premium";
    switch (subscription.product_id) {
      case "your_monthly_premium_product_id":
        productType = "monthly_premium";
        break;
      case "your_yearly_premium_product_id":
        productType = "yearly_premium";
        break;
    }

    // Create subscription record
    // This gives ongoing access until subscription ends
    const { error: insertError } = await supabase
      .from("user_subscriptions")
      .insert({
        user_id: existingUser.user_id,
        polar_customer_id: subscription.customer_id,
        polar_subscription_id: subscription.id,
        product_type: productType,
        status: "active",
        expires_at: subscription.current_period_end,
      });

    if (insertError) {
      throw insertError;
    }

    console.log(
      "Successfully processed subscription creation:",
      subscription.id
    );
  } catch (error) {
    console.error("Error handling subscription created:", error);
    throw error;
  }
}

// Handle subscription updates (renewals, status changes)
// This runs when a subscription renews or changes status
async function handleSubscriptionUpdated(subscription: any) {
  try {
    console.log("Processing subscription updated:", subscription.id);

    // Update the subscription record with new information
    // This keeps your database in sync with Polar's subscription status
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: subscription.status,
        expires_at: subscription.current_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq("polar_subscription_id", subscription.id);

    if (error) {
      throw error;
    }

    console.log("Successfully updated subscription:", subscription.id);
  } catch (error) {
    console.error("Error handling subscription updated:", error);
    throw error;
  }
}

// Handle subscription cancellation
// This runs when a user cancels their subscription
async function handleSubscriptionCanceled(subscription: any) {
  try {
    console.log("Processing subscription canceled:", subscription.id);

    // Mark subscription as canceled
    // Note: Usually you'd let them keep access until the end of their billing period
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
        // Don't update expires_at - let them keep access until it naturally expires
      })
      .eq("polar_subscription_id", subscription.id);

    if (error) {
      throw error;
    }

    console.log(
      "Successfully processed subscription cancellation:",
      subscription.id
    );
  } catch (error) {
    console.error("Error handling subscription canceled:", error);
    throw error;
  }
}
```

## Security Best Practices

### 1. Never Store Sensitive Data

- Never store credit card information
- Let Polar handle all payment data
- Only store payment references and statuses

### 2. Webhook Verification

Always verify webhooks come from Polar using the webhook secret.

### 3. Environment Variables

Store all secrets in environment variables, never in code.

### 4. HTTPS Only

Always use HTTPS in production for payment pages.

### 5. Validate Everything

Validate all payment data before processing.

## Testing & Debugging

### 1. Local Development Setup

First, set up ngrok for webhook testing:

```bash
# Install ngrok globally
npm install -g ngrok

# Start your Next.js development server
npm run dev

# In another terminal, expose your local server
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Use this as your webhook endpoint in Polar dashboard
```

### 2. Environment Setup for Testing

Create `.env.local` with test credentials:

```bash
# Use Polar's sandbox/test environment
POLAR_ACCESS_TOKEN=polar_pat_test_your_test_token
POLAR_WEBHOOK_SECRET=polar_wh_test_your_test_secret
POLAR_ORGANIZATION_ID=your_test_org_id

# Add Supabase service role key for webhooks
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Test Payment Flow

Create a test utility `lib/test-utils.ts`:

```typescript
// lib/test-utils.ts
// Utility functions for testing payment integration

// Test credit card numbers for Polar/Stripe testing
export const TEST_CARDS = {
  success: {
    visa: "4242424242424242",
    mastercard: "5555555555554444",
    amex: "378282246310005",
  },
  declined: {
    generic: "4000000000000002",
    insufficient_funds: "4000000000009995",
    expired: "4000000000000069",
  },
};

// Helper to create test customers programmatically
export async function createTestCustomer(email: string) {
  const response = await fetch("/api/payments/create-customer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include cookies for auth
  });

  if (!response.ok) {
    throw new Error("Failed to create test customer");
  }

  return response.json();
}

// Helper to simulate webhook events locally
export async function simulateWebhook(eventType: string, eventData: any) {
  const webhook = {
    id: `evt_test_${Date.now()}`,
    type: eventType,
    data: eventData,
    created_at: new Date().toISOString(),
  };

  // Sign the webhook with your test secret
  const crypto = require("crypto");
  const signature = crypto
    .createHmac("sha256", process.env.POLAR_WEBHOOK_SECRET!)
    .update(JSON.stringify(webhook))
    .digest("hex");

  const response = await fetch("/api/webhooks/polar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "polar-signature": signature,
    },
    body: JSON.stringify(webhook),
  });

  return response;
}

// Test subscription access functions
export async function testSubscriptionAccess(userId: string) {
  const tests = [
    "unlimited_sessions",
    "detailed_feedback",
    "analytics",
    "premium_tips",
  ];

  const results = {};

  for (const feature of tests) {
    try {
      const response = await fetch(
        `/api/test/feature-access?userId=${userId}&feature=${feature}`
      );
      const data = await response.json();
      results[feature] = data.hasAccess;
    } catch (error) {
      results[feature] = false;
    }
  }

  return results;
}
```

### 4. Debugging Webhook Issues

Create a webhook debugger `app/api/debug/webhook-logs/route.ts`:

```typescript
// app/api/debug/webhook-logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Debug endpoint to view webhook logs
// This helps troubleshoot webhook processing issues
export async function GET(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Not available in production" },
        { status: 403 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get recent webhook logs
    const { data: logs, error } = await supabase
      .from("payment_logs")
      .select("*")
      .eq("event_type", "webhook")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching webhook logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
```

### 5. Error Handling Best Practices

Create centralized error handling `lib/payment-errors.ts`:

```typescript
// lib/payment-errors.ts
// Centralized error handling for payment operations

export class PaymentError extends Error {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.name = "PaymentError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Common payment error types
export const PAYMENT_ERRORS = {
  CUSTOMER_NOT_FOUND: new PaymentError(
    "Customer not found",
    "CUSTOMER_NOT_FOUND",
    404
  ),
  INVALID_PRODUCT: new PaymentError(
    "Invalid product specified",
    "INVALID_PRODUCT",
    400
  ),
  CHECKOUT_FAILED: new PaymentError(
    "Failed to create checkout session",
    "CHECKOUT_FAILED",
    500
  ),
  WEBHOOK_VERIFICATION_FAILED: new PaymentError(
    "Webhook signature verification failed",
    "WEBHOOK_VERIFICATION_FAILED",
    401
  ),
  SUBSCRIPTION_NOT_FOUND: new PaymentError(
    "Subscription not found",
    "SUBSCRIPTION_NOT_FOUND",
    404
  ),
  ACCESS_DENIED: new PaymentError(
    "Premium subscription required",
    "ACCESS_DENIED",
    403
  ),
};

// Error handler middleware for API routes
export function handlePaymentError(error: any) {
  console.error("Payment operation error:", error);

  if (error instanceof PaymentError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  // Handle Polar SDK errors
  if (error.response?.data) {
    return {
      error: error.response.data.message || "Payment service error",
      code: "POLAR_API_ERROR",
      statusCode: error.response.status || 500,
    };
  }

  // Generic error
  return {
    error: "An unexpected error occurred",
    code: "INTERNAL_ERROR",
    statusCode: 500,
  };
}

// Retry logic for webhook processing
export async function retryWebhookProcessing(
  webhookData: any,
  maxRetries: number = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Process webhook
      await processWebhookWithRetry(webhookData);
      return true;
    } catch (error) {
      console.error(`Webhook processing attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        // Final attempt failed, log for manual review
        console.error(
          "Webhook processing failed after all retries:",
          webhookData
        );
        return false;
      }

      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return false;
}

async function processWebhookWithRetry(webhookData: any) {
  // Your webhook processing logic here
  // This should throw an error if processing fails
}
```

## Example Usage Patterns

### 1. Protecting Routes with Subscription Checks

Middleware for protecting premium routes `middleware.ts`:

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { hasActiveSubscription } from "@/lib/subscription-utils";

// Routes that require premium subscription
const PREMIUM_ROUTES = ["/levels/premium", "/analytics", "/detailed-feedback"];

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  // Check if this is a premium route
  const isPremiumRoute = PREMIUM_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isPremiumRoute) {
    // Get user from session
    const supabase = createMiddlewareClient({ req: request, res });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Redirect to login
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Check subscription status
    const hasSubscription = await hasActiveSubscription(user.id);

    if (!hasSubscription) {
      // Redirect to subscription page
      return NextResponse.redirect(new URL("/subscribe", request.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/levels/:path*", "/analytics/:path*", "/detailed-feedback/:path*"],
};
```

### 2. Feature Gates in Components

Create reusable access control component `components/FeatureGate.tsx`:

```tsx
// components/FeatureGate.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Crown } from "lucide-react";
import Link from "next/link";

interface FeatureGateProps {
  feature: string; // Feature name to check
  fallback?: React.ReactNode; // What to show if no access
  children: React.ReactNode; // Content to show if has access
  showUpgrade?: boolean; // Whether to show upgrade prompt
}

// Component that conditionally renders content based on subscription status
// Use this to wrap premium features throughout your app
export default function FeatureGate({
  feature,
  fallback,
  children,
  showUpgrade = true,
}: FeatureGateProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [feature]);

  const checkAccess = async () => {
    try {
      const response = await fetch(
        `/api/user/feature-access?feature=${feature}`
      );
      const data = await response.json();
      setHasAccess(data.hasAccess);
    } catch (error) {
      console.error("Error checking feature access:", error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded h-32 flex items-center justify-center">
        <div className="text-gray-500">Checking access...</div>
      </div>
    );
  }

  // Show content if user has access
  if (hasAccess) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  if (showUpgrade) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-8 text-center">
          <div className="text-yellow-500 mb-4">
            <Crown className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
          <p className="text-gray-600 mb-4">
            This feature requires a premium subscription to access.
          </p>
          <Link href="/subscribe">
            <Button>
              <Lock className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Don't render anything if no access and no upgrade prompt
  return null;
}
```

Create the API endpoint for feature access checks `app/api/user/feature-access/route.ts`:

```typescript
// app/api/user/feature-access/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hasFeatureAccess } from "@/lib/subscription-utils";

// API endpoint to check if current user has access to a specific feature
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const feature = searchParams.get("feature");

    if (!feature) {
      return NextResponse.json(
        { error: "Feature parameter is required" },
        { status: 400 }
      );
    }

    // Get current user
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ hasAccess: false });
    }

    // Check feature access
    const hasAccess = await hasFeatureAccess(user.id, feature as any);

    return NextResponse.json({ hasAccess });
  } catch (error) {
    console.error("Error checking feature access:", error);
    return NextResponse.json({ hasAccess: false });
  }
}
```

### 3. Usage in Practice Sessions

Example of integrating payment checks in your session component:

```tsx
// components/session/PremiumSessionComponent.tsx
"use client";

import { useState } from "react";
import FeatureGate from "@/components/FeatureGate";
import { Button } from "@/components/ui/button";
import { Mic, BarChart, Star } from "lucide-react";

interface SessionComponentProps {
  sessionId: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export default function PremiumSessionComponent({
  sessionId,
  difficulty,
}: SessionComponentProps) {
  const [sessionStarted, setSessionStarted] = useState(false);

  const startPremiumSession = async () => {
    try {
      // First check if user has access
      const response = await fetch(
        "/api/user/feature-access?feature=unlimited_sessions"
      );
      const data = await response.json();

      if (!data.hasAccess) {
        // Redirect to subscription page
        window.location.href = "/subscribe";
        return;
      }

      // Start the session
      setSessionStarted(true);

      // Your existing session logic here
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic session info - available to all users */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">
          TOEFL Speaking Practice - {difficulty}
        </h2>
        <p className="text-gray-600 mb-4">
          Practice your TOEFL speaking skills with AI-powered feedback and
          scoring.
        </p>
      </div>

      {/* Premium features wrapped in FeatureGate */}
      <FeatureGate feature="unlimited_sessions">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Star className="w-6 h-6 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold">Premium Session Features</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <Mic className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium">Advanced Recording</h4>
              <p className="text-sm text-gray-600">
                High-quality audio analysis
              </p>
            </div>
            <div className="text-center">
              <BarChart className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium">Detailed Analytics</h4>
              <p className="text-sm text-gray-600">
                Comprehensive performance metrics
              </p>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-medium">AI Feedback</h4>
              <p className="text-sm text-gray-600">
                Personalized improvement tips
              </p>
            </div>
          </div>

          <Button
            onClick={startPremiumSession}
            className="w-full"
            size="lg"
            disabled={sessionStarted}
          >
            {sessionStarted
              ? "Session in Progress..."
              : "Start Premium Session"}
          </Button>
        </div>
      </FeatureGate>

      {/* Detailed feedback section */}
      <FeatureGate feature="detailed_feedback">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">AI-Powered Feedback</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Pronunciation Analysis</span>
              <span className="text-green-600 font-medium">✓ Included</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Grammar Correction</span>
              <span className="text-green-600 font-medium">✓ Included</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Fluency Scoring</span>
              <span className="text-green-600 font-medium">✓ Included</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>Improvement Suggestions</span>
              <span className="text-green-600 font-medium">✓ Included</span>
            </div>
          </div>
        </div>
      </FeatureGate>

      {/* Analytics dashboard */}
      <FeatureGate feature="analytics">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Performance Analytics</h3>
          <p className="text-gray-600 mb-4">
            Track your progress over time with detailed analytics and insights.
          </p>
          <Button variant="outline">View Analytics Dashboard</Button>
        </div>
      </FeatureGate>
    </div>
  );
}
```

### 4. Integration with Your Dashboard

Update your dashboard to show subscription status:

```tsx
// Update your existing components/dashboard/DashboardHeader.tsx
import SubscriptionStatus from "@/components/payments/SubscriptionStatus";

// Add this to your dashboard layout
<div className="grid lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">{/* Your existing dashboard content */}</div>
  <div>
    <SubscriptionStatus />
  </div>
</div>;
```

## Environment Variables Summary

Here's a complete list of environment variables you'll need:

```bash
# .env.local

# Existing variables
GOOGLE_API_KEY=your_google_api_key
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# New Polar payment variables
POLAR_ACCESS_TOKEN=polar_pat_your_access_token
POLAR_WEBHOOK_SECRET=polar_wh_your_webhook_secret
POLAR_ORGANIZATION_ID=your_organization_id

# Required for webhook processing (server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: Environment flag
NODE_ENV=development
```

## Step-by-Step Implementation Checklist

1. **Setup Phase**

   - [ ] Create Polar account and organization
   - [ ] Get API credentials from Polar dashboard
   - [ ] Create products in Polar (single session, monthly, yearly)
   - [ ] Add environment variables to `.env.local`

2. **Database Setup**

   - [ ] Run SQL scripts to create database tables
   - [ ] Add Supabase service role key to environment
   - [ ] Test database connections

3. **Backend Implementation**

   - [ ] Create `lib/polar-client.ts`
   - [ ] Implement webhook handler in `app/api/webhooks/polar/route.ts`
   - [ ] Create payment API routes
   - [ ] Add subscription utility functions

4. **Frontend Implementation**

   - [ ] Create payment components
   - [ ] Build subscription status component
   - [ ] Implement success/cancel pages
   - [ ] Update subscribe page with payment buttons

5. **Access Control**

   - [ ] Implement feature gates
   - [ ] Add middleware for route protection
   - [ ] Update existing components with subscription checks

6. **Testing**

   - [ ] Set up ngrok for webhook testing
   - [ ] Test payment flows with test cards
   - [ ] Verify webhook processing
   - [ ] Test access control features

7. **Production Deployment**
   - [ ] Switch to production Polar credentials
   - [ ] Update webhook endpoints
   - [ ] Test with real credit cards (small amounts)
   - [ ] Monitor payment logs

This comprehensive guide covers everything you need to integrate Polar payments into your TOEFL practice app!
