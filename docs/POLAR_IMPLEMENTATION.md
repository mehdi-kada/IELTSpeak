# Polar Payments Implementation Guide

This implementation provides a complete monthly subscription system using Polar payments for your ToEILET application. This guide assumes you're a beginner and will walk you through every step.

## 🎯 What You'll Build

By the end of this guide, you'll have:
- A working monthly subscription system
- Secure payment processing with Polar
- Automatic subscription management
- User-friendly pricing pages
- Subscription status checking
- Webhook handling for real-time updates

## 📋 Prerequisites

Before starting, make sure you have:
- A Next.js 13+ application (you already have this)
- A Supabase account and project
- A Polar account (sign up at [polar.sh](https://polar.sh))
- Basic understanding of React/Next.js

## 🚀 Step-by-Step Setup

### Step 1: Create Your Polar Account and Product

1. **Sign up for Polar**:
   - Go to [polar.sh](https://polar.sh) and create an account
   - Use the sandbox environment for testing

2. **Create a Product**:
   - In your Polar dashboard, go to "Products"
   - Click "Create Product"
   - Set up your monthly subscription:
     - Name: "Premium Subscription"
     - Price: $9.99/month
     - Recurring: Yes, Monthly
   - Copy the **Product ID** (looks like: `123e4567-e89b-12d3-a456-426614174000`)

3. **Get Your API Keys**:
   - Go to Settings → API Keys
   - Copy your **Access Token** (starts with `polar_pat_`)
   - Copy your **Organization ID**

### Step 2: Environment Variables Setup

Create or update your `.env.local` file with these exact variables:

```bash
# Polar Configuration (REQUIRED)
POLAR_ACCESS_TOKEN="polar_pat_your_actual_token_here"
POLAR_WEBHOOK_SECRET="your_webhook_secret_from_polar"
POLAR_ORGANIZATION_ID="your_org_id_from_polar"
POLAR_SERVER="sandbox"  # Use "production" when ready to go live

# App Configuration (REQUIRED)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_POLAR_PRODUCT_ID="your_product_id_from_step_1"

# Your existing Supabase variables (keep these)
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
```

**⚠️ Important**: Replace ALL placeholder values with your actual keys!

### Step 3: Database Setup

Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor → New Query):

```sql
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

### Step 4: Install Required Dependencies

You already have these installed, but for reference:

```bash
npm install @polar-sh/sdk @polar-sh/nextjs @supabase/supabase-js
```

### Step 5: Webhook Setup in Polar

1. **Get your webhook URL**:
   - For development: Use ngrok or similar tool
   - For production: `https://yourdomain.com/api/webhooks/polar`

2. **Create webhook in Polar**:
   - Go to Polar Dashboard → Settings → Webhooks
   - Click "Add Endpoint"
   - URL: Your webhook URL
   - Format: "Raw"
   - Secret: Create a random string (save this for your .env)
   - Events to subscribe to:
     - `subscription.created`
     - `subscription.updated`
     - `subscription.active`
     - `subscription.canceled`
     - `subscription.revoked`
     - `customer.created`

## 📁 Understanding the File Structure

Here's what each file does in the implementation:

```
lib/
├── polar-client.ts              # 🔌 Connects to Polar API
├── subscription-helpers.ts     # 🛠️ Helper functions for subscriptions

app/api/subscriptions/
├── create/route.ts             # 🛒 Creates checkout sessions
├── status/route.ts             # 📊 Checks subscription status
├── cancel/route.ts             # ❌ Cancels subscriptions
├── success/route.ts            # ✅ Handles successful payments
└── debug/route.ts              # 🐛 Debug subscription issues

app/api/webhooks/
└── polar/route.ts              # 📡 Receives updates from Polar

app/subscribe/
├── success/page.tsx            # 🎉 Success page after payment
└── page.tsx                    # 💳 Main subscription page

components/payments/
├── SubscriptionButton.tsx      # 🔘 Subscribe button
├── SubscriptionStatus.tsx      # 📋 Shows subscription info
└── PricingComponent.tsx        # 💰 Pricing display

hooks/
└── use-subscription-status.ts  # 🎣 Hook to check subscription

components/debug/
├── SubscriptionDebugPanel.tsx  # 🔍 Debug panel
├── PolarSetupHelper.tsx        # 🆘 Setup helper
└── SubscriptionDebug.tsx       # 🧪 Test component
```

## 🧩 How the Components Work Together

### 1. **Subscription Button** (`components/payments/SubscriptionButton.tsx`)

This is the main "Subscribe" button users click:

```tsx
import { SubscriptionButton } from "@/components/payments/SubscriptionButton";

function MyPricingPage() {
  return (
    <SubscriptionButton 
      productId={process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID}
      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg"
    >
      Subscribe for $9.99/month
    </SubscriptionButton>
  );
}
```

**What it does**:
- When clicked, calls `/api/subscriptions/create`
- Redirects user to Polar checkout
- Handles loading states and errors

### 2. **Subscription Status Hook** (`hooks/use-subscription-status.ts`)

Check if a user is subscribed:

```tsx
import { useSubscriptionStatus } from "@/hooks/use-subscription-status";

function MyComponent() {
  const { isSubscribed, loading, subscription } = useSubscriptionStatus();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isSubscribed ? (
        <div>✅ You have premium access!</div>
      ) : (
        <div>❌ Please subscribe for premium features</div>
      )}
    </div>
  );
}
```

**What it does**:
- Automatically fetches subscription status
- Updates when subscription changes
- Provides loading and error states

### 3. **Pricing Component** (`components/payments/PricingComponent.tsx`)

A complete pricing page:

```tsx
import { PricingComponent } from "@/components/payments/PricingComponent";

function PricingPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
      <PricingComponent />
    </div>
  );
}
```

**What it shows**:
- Free vs Premium plans
- Current subscription status
- Subscribe or manage buttons

## 🔄 Understanding the Subscription Flow

Here's exactly what happens when a user subscribes:

1. **User clicks "Subscribe"**
   - `SubscriptionButton` calls `/api/subscriptions/create`
   - Server creates Polar checkout session
   - User redirected to Polar payment page

2. **User pays on Polar**
   - Polar processes payment
   - Polar sends webhook to `/api/webhooks/polar`
   - Webhook creates/updates subscription in database

3. **User returns to your app**
   - Redirected to `/subscribe/success`
   - Success page calls `/api/subscriptions/success`
   - Subscription is confirmed and active

4. **Ongoing subscription management**
   - Webhooks handle renewals, cancellations, etc.
   - Your app always has up-to-date subscription status

## 🧪 Testing Your Implementation

### Test the Setup (Development)

1. **Visit the debug page**: `http://localhost:3000/subscription-debug`
2. **Check for issues**: Click "Fetch Debug Data"
3. **Clean up duplicates**: If you have multiple subscriptions, clean them up

### Test the Polar helper page**: `http://localhost:3000/polar-test`
2. **Enter your product ID**: Use the real UUID from Polar
3. **Test checkout creation**: Should create a working checkout URL

### Test the Complete Flow

1. **Add a subscribe button to any page**:
```tsx
import { SubscriptionButton } from "@/components/payments/SubscriptionButton";

export default function TestPage() {
  return (
    <div className="p-8">
      <h1>Test Subscription</h1>
      <SubscriptionButton 
        productId={process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID}
      >
        Test Subscribe
      </SubscriptionButton>
    </div>
  );
}
```

2. **Test with Polar's test cards**:
   - Use test card numbers in sandbox mode
   - Complete the payment flow
   - Verify subscription is created

## 🔒 Security & Best Practices

### What We've Implemented

✅ **Webhook Signature Verification**: Ensures webhooks actually come from Polar
✅ **Row Level Security**: Users can only see their own subscriptions  
✅ **Service Role Authentication**: Admin operations use secure service key
✅ **Input Validation**: All API endpoints validate inputs
✅ **Error Handling**: Comprehensive error logging and user feedback
✅ **Environment Variable Security**: Sensitive keys are server-side only

### Important Security Notes

1. **Never expose service role keys**: Only use in server-side code
2. **Always validate webhooks**: The signature verification is critical
3. **Use HTTPS in production**: Required for webhooks and payments
4. **Keep keys secure**: Don't commit sensitive keys to git

## 🚨 Common Issues & Solutions

### "Product does not exist" Error
- **Problem**: Using wrong product ID
- **Solution**: Get correct UUID from Polar dashboard

### "Invalid URL" Error  
- **Problem**: `NEXT_PUBLIC_APP_URL` not set
- **Solution**: Add correct URL to `.env.local`

### "Multiple subscriptions" Error
- **Problem**: Duplicate subscription records
- **Solution**: Use debug panel to clean up duplicates

### Webhook Not Working
- **Problem**: Webhook signature verification failing
- **Solution**: Check webhook secret in environment variables

### "Unauthorized" Error
- **Problem**: User not logged in or wrong API keys
- **Solution**: Verify authentication and API keys

## 📊 Monitoring Your Subscriptions

### Using the Debug Panel

Visit `/subscription-debug` to:
- See all subscription records for a user
- Check subscription status
- Clean up duplicate records
- View error logs

### Database Monitoring

Check these tables in Supabase:
- `user_subscriptions`: All subscription data
- `payment_logs`: Webhook events and errors

### Polar Dashboard

Monitor in Polar:
- Payment events
- Subscription status changes
- Webhook delivery status
- Customer data

## 🔄 What Happens Next

After setup, your subscription system will:

1. **Automatically handle payments**: Monthly billing managed by Polar
2. **Update subscription status**: Webhooks keep your database in sync
3. **Handle cancellations**: Users can cancel, access continues until period end
4. **Manage failed payments**: Polar handles retry logic
5. **Provide customer portal**: Users can manage their subscriptions

## 🎓 Advanced Features (Future)

Once you're comfortable with the basics, you can add:
- Multiple subscription tiers
- Annual billing options
- Trial periods
- Discount codes
- Usage-based billing
- Customer portal integration

## 📞 Getting Help

If you run into issues:

1. **Check the debug panel**: `/subscription-debug`
2. **Review the logs**: Check `payment_logs` table
3. **Verify environment variables**: Ensure all keys are correct
4. **Test in sandbox**: Use Polar's sandbox mode
5. **Check webhook delivery**: Monitor in Polar dashboard

## 🎉 Congratulations!

You now have a complete subscription system! Users can subscribe, payments are processed securely, and subscriptions are managed automatically.
