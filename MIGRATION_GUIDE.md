# LemonSqueezy to Polar Migration - COMPLETED

✅ **Migration Status: COMPLETE - LemonSqueezy fully removed**

This project has been successfully migrated from LemonSqueezy to Polar for payment processing.

## What Was Changed

### 🗑️ **Removed:**
- All LemonSqueezy API integrations (`lib/lemonsqueezy/`)
- LemonSqueezy webhook handlers (`app/api/webhooks/lemonsqueezy/`)
- `@lemonsqueezy/lemonsqueezy.js` dependency
- LemonSqueezy environment variables (except in `.env.local` - remove manually)

### ✅ **Added/Updated:**
- Polar API integrations (`lib/polar/`)
- Polar webhook handler (`app/api/webhooks/route.ts`)
- Updated all components to use Polar only
- New environment variables for Polar
- Database migration scripts

## 1. Database Migration

Run the SQL migration script in your Supabase SQL editor:

```sql
-- Add new Polar columns
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS polar_subscription_id varchar UNIQUE,
ADD COLUMN IF NOT EXISTS polar_customer_id varchar,
ADD COLUMN IF NOT EXISTS renews_at timestamp with time zone;

-- Create index for Polar subscription ID
CREATE INDEX IF NOT EXISTS idx_subscriptions_polar_id ON public.subscriptions(polar_subscription_id);

-- Update table comment
COMMENT ON TABLE public.subscriptions IS 'handles user subscription info, connected to Polar.';

-- Make LemonSqueezy columns nullable for transition
ALTER TABLE public.subscriptions 
ALTER COLUMN lemonsqueezy_subscription_id DROP NOT NULL,
ALTER COLUMN lemonsqueezy_customer_id DROP NOT NULL;
```

## 2. Environment Variables

Add these to your `.env.local`:

```env
# Polar Configuration
POLAR_ACCESS_TOKEN=polar_at_your_access_token_here
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret_here
NEXT_PUBLIC_POLAR_MONTHLY_PRODUCT_ID=your_monthly_product_id
NEXT_PUBLIC_POLAR_YEARLY_PRODUCT_ID=your_yearly_product_id
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 3. Polar Setup

1. Create a Polar account at https://polar.sh
2. Set up your products in Polar dashboard
3. Configure webhook endpoints:
   - URL: `https://your-domain.com/api/webhooks/polar`
   - Events: `checkout.created`, `subscription.created`, `subscription.updated`, `subscription.cancelled`, `subscription.expired`
4. Get your access token and webhook secret

## 4. Testing

1. Test the new Polar checkout flow
2. Test subscription cancellation
3. Test webhook events
4. Verify database updates

## 5. Component Updates

The `SubscriptionCard` component now supports both providers:
- Pass `productId` for Polar subscriptions
- Keep `variantId` for legacy LemonSqueezy support

## 6. API Endpoints

New Polar endpoints:
- `/api/subscriptions/create-polar-checkout` - Create Polar checkout
- `/api/subscriptions/cancel-polar` - Cancel Polar subscription
- `/api/webhooks/polar` - Handle Polar webhooks

## 7. Gradual Migration

The system supports both providers during transition:
1. New subscriptions use Polar
2. Existing LemonSqueezy subscriptions continue to work
3. Cancellation works for both providers

## 8. Complete Migration (Optional)

After all users have migrated, you can:
1. Remove LemonSqueezy API calls
2. Drop LemonSqueezy database columns
3. Remove LemonSqueezy environment variables

## Files Changed

- `lib/polar/` - New Polar integration
- `types/types.ts` - Updated interfaces
- `components/subscription/` - Updated components
- API routes - Updated to support both providers
- Database schema - Added Polar columns

## Rollback Plan

If needed, you can rollback by:
1. Setting `NEXT_PUBLIC_USE_POLAR=false`
2. This will force all new checkouts to use LemonSqueezy
3. Existing Polar subscriptions will continue to work
