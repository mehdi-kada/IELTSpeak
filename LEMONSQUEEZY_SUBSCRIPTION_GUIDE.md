# Complete LemonSqueezy Subscription Implementation Guide for Beginners

## Table of Contents

1. [Overview](#overview)
2. [What We Built](#what-we-built)
3. [Prerequisites](#prerequisites)
4. [File Structure](#file-structure)
5. [Step 1: Install Dependencies](#step-1-install-dependencies)
6. [Step 2: Environment Setup](#step-2-environment-setup)
7. [Step 3: Database Setup](#step-3-database-setup)
8. [Step 4: Middleware Configuration](#step-4-middleware-configuration)
9. [Step 5: LemonSqueezy Configuration](#step-5-lemonsqueezy-configuration)
10. [Step 6: Subscription Helper Functions](#step-6-subscription-helper-functions)
11. [Step 7: API Routes](#step-7-api-routes)
12. [Step 8: Webhook Handler](#step-8-webhook-handler)
13. [Step 9: Frontend Components](#step-9-frontend-components)
14. [Step 10: Testing with ngrok](#step-10-testing-with-ngrok)
15. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
16. [Deployment Checklist](#deployment-checklist)

## Overview

This guide shows you how to implement a complete monthly subscription system using:

- **LemonSqueezy** for secure payment processing
- **Supabase** for user authentication and database storage
- **Next.js** with App Router for the web application

This is a beginner-friendly guide with detailed explanations and working code examples that have been tested and debugged.

## What We Built

Our subscription system includes:

- ✅ **Monthly subscription checkout** - Users can purchase subscriptions
- ✅ **Real-time subscription status tracking** - Know who is premium instantly
- ✅ **Automatic database updates via webhooks** - No manual work needed
- ✅ **Subscription cancellation** - Users can cancel anytime
- ✅ **Premium content protection** - Only paying users see premium features
- ✅ **User-friendly subscription management** - Easy-to-use interface

## Prerequisites

Before starting, make sure you have:

- ✅ **Next.js app** with App Router (not Pages Router)
- ✅ **Supabase project** with authentication set up
- ✅ **LemonSqueezy account** with a store and product created
- ✅ **Basic understanding** of Next.js, React, and TypeScript
- ✅ **Node.js** and **npm** installed

## File Structure

Here's exactly what we'll create:

```
lib/
├── lemonsqueezy.ts          # LemonSqueezy API functions
├── subscription-helpers.ts  # Database operations
├── client.ts               # Supabase client (browser)
├── server.ts              # Supabase client (server)
└── middleware.ts          # Auth middleware helper

app/api/subscriptions/
├── create-checkout/route.ts # Creates payment checkout
├── status/route.ts          # Gets user's subscription status
└── cancel/route.ts          # Cancels subscription

app/api/webhooks/
└── lemonsqueezy/route.ts    # Handles LemonSqueezy events

components/subscription/
├── SubscriptionCard.tsx     # Displays subscription plans
└── SubscriptionStatus.tsx   # Shows current subscription

app/(main-app)/subscribe/
└── page.tsx                 # Subscription page

middleware.ts               # Main middleware file (IMPORTANT!)
next.config.ts             # Next.js configuration
```

## Step 1: Install Dependencies

First, install the LemonSqueezy SDK:

```bash
npm install @lemonsqueezy/lemonsqueezy.js
```

## Step 2: Environment Setup

Add these variables to your `.env.local` file:

```env
# LemonSqueezy Configuration
LEMONSQUEEZY_API_KEY=your_api_key_here
LEMONSQUEEZY_STORE_ID=your_store_id_here
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here

# Your existing Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL (IMPORTANT: update this when using ngrok for testing)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### How to get these values:

**LemonSqueezy:**

1. Go to [LemonSqueezy Dashboard](https://app.lemonsqueezy.com)
2. **API Key:** Settings → API → Create new token
3. **Store ID:** Settings → Stores → Your store → Copy the ID from URL
4. **Webhook Secret:** We'll set this up later in the testing section

**Supabase:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. **URL & Anon Key:** Settings → API → Project URL & anon public key
3. **Service Role Key:** Settings → API → service_role key (keep this secret!)

**What these do:**

- `LEMONSQUEEZY_API_KEY`: Allows your app to communicate with LemonSqueezy
- `LEMONSQUEEZY_STORE_ID`: Identifies your store in LemonSqueezy
- `LEMONSQUEEZY_WEBHOOK_SECRET`: Verifies webhook authenticity (security)
- `SUPABASE_SERVICE_ROLE_KEY`: Allows backend operations on your database
- `NEXT_PUBLIC_APP_URL`: Your app's URL (important for redirects and webhooks)

## Step 3: Database Setup

Create the subscriptions table in your Supabase database. Go to your Supabase dashboard and run this SQL:

```sql
-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lemonsqueezy_subscription_id VARCHAR NOT NULL UNIQUE,
  lemonsqueezy_customer_id VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  plan_name VARCHAR NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Add is_premium column to profiles table (if it doesn't exist)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Create index on is_premium for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);
```

**What each column does:**

- `user_id`: Links subscription to your user (foreign key)
- `lemonsqueezy_subscription_id`: LemonSqueezy's unique ID for the subscription
- `lemonsqueezy_customer_id`: LemonSqueezy's customer ID
- `status`: Current status (active, cancelled, expired, etc.)
- `plan_name`: Name of the subscription plan
- `current_period_start/end`: Billing period dates
- `cancel_at_period_end`: Whether to cancel when period ends

## Step 4: Middleware Configuration

**CRITICAL:** This step prevents webhook errors that cause subscription failures.

### File: `middleware.ts` (in your project root)

```typescript
import { updateSession } from "@/lib/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### File: `lib/middleware.ts`

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  // CRITICAL: Skip authentication for webhook routes
  // This prevents 307 redirects that break webhooks
  const isWebhookRoute = request.nextUrl.pathname.startsWith("/api/webhooks");
  if (isWebhookRoute) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    request.nextUrl.pathname !== "/"
  ) {
    // Redirect to login if user not authenticated
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

**Why this is important:** Without excluding webhook routes, Next.js will try to authenticate webhooks from LemonSqueezy and redirect them, causing the webhook to fail and subscriptions won't update in your database.

## Step 5: LemonSqueezy Configuration

### File: `lib/lemonsqueezy.ts`

This file handles all communication with LemonSqueezy's API:

```typescript
"use server"; // This makes all functions run on the server (secure)
import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
  cancelSubscription,
  type Subscription,
} from "@lemonsqueezy/lemonsqueezy.js";

// Initialize LemonSqueezy with your API key
// This must be called before using any LemonSqueezy functions
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!, // Your secret API key
});

/**
 * Checks if all required environment variables are set
 * This prevents errors when something is missing
 */
export async function configureLemonSqueezy() {
  // List of required environment variables
  const requiredVars = [
    "LEMONSQUEEZY_API_KEY",
    "LEMONSQUEEZY_STORE_ID",
    "LEMONSQUEEZY_WEBHOOK_SECRET",
  ];

  // Check which variables are missing
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  // If any are missing, return an error
  if (missingVars.length > 0) {
    return {
      error: `Missing required LEMONSQUEEZY env variables: ${missingVars.join(
        ", "
      )}. Please, set them in your .env file.`,
    };
  }

  return { error: null }; // All good!
}

/**
 * Creates a checkout session for monthly subscription
 * This is what happens when a user clicks "Subscribe Now"
 *
 * @param variantId - The ID of the subscription plan from LemonSqueezy
 * @param userId - The user's ID from Supabase (so we know who subscribed)
 * @param userEmail - The user's email (pre-fills checkout form)
 * @returns The checkout URL to redirect the user to, or null if failed
 */
export async function createSubscriptionCheckout(
  variantId: string,
  userId: string,
  userEmail: string
): Promise<string | null> {
  console.log(
    "🛒 Creating checkout for user:",
    userId,
    "email:",
    userEmail,
    "variant:",
    variantId
  );

  try {
    // First, check if our configuration is correct
    const { error } = await configureLemonSqueezy();
    if (error) {
      console.error("❌ LemonSqueezy configuration error:", error);
      return null;
    }

    console.log("✅ LemonSqueezy configured successfully");

    // Create a checkout session with LemonSqueezy
    const checkoutOptions = {
      checkoutData: {
        email: userEmail, // Pre-fill the user's email in checkout
        custom: {
          user_id: userId, // IMPORTANT: This links the payment to your user
        },
      },
      productOptions: {
        // Where to send the user after successful payment
        redirectUrl: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:8000"
        }/dashboard?success=true`,
        receiptButtonText: "Go to Dashboard", // Button text on receipt
        receiptThankYouNote: "Thank you for subscribing to ToEILET Premium!",
      },
    };

    console.log(
      "📦 Checkout options:",
      JSON.stringify(checkoutOptions, null, 2)
    );

    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID!, // Your store ID
      variantId, // The specific subscription plan
      checkoutOptions
    );

    // Check if checkout creation failed
    if (checkout.error) {
      console.error("❌ Checkout error:", checkout.error);
      return null;
    }

    console.log("✅ Checkout created successfully");
    const checkoutUrl = checkout.data?.data?.attributes?.url;
    console.log("🔗 Checkout URL:", checkoutUrl);

    // Return the checkout URL (where user goes to pay)
    return checkoutUrl || null;
  } catch (error) {
    console.error("Error creating checkout:", error);
    return null;
  }
}

/**
 * Gets subscription details from LemonSqueezy
 * Use this to check the current status of a subscription
 *
 * @param subscriptionId - The LemonSqueezy subscription ID
 * @returns The subscription object or null if not found
 */
export async function getLemonSqueezySubscription(
  subscriptionId: string
): Promise<Subscription | null> {
  try {
    // Fetch subscription data from LemonSqueezy
    const subscription = await getSubscription(subscriptionId);

    // Check for errors
    if (subscription.error) {
      console.error("Error fetching subscription:", subscription.error);
      return null;
    }

    return subscription.data; // Return the subscription data
  } catch (error) {
    console.error("Error getting subscription:", error);
    return null;
  }
}

/**
 * Cancels a subscription in LemonSqueezy
 * This stops future billing but may allow access until period end
 *
 * @param subscriptionId - The LemonSqueezy subscription ID
 * @returns true if cancellation was successful, false otherwise
 */
export async function cancelLemonSqueezySubscription(
  subscriptionId: string
): Promise<boolean> {
  try {
    // Tell LemonSqueezy to cancel the subscription
    const result = await cancelSubscription(subscriptionId);

    // Check if cancellation failed
    if (result.error) {
      console.error("Error cancelling subscription:", result.error);
      return false;
    }

    return true; // Success!
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return false;
  }
}
```

**Key points:**

- `user_id` is passed in `custom` data - this is how we link payments to users
- Extensive logging helps with debugging
- All functions include proper error handling
- The checkout redirects users to `/dashboard?success=true` after payment

## Step 6: Subscription Helper Functions

### File: `lib/subscription-helpers.ts`

This file handles all database operations related to subscriptions:

```typescript
import { createClient } from "@supabase/supabase-js";

// Create Supabase client with service role key
// Service role key has full database access (needed for webhooks)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // More powerful than anon key
);

// TypeScript interface to define what subscription data looks like
export interface SubscriptionData {
  user_id: string;
  lemonsqueezy_subscription_id: string;
  lemonsqueezy_customer_id: string;
  status: "active" | "cancelled" | "expired" | "on_trial" | "paused" | "unpaid";
  plan_name: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

/**
 * Creates or updates a subscription in the database
 * "Upsert" means: if it exists, update it; if not, create it
 *
 * @param subscriptionData - The subscription information to save
 * @returns true if successful, false if failed
 */
export async function upsertSubscription(
  subscriptionData: SubscriptionData
): Promise<boolean> {
  console.log(
    "💾 Starting subscription upsert for user:",
    subscriptionData.user_id
  );
  console.log("📊 Subscription data:", subscriptionData);

  try {
    // Check if Supabase admin client is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ SUPABASE_SERVICE_ROLE_KEY not configured");
      return false;
    }

    console.log("🔧 Attempting database upsert...");

    // Insert or update the subscription in the database
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .upsert(subscriptionData, {
        onConflict: "lemonsqueezy_subscription_id", // Update if this ID already exists
      });

    if (error) {
      console.error("❌ Error upserting subscription:", error);
      return false;
    }

    console.log("✅ Subscription upserted successfully");

    // Also update the user's premium status in their profile
    console.log("🏆 Updating user premium status...");
    const premiumStatus = subscriptionData.status === "active"; // Premium if status is active
    console.log("🎯 Setting premium status to:", premiumStatus);

    const premiumUpdateSuccess = await updateUserPremiumStatus(
      subscriptionData.user_id,
      premiumStatus
    );

    if (!premiumUpdateSuccess) {
      console.error("❌ Failed to update premium status");
      return false;
    }

    console.log("✅ Premium status updated successfully");
    return true; // Success!
  } catch (error) {
    console.error("💥 Error in upsertSubscription:", error);
    return false;
  }
}

/**
 * Gets a user's active subscription from the database
 *
 * @param userId - The user's ID from Supabase auth
 * @returns The subscription data or null if none found
 */
export async function getUserSubscription(userId: string) {
  try {
    // Query the database for this user's active subscription
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("*") // Get all columns
      .eq("user_id", userId) // Where user_id matches
      .eq("status", "active") // And status is active
      .single(); // We expect only one result

    // PGRST116 means "no rows returned" - that's OK, just means no subscription
    if (error && error.code !== "PGRST116") {
      console.error("Error getting user subscription:", error);
      return null;
    }

    return data; // Return the subscription or null
  } catch (error) {
    console.error("Error in getUserSubscription:", error);
    return null;
  }
}

/**
 * Updates user's premium status in the profiles table
 * This is what determines if a user has access to premium features
 *
 * @param userId - The user's ID
 * @param isPremium - Whether the user should have premium status
 * @returns true if successful, false if failed
 */
export async function updateUserPremiumStatus(
  userId: string,
  isPremium: boolean
): Promise<boolean> {
  console.log("👤 Updating premium status for user:", userId, "to:", isPremium);

  try {
    // First, let's check if the user exists in profiles
    console.log("🔍 Checking if user profile exists...");
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, is_premium")
      .eq("id", userId)
      .single();

    console.log("📋 Existing profile:", existingProfile);

    // Update or create the user's profile with premium status
    console.log("💾 Upserting profile...");
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userId,
          is_premium: isPremium, // This is the important field!
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id", // Update if user already has a profile
        }
      )
      .select();

    if (error) {
      console.error("❌ Error updating user premium status:", error);
      console.error("Error details:", error.message, error.code, error.details);
      return false;
    }

    console.log("✅ Profile upsert successful:", data);

    // Verify the update worked
    const { data: updatedProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, is_premium")
      .eq("id", userId)
      .single();

    console.log("🔍 Updated profile verification:", updatedProfile);

    return true;
  } catch (error) {
    console.error("💥 Error in updateUserPremiumStatus:", error);
    return false;
  }
}

/**
 * Cancels a subscription in the database
 * This updates our local record when a subscription is cancelled
 *
 * @param subscriptionId - The LemonSqueezy subscription ID
 * @returns true if successful, false if failed
 */
export async function cancelSubscriptionInDB(
  subscriptionId: string
): Promise<boolean> {
  try {
    // Update the subscription status to cancelled
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("lemonsqueezy_subscription_id", subscriptionId)
      .select("user_id") // We need the user_id to update their profile
      .single();

    if (error) {
      console.error("Error cancelling subscription in DB:", error);
      return false;
    }

    // Remove premium status from the user
    if (data?.user_id) {
      await updateUserPremiumStatus(data.user_id, false);
    }

    return true;
  } catch (error) {
    console.error("Error in cancelSubscriptionInDB:", error);
    return false;
  }
}

/**
 * Checks if a user has an active subscription
 * Simple function to check premium status
 *
 * @param userId - The user's ID
 * @returns true if user is premium, false otherwise
 */
export async function checkUserPremiumStatus(userId: string): Promise<boolean> {
  try {
    // Check the user's profile for premium status
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("is_premium")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking premium status:", error);
      return false;
    }

    return data?.is_premium || false; // Return premium status or false
  } catch (error) {
    console.error("Error in checkUserPremiumStatus:", error);
    return false;
  }
}
```

    if (error) {
      console.error("❌ Error updating user premium status:", error);
      console.error("Error details:", error.message, error.code, error.details);
      return false;
    }

    console.log("✅ Profile upsert successful:", data);

    // Verify the update worked
    const { data: updatedProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, is_premium")
      .eq("id", userId)
      .single();

    console.log("🔍 Updated profile verification:", updatedProfile);

    return true;

} catch (error) {
console.error("💥 Error in updateUserPremiumStatus:", error);
return false;
}
}

/\*\*

- Cancels a subscription in the database
  \*/
  export async function cancelSubscriptionInDB(
  subscriptionId: string
  ): Promise<boolean> {
  try {
  const { data, error } = await supabaseAdmin
  .from("subscriptions")
  .update({
  status: "cancelled",
  cancel_at_period_end: true,
  updated_at: new Date().toISOString(),
  })
  .eq("lemonsqueezy_subscription_id", subscriptionId)
  .select("user_id")
  .single();

      if (error) {
        console.error("Error cancelling subscription in DB:", error);
        return false;
      }

      // Update user's premium status
      if (data?.user_id) {
        await updateUserPremiumStatus(data.user_id, false);
      }

      return true;

  } catch (error) {
  console.error("Error in cancelSubscriptionInDB:", error);
  return false;
  }
  }

/\*\*

- Checks if a user has an active subscription
  \*/
  export async function checkUserPremiumStatus(userId: string): Promise<boolean> {
  try {
  const { data, error } = await supabaseAdmin
  .from("profiles")
  .select("is_premium")
  .eq("id", userId)
  .single();

      if (error) {
        console.error("Error checking premium status:", error);
        return false;
      }

      return data?.is_premium || false;

  } catch (error) {
  console.error("Error in checkUserPremiumStatus:", error);
  return false;
  }
  }

````

**Key points:**

- Uses `SUPABASE_SERVICE_ROLE_KEY` for full database access
- Extensive logging for debugging
- Automatically updates user's `is_premium` status when subscription changes
- Handles all possible subscription statuses

## Step 7: API Routes

These are the endpoints that your frontend calls to manage subscriptions.

### File: `app/api/subscriptions/create-checkout/route.ts`

This creates a checkout session when user clicks "Subscribe Now":

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { createSubscriptionCheckout } from "@/lib/lemonsqueezy";

/**
 * POST /api/subscriptions/create-checkout
 * Creates a LemonSqueezy checkout session for subscription
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current logged-in user from Supabase
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Check if user is authenticated
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the variant ID from the request body
    const { variantId } = await request.json();

    // Validate that variantId was provided
    if (!variantId) {
      return NextResponse.json(
        { error: "Product variant ID is required" },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription
    // We don't want users to have multiple subscriptions
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (existingSubscription) {
      return NextResponse.json(
        { error: "User already has an active subscription" },
        { status: 400 }
      );
    }

    // Create checkout session with LemonSqueezy
    const checkoutUrl = await createSubscriptionCheckout(
      variantId,
      user.id,
      user.email! // We know email exists because user is authenticated
    );

    // Check if checkout creation failed
    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    // Return the checkout URL to the frontend
    return NextResponse.json({
      checkoutUrl,
      message: "Checkout session created successfully",
    });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
````

### File: `app/api/subscriptions/status/route.ts`

This returns the user's current subscription status:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { getUserSubscription } from "@/lib/subscription-helpers";

/**
 * GET /api/subscriptions/status
 * Returns the current user's subscription status
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current logged-in user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Check authentication
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's subscription from our helper function
    const subscription = await getUserSubscription(user.id);

    // Return subscription info
    return NextResponse.json({
      subscription, // The subscription data (or null)
      hasActiveSubscription: !!subscription, // Convert to boolean
      isPremium: subscription?.status === "active", // True if active
    });
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### File: `app/api/subscriptions/cancel/route.ts`

This handles subscription cancellation:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { cancelLemonSqueezySubscription } from "@/lib/lemonsqueezy";
import { cancelSubscriptionInDB } from "@/lib/subscription-helpers";

/**
 * POST /api/subscriptions/cancel
 * Cancels the user's active subscription
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user's active subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (subscriptionError || !subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Cancel the subscription with LemonSqueezy
    const cancelSuccess = await cancelLemonSqueezySubscription(
      subscription.lemonsqueezy_subscription_id
    );

    if (!cancelSuccess) {
      return NextResponse.json(
        { error: "Failed to cancel subscription with payment provider" },
        { status: 500 }
      );
    }

    // Update our database to reflect the cancellation
    const dbUpdateSuccess = await cancelSubscriptionInDB(
      subscription.lemonsqueezy_subscription_id
    );

    if (!dbUpdateSuccess) {
      return NextResponse.json(
        { error: "Failed to update subscription status in database" },
        { status: 500 }
      );
    }

    // Success!
    return NextResponse.json({
      message: "Subscription cancelled successfully",
      cancelled: true,
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

    // Create checkout session with LemonSqueezy
    const checkoutUrl = await createSubscriptionCheckout(
      variantId,
      user.id,
      user.email!
    );

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkoutUrl,
      message: "Checkout session created successfully",
    });

} catch (error) {
console.error("Error creating checkout:", error);
return NextResponse.json(
{ error: "Internal server error" },
{ status: 500 }
);
}
}

````

### File: `app/api/subscriptions/status/route.ts`

This returns the user's current subscription status:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { getUserSubscription } from "@/lib/subscription-helpers";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's subscription
    const subscription = await getUserSubscription(user.id);

    return NextResponse.json({
      subscription,
      hasActiveSubscription: !!subscription,
    });
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
````

### File: `app/api/subscriptions/cancel/route.ts`

This cancels a user's subscription:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { getUserSubscription } from "@/lib/subscription-helpers";
import { cancelLemonSqueezySubscription } from "@/lib/lemonsqueezy";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's current subscription
    const subscription = await getUserSubscription(user.id);

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Cancel subscription in LemonSqueezy
    const cancelled = await cancelLemonSqueezySubscription(
      subscription.lemonsqueezy_subscription_id
    );

    if (!cancelled) {
      return NextResponse.json(
        { error: "Failed to cancel subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Step 8: Webhook Handler

**This is the most critical part** - it handles automatic subscription updates when payments occur.

### File: `app/api/webhooks/lemonsqueezy/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  upsertSubscription,
  cancelSubscriptionInDB,
} from "@/lib/subscription-helpers";

/**
 * Verifies that the webhook is actually from LemonSqueezy
 * This prevents malicious requests from fake webhooks
 *
 * @param body - The raw request body
 * @param signature - The signature from LemonSqueezy
 * @returns true if webhook is legitimate, false otherwise
 */
function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

  // Create a hash using your webhook secret
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const expectedSignature = hmac.digest("hex");

  // Compare signatures securely (prevents timing attacks)
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
}

/**
 * POST /api/webhooks/lemonsqueezy
 * Handles webhook events from LemonSqueezy
 * This keeps your database in sync with payment events
 */
export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`🔔 [${timestamp}] Webhook received`);

  try {
    // Get the raw body and signature from the request
    const body = await request.text();
    const signature = request.headers.get("X-Signature");

    console.log(`📝 [${timestamp}] Webhook body length: ${body.length}`);
    console.log(`🔐 [${timestamp}] Signature present: ${!!signature}`);

    // Check if signature is present
    if (!signature) {
      console.error(`❌ [${timestamp}] No signature provided`);
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Log webhook secret status (don't log the actual secret)
    const hasWebhookSecret = !!process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    console.log(
      `🔑 [${timestamp}] Webhook secret configured: ${hasWebhookSecret}`
    );

    if (!hasWebhookSecret) {
      console.error(
        `❌ [${timestamp}] LEMONSQUEEZY_WEBHOOK_SECRET not configured`
      );
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify the webhook is from LemonSqueezy
    console.log(`🔐 [${timestamp}] Verifying signature...`);
    if (!verifyWebhookSignature(body, signature)) {
      console.error(`❌ [${timestamp}] Invalid webhook signature`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`✅ [${timestamp}] Webhook signature verified`);

    // Parse the webhook payload
    let event;
    try {
      event = JSON.parse(body);
      console.log(`📦 [${timestamp}] Payload parsed successfully`);
    } catch (parseError) {
      console.error(
        `❌ [${timestamp}] Failed to parse webhook payload:`,
        parseError
      );
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const eventType = event.meta?.event_name;
    const subscriptionData = event.data;
    const metaCustomData = event.meta?.custom_data || {};

    console.log(`🎯 [${timestamp}] Event type: ${eventType}`);
    console.log(`📊 [${timestamp}] Subscription ID: ${subscriptionData?.id}`);
    console.log(
      `👤 [${timestamp}] Meta custom data:`,
      JSON.stringify(metaCustomData, null, 2)
    );

    // Handle different types of subscription events
    switch (eventType) {
      case "subscription_created": // New subscription
      case "subscription_updated": // Subscription changed
      case "subscription_resumed": // Subscription reactivated
        console.log(
          `🔄 [${timestamp}] Processing subscription update for event: ${eventType}`
        );
        await handleSubscriptionUpdate(
          subscriptionData,
          metaCustomData,
          timestamp
        );
        break;

      case "subscription_cancelled": // Subscription cancelled
      case "subscription_expired": // Subscription expired
        console.log(
          `🚫 [${timestamp}] Processing subscription cancellation for event: ${eventType}`
        );
        await handleSubscriptionCancellation(subscriptionData, timestamp);
        break;

      default:
        console.log(`⚠️ [${timestamp}] Unhandled event type: ${eventType}`);
    }

    console.log(`✅ [${timestamp}] Webhook processing completed successfully`);
    // Always return success to LemonSqueezy
    return NextResponse.json({ received: true, timestamp });
  } catch (error) {
    console.error(`💥 [${timestamp}] Error processing webhook:`, error);
    return NextResponse.json(
      { error: "Internal server error", timestamp },
      { status: 500 }
    );
  }
}

/**
 * Handles subscription creation and updates
 * This runs when a subscription is created, updated, or resumed
 *
 * @param subscriptionData - The subscription data from LemonSqueezy
 * @param metaCustomData - Custom data from the webhook meta
 * @param timestamp - Timestamp for logging
 */
async function handleSubscriptionUpdate(
  subscriptionData: any,
  metaCustomData: any,
  timestamp: string
) {
  console.log(`🔄 [${timestamp}] Processing subscription update`);

  try {
    const attributes = subscriptionData.attributes;
    const attributesCustomData = attributes.custom_data || {};

    // CRITICAL: Try to get user ID from meta custom data first, then fall back to attributes
    // This is the key to linking payments to users
    let userId = metaCustomData.user_id || attributesCustomData.user_id;

    if (!userId) {
      console.error(`❌ [${timestamp}] No user ID found in subscription data`);
      return;
    }

    console.log(`👤 [${timestamp}] Found user ID: ${userId}`);

    // Prepare the subscription data for our database
    const subscriptionUpdate = {
      user_id: userId,
      lemonsqueezy_subscription_id: subscriptionData.id,
      lemonsqueezy_customer_id: attributes.customer_id.toString(),
      status: attributes.status,
      plan_name: attributes.product_name || "Monthly Subscription",
      current_period_start: attributes.renews_at,
      current_period_end: attributes.ends_at,
      cancel_at_period_end: attributes.cancelled || false,
    };

    console.log(
      `💾 [${timestamp}] Attempting to save subscription:`,
      subscriptionUpdate
    );

    // Save to our database
    const success = await upsertSubscription(subscriptionUpdate);

    if (success) {
      console.log(
        `✅ [${timestamp}] Subscription ${subscriptionData.id} updated successfully`
      );
    } else {
      console.error(
        `❌ [${timestamp}] Failed to update subscription ${subscriptionData.id}`
      );
    }
  } catch (error) {
    console.error(
      `💥 [${timestamp}] Error handling subscription update:`,
      error
    );
  }
}

/**
 * Handles subscription cancellation and expiration
 * This runs when a subscription is cancelled or expires
 *
 * @param subscriptionData - The subscription data from LemonSqueezy
 * @param timestamp - Timestamp for logging
 */
async function handleSubscriptionCancellation(
  subscriptionData: any,
  timestamp: string
) {
  try {
    console.log(`🚫 [${timestamp}] Processing subscription cancellation`);
    const subscriptionId = subscriptionData.id;

    // Update our database to reflect the cancellation
    const success = await cancelSubscriptionInDB(subscriptionId);

    if (success) {
      console.log(
        `✅ [${timestamp}] Subscription ${subscriptionId} cancelled successfully`
      );
    } else {
      console.error(
        `❌ [${timestamp}] Failed to cancel subscription ${subscriptionId}`
      );
    }
  } catch (error) {
    console.error(
      `💥 [${timestamp}] Error handling subscription cancellation:`,
      error
    );
  }
}
```

    if (!hasWebhookSecret) {
      console.error(
        `❌ [${timestamp}] LEMONSQUEEZY_WEBHOOK_SECRET not configured`
      );
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify the webhook signature
    console.log(`🔐 [${timestamp}] Verifying signature...`);
    if (!verifyWebhookSignature(body, signature)) {
      console.error(`❌ [${timestamp}] Invalid webhook signature`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`✅ [${timestamp}] Webhook signature verified`);

    // Parse the webhook payload
    let event;
    try {
      event = JSON.parse(body);
      console.log(`📦 [${timestamp}] Payload parsed successfully`);
    } catch (parseError) {
      console.error(
        `❌ [${timestamp}] Failed to parse webhook payload:`,
        parseError
      );
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const eventType = event.meta?.event_name;
    const subscriptionData = event.data;
    const metaCustomData = event.meta?.custom_data || {};

    console.log(`🎯 [${timestamp}] Event type: ${eventType}`);
    console.log(`📊 [${timestamp}] Subscription ID: ${subscriptionData?.id}`);
    console.log(
      `👤 [${timestamp}] Meta custom data:`,
      JSON.stringify(metaCustomData, null, 2)
    );

    // Handle different subscription events
    switch (eventType) {
      case "subscription_created":
      case "subscription_updated":
      case "subscription_resumed":
        console.log(
          `🔄 [${timestamp}] Processing subscription update for event: ${eventType}`
        );
        await handleSubscriptionUpdate(
          subscriptionData,
          metaCustomData,
          timestamp
        );
        break;

      case "subscription_cancelled":
      case "subscription_expired":
        console.log(
          `🚫 [${timestamp}] Processing subscription cancellation for event: ${eventType}`
        );
        await handleSubscriptionCancellation(subscriptionData, timestamp);
        break;

      default:
        console.log(`⚠️ [${timestamp}] Unhandled event type: ${eventType}`);
    }

    console.log(`✅ [${timestamp}] Webhook processing completed successfully`);
    return NextResponse.json({ received: true, timestamp });

} catch (error) {
console.error(`💥 [${timestamp}] Error processing webhook:`, error);
return NextResponse.json(
{ error: "Internal server error", timestamp },
{ status: 500 }
);
}
}

/\*\*

- Handles subscription creation and updates
  \*/
  async function handleSubscriptionUpdate(
  subscriptionData: any,
  metaCustomData: any,
  timestamp: string
  ) {
  console.log(`🔄 [${timestamp}] Processing subscription update`);

try {
const attributes = subscriptionData.attributes;
const attributesCustomData = attributes.custom_data || {};

    // CRITICAL: Try to get user ID from meta custom data first, then fall back to attributes
    let userId = metaCustomData.user_id || attributesCustomData.user_id;

    if (!userId) {
      console.error(`❌ [${timestamp}] No user ID found in subscription data`);
      return;
    }

    console.log(`👤 [${timestamp}] Found user ID: ${userId}`);

    // Prepare subscription data for database
    const subscriptionUpdate = {
      user_id: userId,
      lemonsqueezy_subscription_id: subscriptionData.id,
      lemonsqueezy_customer_id: attributes.customer_id.toString(),
      status: attributes.status,
      plan_name: attributes.product_name || "Monthly Subscription",
      current_period_start: attributes.renews_at,
      current_period_end: attributes.ends_at,
      cancel_at_period_end: attributes.cancelled || false,
    };

    console.log(
      `💾 [${timestamp}] Attempting to save subscription:`,
      subscriptionUpdate
    );

    // Update subscription in database
    const success = await upsertSubscription(subscriptionUpdate);

    if (success) {
      console.log(
        `✅ [${timestamp}] Subscription ${subscriptionData.id} updated successfully`
      );
    } else {
      console.error(
        `❌ [${timestamp}] Failed to update subscription ${subscriptionData.id}`
      );
    }

} catch (error) {
console.error(
`💥 [${timestamp}] Error handling subscription update:`,
error
);
}
}

/\*\*

- Handles subscription cancellation and expiration
  \*/
  async function handleSubscriptionCancellation(
  subscriptionData: any,
  timestamp: string
  ) {
  try {
  console.log(`🚫 [${timestamp}] Processing subscription cancellation`);
  const subscriptionId = subscriptionData.id;

      // Cancel subscription in database
      const success = await cancelSubscriptionInDB(subscriptionId);

      if (success) {
        console.log(
          `✅ [${timestamp}] Subscription ${subscriptionId} cancelled successfully`
        );
      } else {
        console.error(
          `❌ [${timestamp}] Failed to cancel subscription ${subscriptionId}`
        );
      }

  } catch (error) {
  console.error(
  `💥 [${timestamp}] Error handling subscription cancellation:`,
  error
  );
  }
  }

```

**Critical points:**

- **Webhook routes are excluded from middleware** (prevents 307 redirects)
- **User ID extraction:** First tries `event.meta.custom_data.user_id`, then falls back to `attributes.custom_data.user_id`
- **Signature verification:** Ensures webhooks are really from LemonSqueezy
- **Extensive logging:** Makes debugging easy
- **Error handling:** Gracefully handles all failure cases

## Step 9: Frontend Components

} catch (error) {
console.error("Error getting subscription status:", error);
return NextResponse.json(
{ error: "Internal server error" },
{ status: 500 }
);
}
}

```

### File: `app/api/subscriptions/cancel/route.ts`

This handles subscription cancellation:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { cancelLemonSqueezySubscription } from "@/lib/lemonsqueezy";
import { cancelSubscriptionInDB } from "@/lib/subscription-helpers";

/**
 * POST /api/subscriptions/cancel
 * Cancels the user's active subscription
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user's active subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (subscriptionError || !subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Cancel the subscription with LemonSqueezy
    const cancelSuccess = await cancelLemonSqueezySubscription(
      subscription.lemonsqueezy_subscription_id
    );

    if (!cancelSuccess) {
      return NextResponse.json(
        { error: "Failed to cancel subscription with payment provider" },
        { status: 500 }
      );
    }

    // Update our database to reflect the cancellation
    const dbUpdateSuccess = await cancelSubscriptionInDB(
      subscription.lemonsqueezy_subscription_id
    );

    if (!dbUpdateSuccess) {
      return NextResponse.json(
        { error: "Failed to update subscription status in database" },
        { status: 500 }
      );
    }

    // Success!
    return NextResponse.json({
      message: "Subscription cancelled successfully",
      cancelled: true,
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Webhook Handler

### File: `app/api/webhooks/lemonsqueezy/route.ts`

This is crucial! Webhooks keep your database synchronized with LemonSqueezy:

```typescript
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  upsertSubscription,
  cancelSubscriptionInDB,
} from "@/lib/subscription-helpers";

/**
 * Verifies that the webhook is actually from LemonSqueezy
 * This prevents malicious requests from fake webhooks
 *
 * @param body - The raw request body
 * @param signature - The signature from LemonSqueezy
 * @returns true if webhook is legitimate, false otherwise
 */
function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

  // Create a hash using your webhook secret
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const expectedSignature = hmac.digest("hex");

  // Compare signatures securely (prevents timing attacks)
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
}

/**
 * POST /api/webhooks/lemonsqueezy
 * Handles webhook events from LemonSqueezy
 * This keeps your database in sync with payment events
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body and signature from the request
    const body = await request.text();
    const signature = request.headers.get("X-Signature");

    // Check if signature is present
    if (!signature) {
      console.error("No signature provided");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Verify the webhook is from LemonSqueezy
    if (!verifyWebhookSignature(body, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Parse the webhook payload
    const event = JSON.parse(body);
    const eventType = event.meta?.event_name;
    const subscriptionData = event.data;

    console.log(`Received LemonSqueezy webhook: ${eventType}`);

    // Handle different types of subscription events
    switch (eventType) {
      case "subscription_created": // New subscription
      case "subscription_updated": // Subscription changed
      case "subscription_resumed": // Subscription reactivated
        await handleSubscriptionUpdate(subscriptionData);
        break;

      case "subscription_cancelled": // Subscription cancelled
      case "subscription_expired": // Subscription expired
        await handleSubscriptionCancellation(subscriptionData);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    // Always return success to LemonSqueezy
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handles subscription creation and updates
 * This runs when a subscription is created, updated, or resumed
 *
 * @param subscriptionData - The subscription data from LemonSqueezy
 */
async function handleSubscriptionUpdate(subscriptionData: any) {
  try {
    const attributes = subscriptionData.attributes;
    const customData = attributes.custom_data || {};

    // Get the user ID that we passed during checkout
    const userId = customData.user_id;

    if (!userId) {
      console.error("No user ID found in subscription data");
      return;
    }

    // Prepare the subscription data for our database
    const subscriptionUpdate = {
      user_id: userId,
      lemonsqueezy_subscription_id: subscriptionData.id,
      lemonsqueezy_customer_id: attributes.customer_id.toString(),
      status: attributes.status,
      plan_name: attributes.product_name || "Monthly Subscription",
      current_period_start: attributes.renews_at,
      current_period_end: attributes.ends_at,
      cancel_at_period_end: attributes.cancelled,
    };

    // Save to our database
    const success = await upsertSubscription(subscriptionUpdate);

    if (success) {
      console.log(`Subscription ${subscriptionData.id} updated successfully`);
    } else {
      console.error(`Failed to update subscription ${subscriptionData.id}`);
    }
  } catch (error) {
    console.error("Error handling subscription update:", error);
  }
}

/**
 * Handles subscription cancellation and expiration
 * This runs when a subscription is cancelled or expires
 *
 * @param subscriptionData - The subscription data from LemonSqueezy
 */
async function handleSubscriptionCancellation(subscriptionData: any) {
  try {
    const subscriptionId = subscriptionData.id;

    // Update our database to reflect the cancellation
    const success = await cancelSubscriptionInDB(subscriptionId);

    if (success) {
      console.log(`Subscription ${subscriptionId} cancelled successfully`);
    } else {
      console.error(`Failed to cancel subscription ${subscriptionId}`);
    }
  } catch (error) {
    console.error("Error handling subscription cancellation:", error);
  }
}
```

## Frontend Components

### File: `components/subscription/SubscriptionCard.tsx`

This displays subscription plans and handles the "Subscribe Now" button:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define what props this component expects
interface SubscriptionCardProps {
  title: string; // Plan name (e.g., "Premium")
  description: string; // Plan description
  price: string; // Price display (e.g., "$9.99")
  features: string[]; // List of features
  variantId: string; // LemonSqueezy variant ID
  isPopular?: boolean; // Whether to highlight as popular
}

export function SubscriptionCard({
  title,
  description,
  price,
  features,
  variantId,
  isPopular = false,
}: SubscriptionCardProps) {
  // Track loading state while creating checkout
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the "Subscribe Now" button click
   * This creates a checkout session and redirects to LemonSqueezy
   */
  const handleSubscribe = async () => {
    try {
      setIsLoading(true); // Show loading state

      // Call our API to create a checkout session
      const response = await fetch("/api/subscriptions/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ variantId }), // Send the variant ID
      });

      // Parse the response
      const data = await response.json();

      // Check if the request failed
      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to LemonSqueezy checkout page
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert("Failed to start checkout process. Please try again.");
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  return (
    <Card className={`relative ${isPopular ? "border-blue-500 border-2" : ""}`}>
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="text-3xl font-bold">
          {price}
          <span className="text-lg text-gray-500 font-normal">/month</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Feature list */}
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center space-x-2">
              {/* Checkmark icon */}
              <svg
                className="w-4 h-4 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Subscribe button */}
        <Button
          onClick={handleSubscribe}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? "Creating checkout..." : "Subscribe Now"}
        </Button>
      </CardContent>
    </Card>
  );
}
```

### File: `components/subscription/SubscriptionStatus.tsx`

This shows the user's current subscription status and allows cancellation:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define what a subscription object looks like
interface Subscription {
  id: string;
  status: string;
  plan_name: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export function SubscriptionStatus() {
  // Component state
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  /**
   * Fetches the user's current subscription status from our API
   */
  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch("/api/subscriptions/status");
      const data = await response.json();

      if (response.ok) {
        setSubscription(data.subscription); // Set the subscription data
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  /**
   * Handles subscription cancellation when user clicks cancel button
   */
  const handleCancelSubscription = async () => {
    // Confirm with the user before cancelling
    if (!confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    try {
      setCancelling(true); // Show loading state

      // Call our cancellation API
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          "Subscription cancelled successfully. You will retain access until the end of your billing period."
        );
        fetchSubscriptionStatus(); // Refresh the data to show updated status
      } else {
        throw new Error(data.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      alert("Failed to cancel subscription. Please try again.");
    } finally {
      setCancelling(false); // Hide loading state
    }
  };

  // Load subscription status when component mounts
  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading subscription status...</div>
        </CardContent>
      </Card>
    );
  }

  // Show "no subscription" state
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            You don't have an active subscription. Subscribe now to access
            premium features!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Show subscription details
  const isActive = subscription.status === "active";
  const endDate = new Date(
    subscription.current_period_end
  ).toLocaleDateString();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Your Subscription</span>
          {/* Status badge */}
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {subscription.status.toUpperCase()}
          </span>
        </CardTitle>
        <CardDescription>{subscription.plan_name}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">
            {
              subscription.cancel_at_period_end
                ? `Your subscription will end on ${endDate}` // Already cancelled
                : `Next billing date: ${endDate}` // Still active
            }
          </p>
        </div>

        {/* Only show cancel button if subscription is active and not already cancelled */}
        {isActive && !subscription.cancel_at_period_end && (
          <Button
            variant="outline"
            onClick={handleCancelSubscription}
            disabled={cancelling}
            className="w-full"
          >
            {cancelling ? "Cancelling..." : "Cancel Subscription"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

### File: `app/(main-app)/subscribe/page.tsx`

This is the main subscription page that users see:

```tsx
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { createClient } from "@/lib/server";

/**
 * Subscription page - shows subscription plans and current status
 * This is a server component, so it runs on the server
 */
export default async function SubscribePage() {
  // Get the current user (server-side)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">
            Subscribe to ToEILET Premium
          </h1>
          <p className="text-gray-600 mb-8">
            Please log in to manage your subscription.
          </p>
        </div>
      </div>
    );
  }

  // User is logged in, show the subscription page
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Page header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600">
          Unlock premium features and unlimited access to ToEILET
        </p>
      </div>

      {/* Current subscription status */}
      <div className="mb-8">
        <SubscriptionStatus />
      </div>

      {/* Subscription plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free plan */}
        <SubscriptionCard
          title="Free"
          description="Perfect for trying out ToEILET"
          price="$0"
          features={[
            "5 practice sessions per month",
            "Basic feedback",
            "Limited access to levels",
          ]}
          variantId="" // No variant ID for free plan
        />

        {/* Premium plan */}
        <SubscriptionCard
          title="Premium"
          description="Full access to all ToEILET features"
          price="$9.99"
          features={[
            "Unlimited practice sessions",
            "Advanced AI feedback",
            "Access to all levels",
            "Progress tracking",
            "Priority support",
            "Export results",
          ]}
          variantId="871461" // Replace with your actual LemonSqueezy variant ID
          isPopular={true}
        />
      </div>

      {/* FAQ section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-gray-600">
              Yes, you can cancel your subscription at any time. You'll continue
              to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Is there a free trial?</h3>
            <p className="text-gray-600">
              You can use ToEILET with limited features for free. Upgrade to
              premium to unlock all features.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              How secure is my payment information?
            </h3>
            <p className="text-gray-600">
              All payments are processed securely through LemonSqueezy, a
              trusted payment processor. We don't store your payment
              information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## How It All Works Together

### 1. User Subscribes

1. User clicks "Subscribe Now" on a subscription card
2. `SubscriptionCard.tsx` calls `/api/subscriptions/create-checkout`
3. API creates a LemonSqueezy checkout session
4. User is redirected to LemonSqueezy to pay
5. After payment, user is redirected back to your app

### 2. Webhook Updates Database

1. LemonSqueezy sends a webhook to `/api/webhooks/lemonsqueezy`
2. Webhook verifies authenticity and processes the event
3. Subscription data is saved to your database
4. User's `is_premium` status is updated

### 3. User Sees Updated Status

1. `SubscriptionStatus.tsx` calls `/api/subscriptions/status`
2. API checks database for user's subscription
3. Component shows current subscription details

### 4. User Can Cancel

1. User clicks "Cancel Subscription"
2. `SubscriptionStatus.tsx` calls `/api/subscriptions/cancel`
3. API cancels with LemonSqueezy and updates database
4. User's premium status is removed

## Testing Your Implementation

### 1. Install Dependencies

```bash
npm install @lemonsqueezy/lemonsqueezy.js
```

### 2. Set Environment Variables

Make sure all your `.env.local` variables are set correctly.

### 3. Test Locally

1. Start your development server: `npm run dev`
2. Go to `/subscribe`
3. Try subscribing with a test card
4. Check your database to see if subscription was created

### 4. Test Webhooks with ngrok

**⚠️ IMPORTANT:** Webhooks are the most common source of issues! LemonSqueezy needs to send webhooks to your server, but `localhost` isn't accessible from the internet. This is likely why your database isn't updating after payments.

Here's how to properly test webhooks:

#### Step 1: Install ngrok

**Option A: Install via npm (Recommended)**

```bash
npm install -g ngrok
```

**Option B: Download from ngrok.com**

1. Go to [ngrok.com](https://ngrok.com)
2. Sign up for a free account
3. Download ngrok for Windows
4. Extract to a folder and add to your PATH

#### Step 2: Start Your Development Server

Make sure your Next.js app is running:

```bash
npm run dev
```

Your app should be running on `http://localhost:8000` (or whatever port you're using).

#### Step 3: Expose Your Local Server

Open a new terminal and run:

```bash
ngrok http 8000
```

You'll see output like this:

```
Session Status                online
Account                       your-email@example.com
Version                       3.0.0
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok.io -> http://localhost:8000
```

**Important:** Copy the `https://` URL (e.g., `https://abc123def456.ngrok.io`). This is your public URL that LemonSqueezy can reach.

#### Step 4: Update Your LemonSqueezy Webhook

1. Go to your LemonSqueezy dashboard
2. Navigate to Settings → Webhooks
3. Find your webhook or create a new one
4. Update the Endpoint URL to: `https://your-ngrok-url.ngrok.io/api/webhooks/lemonsqueezy`
5. Make sure these events are enabled:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_expired`
   - `subscription_resumed`

#### Step 5: Update Your Environment Variables

Update your `.env.local` file:

```env
# Use your ngrok URL for local testing
NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok.io

# Your other environment variables...
LEMONSQUEEZY_API_KEY=your_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Step 6: Test the Complete Flow

1. **Start both servers:**

   ```bash
   # Terminal 1: Your Next.js app
   npm run dev

   # Terminal 2: ngrok tunnel
   ngrok http 8000
   ```

2. **Test webhook delivery:**

   - Go to `https://your-ngrok-url.ngrok.io/api/test/webhook-test`
   - Or use our test endpoint:

   ```bash
   curl -X POST https://your-ngrok-url.ngrok.io/api/test/webhook-test \
     -H "Content-Type: application/json" \
     -d '{"userId": "your-user-id"}'
   ```

3. **Monitor webhook traffic:**

   - Open `http://127.0.0.1:4040` in your browser
   - This shows all HTTP requests to your ngrok tunnel
   - Watch for webhook requests from LemonSqueezy

4. **Test a real payment:**
   - Go to your subscribe page
   - Start a checkout process
   - Use LemonSqueezy test card: `4242 4242 4242 4242`
   - Watch your terminal for webhook logs
   - Check the ngrok web interface for webhook requests

#### Step 7: Monitor and Debug

**Watch your server logs:**
Your terminal running `npm run dev` should show detailed webhook processing:

```
🔔 [2024-01-15T10:30:00Z] Webhook received
📝 [2024-01-15T10:30:00Z] Webhook body length: 1234
🔐 [2024-01-15T10:30:00Z] Signature present: true
✅ [2024-01-15T10:30:00Z] Webhook signature verified
🎯 [2024-01-15T10:30:00Z] Event type: subscription_created
👤 [2024-01-15T10:30:00Z] Found user ID: user_xxx
💾 [2024-01-15T10:30:00Z] Attempting to save subscription
✅ [2024-01-15T10:30:00Z] Subscription updated successfully
```

**Check ngrok web interface:**

- Open `http://127.0.0.1:4040`
- Look for POST requests to `/api/webhooks/lemonsqueezy`
- Check response codes (should be 200)
- Inspect request/response details

#### Common ngrok Issues

**Issue: ngrok URL keeps changing**

```bash
# Get a free static subdomain (requires ngrok account)
ngrok config add-authtoken YOUR_AUTHTOKEN
ngrok http 8000 --subdomain=your-app-name
```

**Issue: Webhook signature fails**

- Make sure `LEMONSQUEEZY_WEBHOOK_SECRET` in your `.env.local` matches the secret in LemonSqueezy dashboard
- The secret should be exactly the same, no extra spaces

**Issue: No webhook requests visible**

- Double-check the webhook URL in LemonSqueezy matches your ngrok URL exactly
- Ensure webhook is enabled and has the right events selected
- Try the webhook test feature in LemonSqueezy dashboard

**Issue: 404 errors on webhook endpoint**

- Verify the path is `/api/webhooks/lemonsqueezy` (note the plural "webhooks")
- Make sure your Next.js app is running on the correct port
- Check that the file `app/api/webhooks/lemonsqueezy/route.ts` exists

#### Production Deployment

Once testing works locally with ngrok:

1. Deploy your app to Vercel/Netlify/etc.
2. Update the LemonSqueezy webhook URL to your production domain
3. Update `NEXT_PUBLIC_APP_URL` to your production URL
4. Test with a real payment to confirm webhooks work in production

#### Ngrok Alternatives (If Needed)

If ngrok doesn't work for you:

- **localtunnel:** `npx localtunnel --port 8000`
- **cloudflare tunnel:** `npx cloudflared tunnel --url localhost:8000`
- **VS Code port forwarding** (if using GitHub Codespaces)

### Why ngrok is Essential for Webhook Testing

**The Problem:**

- LemonSqueezy sends webhooks to your server after payment events
- `localhost:8000` is only accessible from your computer
- LemonSqueezy's servers can't reach `localhost` from the internet
- Without webhooks, your database never gets updated

## Step 10: Testing with ngrok

**⚠️ CRITICAL:** This step is essential because webhooks won't work locally without ngrok. This is the most common reason subscriptions fail to update in the database.

### Why ngrok is Required

- LemonSqueezy sends webhooks to your server after payment events
- `localhost:3000` is only accessible from your computer
- LemonSqueezy's servers can't reach `localhost` from the internet
- ngrok creates a secure tunnel from the internet to your localhost
- Without ngrok, webhooks fail and your database never gets updated

### Step 1: Install ngrok

**Option A: Install via npm (Recommended)**

```bash
npm install -g ngrok
```

**Option B: Download from ngrok.com**

1. Go to [ngrok.com](https://ngrok.com)
2. Sign up for a free account
3. Download ngrok for Windows
4. Extract to a folder and add to your PATH

### Step 2: Start Your Development Server

Make sure your Next.js app is running:

```bash
npm run dev
```

Your app should be running on `http://localhost:3000`.

### Step 3: Expose Your Local Server

Open a new terminal and run:

```bash
ngrok http 3000
```

You'll see output like this:

```
Forwarding  https://abc123def456.ngrok.io -> http://localhost:3000
```

**Copy the `https://` URL** - this is your public URL.

### Step 4: Update Environment Variables

Update your `.env.local`:

```env
# Use your ngrok URL for testing
NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok.io

# Keep your other variables unchanged
LEMONSQUEEZY_API_KEY=your_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 5: Set Up LemonSqueezy Webhook

1. Go to [LemonSqueezy Dashboard](https://app.lemonsqueezy.com)
2. Settings → Webhooks → Create Webhook
3. **Endpoint URL:** `https://your-ngrok-url.ngrok.io/api/webhooks/lemonsqueezy`
4. **Events:** Enable these:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_expired`
   - `subscription_resumed`
5. **Copy the Signing Secret** and add to `.env.local`:

```env
LEMONSQUEEZY_WEBHOOK_SECRET=your_signing_secret_here
```

### Step 6: Test Complete Flow

1. **Start both servers:**

   ```bash
   # Terminal 1
   npm run dev

   # Terminal 2
   ngrok http 3000
   ```

2. **Test payment:**

   - Go to `https://your-ngrok-url.ngrok.io/subscribe`
   - Click "Subscribe Now"
   - Use test card: `4242 4242 4242 4242`
   - Complete payment

3. **Monitor webhooks:**
   - Open `http://127.0.0.1:4040` (ngrok web interface)
   - Watch for webhook requests from LemonSqueezy
   - Check your terminal for webhook processing logs

### Step 7: Verify Success

**Check your terminal logs:**

```
🔔 Webhook received
✅ Webhook signature verified
🎯 Event type: subscription_created
👤 Found user ID: user_xxx
✅ Subscription updated successfully
```

**Check your database:**

- New row in `subscriptions` table
- User's `is_premium` set to `true` in `profiles` table

## Common Issues & Troubleshooting

### 🚨 Issue: "Invalid signature" in webhook

**Cause:** Webhook secret mismatch.

**Solution:**

1. Copy exact signing secret from LemonSqueezy dashboard
2. Update `LEMONSQUEEZY_WEBHOOK_SECRET` in `.env.local`
3. Restart your dev server (`npm run dev`)

### 🚨 Issue: User not getting premium status

**Debugging steps:**

1. **Check webhook is being called:**

   - Look for webhook requests in ngrok web interface (`http://127.0.0.1:4040`)
   - Should see POST to `/api/webhooks/lemonsqueezy`

2. **Check user ID is found:**

   - Look for "Found user ID" in terminal logs
   - If missing, check checkout is passing `user_id` correctly

3. **Check database updates:**
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
   - Check `profiles` table has `is_premium` column

### 🚨 Issue: 307 Redirect on webhooks

**Cause:** Middleware is trying to authenticate webhooks.

**Solution:** Ensure your `lib/middleware.ts` excludes webhook routes:

```typescript
export async function updateSession(request: NextRequest) {
  // CRITICAL: Skip authentication for webhook routes
  const isWebhookRoute = request.nextUrl.pathname.startsWith("/api/webhooks");
  if (isWebhookRoute) {
    return NextResponse.next();
  }

  // ...rest of middleware
}
```

### 🚨 Issue: Checkout creation fails

**Check these:**

1. `LEMONSQUEEZY_API_KEY` is correct and active
2. `LEMONSQUEEZY_STORE_ID` matches your store
3. Variant ID exists in your LemonSqueezy store
4. User is properly authenticated in your app

### 🚨 Issue: No webhook requests visible

**Solutions:**

1. **Double-check webhook URL:** Must match your ngrok URL exactly
2. **Verify webhook is enabled:** In LemonSqueezy dashboard
3. **Test webhook delivery:** Use LemonSqueezy's test feature
4. **Check ngrok is running:** Terminal should show "Forwarding" message

### 🚨 Issue: Database errors

**Check:**

1. `SUPABASE_SERVICE_ROLE_KEY` is set correctly
2. Tables exist with correct schema:

   ```sql
   -- Check subscriptions table exists
   SELECT * FROM subscriptions LIMIT 1;

   -- Check profiles table has is_premium column
   SELECT id, is_premium FROM profiles LIMIT 1;
   ```

3. RLS policies allow service role access

## Deployment Checklist

When ready for production:

### 1. Update Environment Variables

Set these in your production environment (Vercel, Netlify, etc.):

```env
# Production URLs
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Same LemonSqueezy credentials
LEMONSQUEEZY_API_KEY=your_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret

# Same Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Update LemonSqueezy Webhook

1. Go to LemonSqueezy Dashboard → Settings → Webhooks
2. Update endpoint URL to: `https://yourdomain.com/api/webhooks/lemonsqueezy`
3. Test webhook delivery in LemonSqueezy dashboard

### 3. Test Production Flow

1. Process a real test payment
2. Monitor webhook delivery in LemonSqueezy dashboard
3. Verify database updates in Supabase
4. Test subscription cancellation

## Summary

This implementation provides:

- ✅ **Secure subscription management** with LemonSqueezy
- ✅ **Real-time status updates** via webhooks
- ✅ **User-friendly interface** for subscription management
- ✅ **Automatic premium status management**
- ✅ **Proper error handling** and debugging
- ✅ **Production-ready** architecture

### Key Success Factors:

1. **Exclude webhook routes from middleware** (prevents 307 redirects)
2. **Use ngrok for local testing** (most common failure point)
3. **Pass user_id correctly** from checkout to webhooks
4. **Monitor webhook logs** for debugging issues
5. **Test end-to-end flow** before going live

**Follow this guide step-by-step, and you'll have a working subscription system that handles payments, webhooks, and premium access automatically!**

---

**Need help?** The most common issues are:

1. Forgetting to use ngrok (webhooks fail)
2. Middleware blocking webhooks (307 redirects)
3. Wrong webhook secret (signature failures)
4. Missing environment variables

Check the troubleshooting section above for solutions to these common problems.
