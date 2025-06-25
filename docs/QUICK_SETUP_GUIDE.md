# Quick Setup Guide - Polar Subscriptions

This is a condensed version of the complete implementation guide. Use this for quick reference or if you're already familiar with the basics.

## ⚡ 5-Minute Setup

### 1. Get Polar Credentials
```bash
# Visit https://polar.sh → Create Account → Sandbox Mode
# Create Product → Copy Product ID
# Settings → API Keys → Copy Access Token & Org ID
```

### 2. Environment Variables
```bash
# Add to .env.local
POLAR_ACCESS_TOKEN="polar_pat_your_token"
POLAR_ORGANIZATION_ID="your_org_id" 
POLAR_SERVER="sandbox"
POLAR_WEBHOOK_SECRET="random_secret_string"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_POLAR_PRODUCT_ID="your_product_uuid"
```

### 3. Database Setup
```sql
-- Run in Supabase SQL Editor
-- (Copy full SQL from main guide or sql/create_subscription_tables.sql)
```

### 4. Test Setup
```bash
npm run dev
# Visit: http://localhost:3000/polar-test
# Visit: http://localhost:3000/subscription-debug
```

## 🚀 Usage Examples

### Basic Subscribe Button
```tsx
import { SubscriptionButton } from "@/components/payments/SubscriptionButton";

<SubscriptionButton productId={process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID}>
  Subscribe $9.99/month
</SubscriptionButton>
```

### Check Subscription Status
```tsx
import { useSubscriptionStatus } from "@/hooks/use-subscription-status";

function MyComponent() {
  const { isSubscribed, loading } = useSubscriptionStatus();
  return isSubscribed ? <PremiumContent /> : <UpgradePrompt />;
}
```

### Protect Pages (Server-Side)
```tsx
import { requireSubscription } from "@/lib/subscription-guards";

export default async function PremiumPage() {
  await requireSubscription(); // Redirects if not subscribed
  return <div>Premium Content</div>;
}
```

## 🔧 Quick Fixes

| Problem | Solution |
|---------|----------|
| "Product does not exist" | Check `NEXT_PUBLIC_POLAR_PRODUCT_ID` in .env.local |
| "Failed to fetch status" | Run database SQL setup |
| "Multiple rows returned" | Visit `/subscription-debug` → Clean Duplicates |
| "Unauthorized" | Check user login + `POLAR_ACCESS_TOKEN` |
| Button doesn't work | Check browser console for errors |

## 📱 Testing Tools

- **Setup Helper**: `http://localhost:3000/polar-test`
- **Debug Panel**: `http://localhost:3000/subscription-debug`
- **Test Cards**: `4242 4242 4242 4242` (Visa), `4000 0000 0000 0002` (Declined)

## 🎯 Files You Need

All these files are already created in your project:

```
lib/
├── polar-client.ts
├── subscription-helpers.ts
└── subscription-guards.ts

app/api/subscriptions/
├── create/route.ts
├── status/route.ts  
├── cancel/route.ts
└── debug/route.ts

components/payments/
├── SubscriptionButton.tsx
├── SubscriptionStatus.tsx
└── PricingComponent.tsx

hooks/
└── use-subscription-status.ts
```

## 🔒 Production Checklist

- [ ] Update `POLAR_SERVER="production"`
- [ ] Set production `NEXT_PUBLIC_APP_URL`
- [ ] Configure production webhook in Polar dashboard
- [ ] Run database setup in production Supabase
- [ ] Test end-to-end payment flow

## 📚 Need More Details?

See the complete guide: `docs/SUBSCRIPTION_IMPLEMENTATION_GUIDE.md`

## 🆘 Still Stuck?

1. Check `/subscription-debug` for detailed error info
2. Verify all environment variables are set correctly
3. Ensure you're using real Polar product UUID (not placeholder)
4. Check browser console for JavaScript errors
5. Look at server logs for API errors

That's it! Your subscription system should now be working. 🎉
