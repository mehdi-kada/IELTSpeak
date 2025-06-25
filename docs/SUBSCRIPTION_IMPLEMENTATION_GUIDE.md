# Complete Polar Subscription Implementation Guide

A comprehensive, beginner-friendly guide for implementing a robust monthly subscription system using Polar payments in your Next.js application.

## 📚 Table of Contents

1. [Quick Start](#-quick-start)
2. [Prerequisites](#-prerequisites)
3. [Step-by-Step Setup](#-step-by-step-setup)
4. [File Structure Overview](#-file-structure-overview)
5. [Component Usage](#-component-usage)
6. [Testing & Debugging](#-testing--debugging)
7. [Troubleshooting](#-troubleshooting)
8. [Security & Best Practices](#-security--best-practices)
9. [Production Deployment](#-production-deployment)
10. [Advanced Features](#-advanced-features)

## 🚀 Quick Start

**Already have everything set up?** Jump to:

- [Testing Tools](#testing-tools): `/subscription-debug` and `/polar-test`
- [Component Usage](#-component-usage): How to use the subscription system
- [Troubleshooting](#-troubleshooting): Fix common issues

## 📋 Prerequisites

Before starting, ensure you have:

✅ **Next.js 13+ application** (you already have this)  
✅ **Supabase account and project** with authentication set up  
✅ **Polar account** (sign up at [polar.sh](https://polar.sh))  
✅ **Basic React/Next.js knowledge**  
✅ **Node.js 18+** installed

## 🛠 Step-by-Step Setup

### Step 1: Create Polar Account & Product

#### 1.1 Sign Up for Polar

1. Go to [polar.sh](https://polar.sh) and create an account
2. **Important**: Use the **sandbox environment** for testing
3. Verify your email and complete account setup

#### 1.2 Create Your Product

1. In Polar dashboard, navigate to **Products**
2. Click **"Create Product"**
3. Configure your subscription:
   ```
   Product Type: Subscription
   Name: Premium Subscription
   Description: Monthly access to premium features
   Price: $9.99
   Billing Interval: Monthly
   ```
4. **Copy the Product ID** (UUID format: `123e4567-e89b-12d3-a456-426614174000`)

#### 1.3 Get API Credentials

1. Go to **Settings → API Keys**
2. Copy your **Access Token** (starts with `polar_pat_`)
3. Copy your **Organization ID** (found in dashboard URL or settings)

### Step 2: Environment Variables Setup

Create or update your `.env.local` file:

```bash
# === POLAR CONFIGURATION ===
# Get these from your Polar dashboard
POLAR_ACCESS_TOKEN="polar_pat_your_actual_token_here"
POLAR_ORGANIZATION_ID="your_org_id_from_polar"
POLAR_SERVER="sandbox"  # Use "production" when ready to go live

# Your product ID from Step 1.2
NEXT_PUBLIC_POLAR_PRODUCT_ID="your_actual_product_uuid"

# Create a random secret for webhook security
POLAR_WEBHOOK_SECRET="your_webhook_secret_create_random_string"

# === APP CONFIGURATION ===
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Your app URL

# === YOUR EXISTING SUPABASE VARIABLES (keep these) ===
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
```

⚠️ **Important**: Replace ALL placeholder values with actual keys!

### Step 3: Database Setup

#### 3.1 Create Tables in Supabase

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor** → **New Query**
3. Copy and paste this entire SQL script:

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

-- Create payment_logs table (for debugging and monitoring)
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  polar_event_id TEXT,
  event_data JSONB,
  error_message TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  created_at TIMESTAMP DEFAULT now()
);

-- Add indexes for payment logs
CREATE INDEX IF NOT EXISTS idx_payment_logs_polar_event_id ON payment_logs(polar_event_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_status ON payment_logs(status);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policy for payment_logs (admin/service role only)
CREATE POLICY "Only service role can access payment logs" ON payment_logs
  FOR ALL USING (auth.role() = 'service_role');
```

4. Click **"Run"** to execute the script
5. Verify tables were created in the **Table Editor**

### Step 4: Install Dependencies

The required packages are already installed in your project:

```bash
# These are already in your package.json
@polar-sh/sdk
@supabase/supabase-js
```

### Step 5: Webhook Setup (For Production)

#### 5.1 For Local Development

1. Install ngrok: `npm install -g ngrok`
2. In a new terminal: `ngrok http 3000`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

#### 5.2 Configure Webhook in Polar

1. Go to **Polar Dashboard → Settings → Webhooks**
2. Click **"Add Endpoint"**
3. Configure:
   ```
   URL: https://your-domain.com/api/webhooks/polar
   Format: Raw
   Secret: Your random secret from .env.local
   Events: Select ALL subscription events
   ```

### Step 6: Restart Your Application

```bash
# Stop your dev server (Ctrl+C) and restart
npm run dev
```

## 📁 File Structure Overview

Here's what the implementation includes:

```
lib/
├── polar-client.ts              # 🔌 Polar API client & webhook verification
├── subscription-helpers.ts     # 🛠️ Helper functions for subscription logic
└── subscription-guards.ts      # 🔒 Server-side protection middleware

app/api/subscriptions/
├── create/route.ts             # 🛒 Creates Polar checkout sessions
├── status/route.ts             # 📊 Returns user subscription status
├── cancel/route.ts             # ❌ Cancels user subscriptions
├── success/route.ts            # ✅ Handles post-payment confirmation
└── debug/route.ts              # 🐛 Debug endpoint for troubleshooting

app/api/webhooks/
└── polar/route.ts              # 📡 Receives real-time updates from Polar

components/payments/
├── SubscriptionButton.tsx      # 🔘 Main subscribe button component
├── SubscriptionStatus.tsx      # 📋 Shows current subscription info
└── PricingComponent.tsx        # 💰 Complete pricing page component

components/debug/
├── PolarSetupHelper.tsx        # 🆘 Interactive setup helper
├── SubscriptionDebugPanel.tsx  # 🔍 Debug panel for troubleshooting
└── SubscriptionDebug.tsx       # 🧪 Debug wrapper component

hooks/
└── use-subscription-status.ts  # 🎣 React hook for subscription state

app/
├── subscription-debug/         # 🔧 Debug page for troubleshooting
├── polar-test/                # 🧪 Setup testing page
└── subscribe/
    ├── success/               # 🎉 Post-payment success page
    └── page.tsx              # 💳 Main subscription/pricing page
```

## 🧩 Component Usage

### Basic Subscribe Button

```tsx
import { SubscriptionButton } from "@/components/payments/SubscriptionButton";

function MyPage() {
  return (
    <SubscriptionButton
      productId={process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg"
    >
      Subscribe for $9.99/month
    </SubscriptionButton>
  );
}
```

### Check Subscription Status

```tsx
import { useSubscriptionStatus } from "@/hooks/use-subscription-status";

function PremiumFeature() {
  const { isSubscribed, loading, subscription } = useSubscriptionStatus();

  if (loading) return <div>Loading...</div>;

  if (!isSubscribed) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <h3 className="text-xl font-bold mb-4">Premium Feature</h3>
        <p className="mb-4">Subscribe to access this feature.</p>
        <SubscriptionButton
          productId={process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID}
        >
          Subscribe Now
        </SubscriptionButton>
      </div>
    );
  }

  return (
    <div>
      <h3>Welcome to Premium!</h3>
      <p>You have access until: {subscription?.current_period_end}</p>
      {/* Your premium feature content */}
    </div>
  );
}
```

### Complete Pricing Page

```tsx
import { PricingComponent } from "@/components/payments/PricingComponent";

export default function PricingPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
      <PricingComponent />
    </div>
  );
}
```

### Server-Side Protection

```tsx
import { requireSubscription } from "@/lib/subscription-guards";

export default async function PremiumPage() {
  // This will redirect non-subscribers to /subscribe
  const user = await requireSubscription();

  return (
    <div>
      <h1>Premium Content</h1>
      <p>Welcome {user.email}! You have premium access.</p>
    </div>
  );
}
```

## 🧪 Testing & Debugging

### Testing Tools

#### 1. Debug Panel: `/subscription-debug`

- View all subscription records for the current user
- Check for duplicate subscriptions
- Clean up old/duplicate records
- View detailed error information
- Monitor webhook events

#### 2. Polar Setup Helper: `/polar-test`

- Test your Polar API connection
- Verify environment variables
- Test product ID validity
- Create test checkout sessions
- Get step-by-step setup guidance

### Manual Testing Steps

1. **Environment Verification**:

   ```bash
   # Check all environment variables are set
   npm run dev
   # Visit: http://localhost:3000/polar-test
   ```

2. **Database Verification**:

   ```bash
   # Visit: http://localhost:3000/subscription-debug
   # Should show no errors and current subscription status
   ```

3. **Subscription Flow Test**:
   ```bash
   # 1. Click subscribe button
   # 2. Complete payment with test card
   # 3. Verify redirect to success page
   # 4. Check subscription status updates
   ```

### Test Payment Cards (Sandbox)

Use these test cards in Polar sandbox:

```
Successful Payment: 4242 4242 4242 4242
Declined Payment: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
Any future expiry date (e.g., 12/25)
Any 3-digit CVC
```

## 🔧 Troubleshooting

### Common Error Messages & Solutions

| Error                                 | Cause                                | Solution                              |
| ------------------------------------- | ------------------------------------ | ------------------------------------- |
| "Failed to fetch subscription status" | Database table missing               | Run the SQL setup script              |
| "Product does not exist"              | Wrong product ID                     | Get correct UUID from Polar dashboard |
| "Input should be a valid URL"         | Missing `NEXT_PUBLIC_APP_URL`        | Add correct URL to `.env.local`       |
| "Multiple rows returned"              | Duplicate subscriptions              | Use debug panel to clean up           |
| "Unauthorized"                        | User not logged in or wrong API keys | Check authentication and API keys     |
| "Invalid signature"                   | Wrong webhook secret                 | Check `POLAR_WEBHOOK_SECRET`          |

### Detailed Troubleshooting Steps

#### 1. Database Issues

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_subscriptions', 'payment_logs');

-- Check for duplicate subscriptions
SELECT user_id, COUNT(*) as count
FROM user_subscriptions
WHERE status IN ('active', 'trialing')
GROUP BY user_id
HAVING COUNT(*) > 1;
```

#### 2. Environment Variable Issues

```bash
# Create .env.example for reference
echo "POLAR_ACCESS_TOKEN=polar_pat_your_token
POLAR_WEBHOOK_SECRET=your_webhook_secret
POLAR_ORGANIZATION_ID=your_org_id
POLAR_SERVER=sandbox
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_POLAR_PRODUCT_ID=your_product_uuid" > .env.example
```

#### 3. Webhook Issues

- **Local Development**: Use ngrok to expose localhost
- **Production**: Ensure HTTPS and correct webhook URL
- **Verification**: Check `payment_logs` table for webhook events

### Debug Checklist

✅ **Environment Setup**

- [ ] All environment variables set with real values
- [ ] No placeholder values remaining
- [ ] Development server restarted after env changes

✅ **Database Setup**

- [ ] `user_subscriptions` table exists
- [ ] `payment_logs` table exists
- [ ] RLS policies enabled
- [ ] No duplicate subscription records

✅ **Polar Configuration**

- [ ] Sandbox account verified
- [ ] Product created with monthly billing
- [ ] Correct product ID copied
- [ ] API keys generated and added
- [ ] Webhook endpoint configured (production)

✅ **Testing**

- [ ] Debug panel shows no errors
- [ ] Polar test helper works
- [ ] Subscribe button creates checkout URL
- [ ] Payment flow completes successfully

## 🔒 Security & Best Practices

### What's Implemented

✅ **Webhook Signature Verification**: All webhooks verified with HMAC-SHA256  
✅ **Row Level Security**: Users only see their own data  
✅ **Service Role Authentication**: Admin operations use secure service key  
✅ **Input Validation**: All API endpoints validate inputs  
✅ **Error Handling**: Comprehensive logging and user feedback  
✅ **Environment Security**: Sensitive keys are server-side only

### Security Guidelines

1. **Never expose service role keys**: Only use in server-side code
2. **Always verify webhooks**: Signature verification is critical
3. **Use HTTPS in production**: Required for webhooks and payments
4. **Keep keys secure**: Don't commit sensitive keys to git
5. **Regular monitoring**: Check logs and subscription status regularly

### Production Security Checklist

- [ ] Environment variables moved to secure hosting environment
- [ ] HTTPS enabled for all endpoints
- [ ] Webhook secret rotated from development
- [ ] Database backup strategy in place
- [ ] Error monitoring set up (e.g., Sentry)
- [ ] Rate limiting enabled on API endpoints

## 🚀 Production Deployment

### 1. Environment Variables

Update your production environment with:

```bash
# Production Polar settings
POLAR_SERVER="production"
POLAR_ACCESS_TOKEN="polar_pat_production_token"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Keep other variables the same
NEXT_PUBLIC_POLAR_PRODUCT_ID="your_production_product_id"
```

### 2. Webhook Configuration

1. Update webhook URL in Polar dashboard to your production domain
2. Rotate webhook secret for production
3. Test webhook delivery in production environment

### 3. Database Migration

1. Run the same SQL setup script in your production Supabase
2. Verify RLS policies are enabled
3. Test subscription creation in production

### 4. Monitoring Setup

```typescript
// Add to your error monitoring (e.g., Sentry)
import * as Sentry from "@sentry/nextjs";

// In your API routes
try {
  // subscription logic
} catch (error) {
  Sentry.captureException(error);
  console.error("Subscription error:", error);
}
```

## 🎓 Advanced Features

Once your basic subscription system is working, you can add:

### Multiple Subscription Tiers

```typescript
// Create different products in Polar for each tier
const subscriptionTiers = [
  {
    name: "Basic",
    productId: "basic-product-id",
    price: "$4.99/month",
  },
  {
    name: "Premium",
    productId: "premium-product-id",
    price: "$9.99/month",
  },
  {
    name: "Pro",
    productId: "pro-product-id",
    price: "$19.99/month",
  },
];
```

### Annual Billing

```typescript
// Create annual products in Polar
const annualProduct = {
  name: "Premium Annual",
  productId: "premium-annual-id",
  price: "$99.99/year",
  savings: "Save 17%",
};
```

### Usage-Based Features

```typescript
// Track feature usage
async function trackFeatureUsage(userId: string, feature: string) {
  const { data: subscription } = await getUserSubscription(userId);

  if (!subscription || subscription.status !== "active") {
    throw new Error("Active subscription required");
  }

  // Log usage, check limits, etc.
}
```

### Customer Portal Integration

```typescript
// Add customer management portal
async function createCustomerPortalSession(userId: string) {
  const { data: subscription } = await getUserSubscription(userId);

  // Use Polar's customer portal API
  const portalSession = await polar.customers.createPortalSession({
    customerId: subscription.polar_customer_id,
  });

  return portalSession.url;
}
```

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **Subscription Metrics**:

   - Monthly Recurring Revenue (MRR)
   - Churn rate
   - Customer lifetime value
   - Conversion rate

2. **Technical Metrics**:
   - Webhook delivery success rate
   - API response times
   - Error rates
   - Payment success rate

### Implementation Example

```typescript
// Create analytics dashboard
async function getSubscriptionAnalytics() {
  const supabase = await createAdminClient();

  const { data: metrics } = await supabase.from("user_subscriptions").select(`
      status,
      amount,
      created_at,
      current_period_end
    `);

  return {
    totalSubscribers: metrics?.filter((s) => s.status === "active").length,
    mrr: calculateMRR(metrics),
    churnRate: calculateChurnRate(metrics),
    // ... other metrics
  };
}
```

## 🎉 Congratulations!

You now have a complete, production-ready subscription system with:

- ✅ Secure payment processing
- ✅ Automatic subscription management
- ✅ Real-time webhook handling
- ✅ Comprehensive error handling
- ✅ User-friendly interfaces
- ✅ Debug and monitoring tools
- ✅ Production deployment guide

### What's Next?

1. **Test thoroughly** using the provided debug tools
2. **Monitor subscription metrics** using the analytics dashboard
3. **Add premium features** to your application
4. **Scale up** with advanced features as needed

### Need Help?

- 🔍 **Debug Tools**: `/subscription-debug` and `/polar-test`
- 📖 **Documentation**: This guide covers 99% of use cases
- 🐛 **Issues**: Check the troubleshooting section
- 💬 **Community**: Polar Discord or GitHub discussions

Your subscription system is now ready for production! 🚀
