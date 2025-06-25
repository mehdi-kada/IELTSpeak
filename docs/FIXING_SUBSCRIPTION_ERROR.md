# Complete Subscription Troubleshooting Guide

This guide will help you fix any subscription-related issues step by step. Whether you're just starting or encountering errors, this covers everything.

## 🎯 Quick Problem Diagnosis

### What Error Are You Seeing?

1. **"Failed to fetch subscription status"** → [Database Setup Issue](#1-database-setup-issues)
2. **"Product does not exist"** → [Wrong Product ID](#2-product-id-issues)
3. **"Input should be a valid URL"** → [Environment Variable Issue](#3-environment-variable-issues)
4. **"Multiple rows returned"** → [Duplicate Subscriptions](#4-duplicate-subscriptions)
5. **"Unauthorized"** → [Authentication Issue](#5-authentication-issues)
6. **Webhook not working** → [Webhook Configuration](#6-webhook-issues)

## 🔧 Step-by-Step Solutions

### 1. Database Setup Issues

**Error**: `"Failed to fetch subscription status"` or `"Table doesn't exist"`

**Solution**:

1. **Open Supabase Dashboard**:

   - Go to your Supabase project
   - Click "SQL Editor" in the sidebar

2. **Run the Database Setup**:

   ```sql
   -- Copy and paste this entire block into the SQL Editor

   -- Create the user_subscriptions table
   CREATE TABLE IF NOT EXISTS user_subscriptions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

     -- Polar identifiers
     polar_customer_id TEXT NOT NULL,
     polar_subscription_id TEXT UNIQUE,
     polar_checkout_id TEXT,

     -- Product information
     polar_product_id TEXT NOT NULL,
     polar_product_type TEXT,

     -- Subscription status and timing
     status TEXT NOT NULL DEFAULT 'incomplete',
     current_period_start TIMESTAMP,
     current_period_end TIMESTAMP,
     cancel_at_period_end BOOLEAN DEFAULT false,
     canceled_at TIMESTAMP,
     started_at TIMESTAMP,
     ends_at TIMESTAMP,

     -- Pricing information
     amount INTEGER, -- Amount in cents
     currency TEXT DEFAULT 'usd',
     recurring_interval TEXT DEFAULT 'month',

     created_at TIMESTAMP DEFAULT now(),
     updated_at TIMESTAMP DEFAULT now()
   );

   -- Add indexes for better performance
   CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
   CREATE INDEX IF NOT EXISTS idx_user_subscriptions_polar_customer_id ON user_subscriptions(polar_customer_id);
   CREATE INDEX IF NOT EXISTS idx_user_subscriptions_polar_subscription_id ON user_subscriptions(polar_subscription_id);
   CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

   -- Create trigger function for updating updated_at
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = now();
     RETURN NEW;
   END;
   $$ LANGUAGE 'plpgsql';

   -- Create the trigger
   DROP TRIGGER IF EXISTS update_updated_at_column_user_subscription ON user_subscriptions;
   CREATE TRIGGER update_updated_at_column_user_subscription
     BEFORE UPDATE ON user_subscriptions
     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

   -- Create payment_logs table (for debugging)
   CREATE TABLE IF NOT EXISTS payment_logs (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     event_type TEXT NOT NULL,
     polar_event_id TEXT,
     event_data JSONB,
     error_message TEXT,
     status TEXT NOT NULL DEFAULT 'received',
     created_at TIMESTAMP DEFAULT now()
   );

   -- Add index for payment logs
   CREATE INDEX IF NOT EXISTS idx_payment_logs_polar_event_id ON payment_logs(polar_event_id);
   CREATE INDEX IF NOT EXISTS idx_payment_logs_status ON payment_logs(status);
   CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at);

   -- Enable RLS (Row Level Security)
   ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies
   CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions
     FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "Only service role can access payment logs" ON payment_logs
     FOR ALL USING (auth.role() = 'service_role');
   ```

3. **Click "Run"** to execute the SQL

4. **Verify Tables Created**:
   - Go to "Table Editor" in Supabase
   - You should see `user_subscriptions` and `payment_logs` tables

### 2. Product ID Issues

**Error**: `"Product does not exist"` or `"Input should be a valid UUID"`

**Solution**:

1. **Get Your Real Product ID**:

   - Go to [Polar Sandbox Dashboard](https://sandbox-polar.sh)
   - Log in to your account
   - Navigate to "Products"
   - Click on your subscription product
   - Copy the **Product ID** (looks like: `123e4567-e89b-12d3-a456-426614174000`)

2. **Update Your Environment Variable**:

   ```bash
   # In your .env.local file
   NEXT_PUBLIC_POLAR_PRODUCT_ID="your_actual_product_id_here"
   ```

3. **Create a Product if You Don't Have One**:
   - In Polar dashboard, click "Create Product"
   - Set up a monthly subscription:
     - Name: "Premium Subscription"
     - Description: "Monthly access to premium features"
     - Price: $9.99 (or your preferred price)
     - Billing: Monthly
     - Type: Subscription
   - Save and copy the Product ID

### 3. Environment Variable Issues

**Error**: `"Input should be a valid URL"` or `"undefined/subscribe/success"`

**Problem**: Missing or incorrect environment variables

**Solution**:

1. **Check Your `.env.local` File**:

   ```bash
   # Required variables (replace with your actual values)
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   POLAR_ACCESS_TOKEN="polar_pat_your_actual_token"
   POLAR_WEBHOOK_SECRET="your_webhook_secret"
   POLAR_ORGANIZATION_ID="your_org_id"
   POLAR_SERVER="sandbox"
   NEXT_PUBLIC_POLAR_PRODUCT_ID="your_actual_product_uuid"

   # Your existing Supabase variables
   NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
   SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
   ```

2. **Get Missing Values**:

   - **POLAR_ACCESS_TOKEN**: Polar Dashboard → Settings → API Keys
   - **POLAR_ORGANIZATION_ID**: Found in your Polar dashboard URL or settings
   - **POLAR_WEBHOOK_SECRET**: Create a random string when setting up webhooks

3. **Restart Your Development Server**:
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

### 4. Duplicate Subscriptions

**Error**: `"Results contain 2 rows, application/vnd.pgrst.object+json requires 1 row"`

**Problem**: Multiple subscription records for the same user

**Solution**:

1. **Use the Debug Panel**:

   - Go to `http://localhost:3000/subscription-debug`
   - Click "Fetch Debug Data"
   - You'll see how many subscriptions you have

2. **Clean Up Duplicates**:

   - In the debug panel, click "Cleanup Duplicates"
   - This will keep only the most recent subscription

3. **Manual Cleanup** (if debug panel doesn't work):

   ```sql
   -- Run this in Supabase SQL Editor to see duplicates
   SELECT user_id, COUNT(*) as subscription_count
   FROM user_subscriptions
   GROUP BY user_id
   HAVING COUNT(*) > 1;

   -- Update old subscriptions to inactive (replace USER_ID with actual ID)
   UPDATE user_subscriptions
   SET status = 'inactive_duplicate'
   WHERE user_id = 'YOUR_USER_ID_HERE'
   AND id NOT IN (
     SELECT id FROM user_subscriptions
     WHERE user_id = 'YOUR_USER_ID_HERE'
     ORDER BY created_at DESC
     LIMIT 1
   );
   ```

### 5. Authentication Issues

**Error**: `"Unauthorized"` or `"User not found"`

**Solutions**:

1. **Make Sure You're Logged In**:

   - Go to your login page
   - Sign in with a valid account
   - Verify you can access authenticated pages

2. **Check Supabase Auth**:

   - Go to Supabase Dashboard → Authentication → Users
   - Verify your user exists
   - Check that your user has a valid UUID

3. **Verify API Keys**:
   - Double-check your Supabase service role key
   - Make sure it's not the anon key

### 6. Webhook Issues

**Error**: Webhooks not being received or processed

**Solution**:

1. **For Local Development**:

   ```bash
   # Install ngrok if you haven't
   npm install -g ngrok

   # In a new terminal, expose your local server
   ngrok http 3000

   # Copy the HTTPS URL (like https://abc123.ngrok.io)
   ```

2. **Set Up Webhook in Polar**:

   - Go to Polar Dashboard → Settings → Webhooks
   - Click "Add Endpoint"
   - URL: `https://your-ngrok-url.ngrok.io/api/webhooks/polar`
   - Format: "Raw"
   - Secret: Create a random string and add to `.env.local`
   - Events: Select all subscription events

3. **Test Webhook**:
   - Complete a test purchase
   - Check the `payment_logs` table in Supabase
   - Should see webhook events being logged

## 🧪 Testing Tools

### Debug Panel (`/subscription-debug`)

Visit this page to:

- See all your subscription records
- Check for duplicates
- Clean up old subscriptions
- View detailed error information

### Polar Setup Helper (`/polar-test`)

Visit this page to:

- Test your Polar API connection
- Verify your product ID
- Test checkout creation
- Get setup instructions

### Test Subscription Flow

1. **Create a Test Page**:

   ```tsx
   // app/test-subscription/page.tsx
   import { SubscriptionButton } from "@/components/payments/SubscriptionButton";

   export default function TestPage() {
     return (
       <div className="p-8">
         <h1 className="text-2xl font-bold mb-4">Test Subscription</h1>
         <SubscriptionButton
           productId={process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID}
           className="bg-blue-600 text-white px-6 py-3 rounded"
         >
           Test Subscribe
         </SubscriptionButton>
       </div>
     );
   }
   ```

2. **Test the Flow**:
   - Click the subscribe button
   - Complete payment with test card
   - Verify you're redirected to success page
   - Check subscription status

## ✅ Verification Checklist

Go through this checklist to ensure everything is working:

### Environment Setup

- [ ] `.env.local` file has all required variables
- [ ] All placeholder values replaced with real keys
- [ ] Development server restarted after env changes

### Database Setup

- [ ] `user_subscriptions` table exists in Supabase
- [ ] `payment_logs` table exists in Supabase
- [ ] RLS policies are enabled
- [ ] No duplicate subscription records

### Polar Setup

- [ ] Polar account created and verified
- [ ] Product created with correct pricing
- [ ] Product ID copied to environment variables
- [ ] API keys generated and added to environment
- [ ] Webhook endpoint configured (for production)

### Testing

- [ ] Debug panel shows no errors (`/subscription-debug`)
- [ ] Polar test helper works (`/polar-test`)
- [ ] Subscribe button creates checkout URL
- [ ] Payment flow completes successfully
- [ ] Subscription status updates correctly

## 🚨 Common Mistakes to Avoid

1. **Using Placeholder Values**: Replace ALL placeholder values in environment variables
2. **Wrong Product ID Format**: Must be a valid UUID, not a string like "your-product-id"
3. **Missing Environment Variables**: All required variables must be set
4. **Not Restarting Server**: Restart after changing environment variables
5. **Wrong Polar Environment**: Use sandbox for testing, production for live
6. **HTTP vs HTTPS**: Use HTTPS URLs for webhooks in production
7. **Forgetting Database Migration**: Run the SQL schema first

## 📞 Still Having Issues?

If you're still stuck after trying these solutions:

1. **Check the Browser Console**: Look for JavaScript errors
2. **Check Server Logs**: Look for API errors in your terminal
3. **Check Database Logs**: Look in `payment_logs` table for webhook errors
4. **Use Debug Tools**: The debug panel shows detailed information
5. **Verify Step by Step**: Go through each setup step again

## 🎯 Using the Subscription System

Once everything is working, here's how to use it in your app:

### Check Subscription Status

```tsx
import { useSubscriptionStatus } from "@/hooks/use-subscription-status";

function MyComponent() {
  const { isSubscribed, loading, subscription } = useSubscriptionStatus();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isSubscribed ? (
        <div>✅ Premium features available!</div>
      ) : (
        <div>❌ Subscribe to unlock premium features</div>
      )}
    </div>
  );
}
```

### Add Subscribe Button

```tsx
import { SubscriptionButton } from "@/components/payments/SubscriptionButton";

function PricingPage() {
  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Premium Plan</h2>
      <p className="text-3xl font-bold mb-4">
        $9.99<span className="text-lg">/month</span>
      </p>
      <ul className="mb-6">
        <li>✅ Unlimited practice sessions</li>
        <li>✅ Advanced AI feedback</li>
        <li>✅ Progress tracking</li>
      </ul>
      <SubscriptionButton
        productId={process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID}
        className="w-full bg-blue-600 text-white py-3 rounded-lg"
      >
        Subscribe Now
      </SubscriptionButton>
    </div>
  );
}
```

### Protect Premium Features

```tsx
import { useSubscriptionStatus } from "@/hooks/use-subscription-status";

function PremiumFeature() {
  const { isSubscribed, loading } = useSubscriptionStatus();

  if (loading) return <div>Loading...</div>;

  if (!isSubscribed) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h3 className="text-xl font-bold mb-4">Premium Feature</h3>
        <p className="mb-4">This feature requires a premium subscription.</p>
        <SubscriptionButton
          productId={process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID}
        >
          Subscribe to Access
        </SubscriptionButton>
      </div>
    );
  }

  return (
    <div>
      {/* Your premium feature content here */}
      <h3>Welcome to Premium!</h3>
      <p>You have access to all premium features.</p>
    </div>
  );
}
```

## 🎉 Success!

Once you've completed this guide, you'll have:

- A fully working subscription system
- Secure payment processing
- Automatic subscription management
- User-friendly subscription pages
- Debugging tools for maintenance

Your users can now subscribe, manage their subscriptions, and access premium features seamlessly!
