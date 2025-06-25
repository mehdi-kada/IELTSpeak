# Subscription System Setup Checklist

Use this checklist to verify your Polar subscription system is properly configured and working.

## ✅ Pre-Setup Requirements

- [ ] Next.js 13+ application running
- [ ] Supabase project created and connected
- [ ] User authentication working
- [ ] Node.js 18+ installed

## ✅ Polar Account Setup

- [ ] Polar account created at [polar.sh](https://polar.sh)
- [ ] Using sandbox environment for testing
- [ ] Email verified and account activated
- [ ] Dashboard accessible

### Product Configuration

- [ ] Product created in Polar dashboard
- [ ] Product type set to "Subscription"
- [ ] Billing interval set to "Monthly"
- [ ] Price configured (e.g., $9.99/month)
- [ ] Product ID copied (UUID format)

### API Credentials

- [ ] Access token generated (starts with `polar_pat_`)
- [ ] Organization ID obtained
- [ ] API keys are for correct environment (sandbox/production)

## ✅ Environment Variables

Create/update `.env.local` with all required variables:

```bash
# Polar Configuration
- [ ] POLAR_ACCESS_TOKEN="polar_pat_your_actual_token"
- [ ] POLAR_ORGANIZATION_ID="your_org_id"
- [ ] POLAR_SERVER="sandbox"
- [ ] POLAR_WEBHOOK_SECRET="your_random_secret"

# App Configuration
- [ ] NEXT_PUBLIC_APP_URL="http://localhost:3000"
- [ ] NEXT_PUBLIC_POLAR_PRODUCT_ID="your_product_uuid"

# Supabase (existing)
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
```

### Verification

- [ ] No placeholder values remaining
- [ ] All values are real credentials
- [ ] File saved and server restarted

## ✅ Database Setup

### Table Creation

- [ ] Opened Supabase SQL Editor
- [ ] Ran complete SQL setup script
- [ ] `user_subscriptions` table created
- [ ] `payment_logs` table created
- [ ] All indexes created successfully

### Permissions & Security

- [ ] Row Level Security (RLS) enabled
- [ ] User policies created for `user_subscriptions`
- [ ] Service role policy created for `payment_logs`
- [ ] Triggers created for `updated_at` columns

### Verification

```sql
-- Run this to verify tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_subscriptions', 'payment_logs');
```

- [ ] Both tables appear in results

## ✅ Application Setup

### Dependencies

- [ ] `@polar-sh/sdk` installed
- [ ] `@supabase/supabase-js` installed
- [ ] No package installation errors

### File Structure

Verify these files exist:

- [ ] `lib/polar-client.ts`
- [ ] `lib/subscription-helpers.ts`
- [ ] `lib/subscription-guards.ts`
- [ ] `app/api/subscriptions/create/route.ts`
- [ ] `app/api/subscriptions/status/route.ts`
- [ ] `app/api/subscriptions/cancel/route.ts`
- [ ] `app/api/webhooks/polar/route.ts`
- [ ] `components/payments/SubscriptionButton.tsx`
- [ ] `components/payments/PricingComponent.tsx`
- [ ] `hooks/use-subscription-status.ts`

## ✅ Testing Tools

### Setup Helper (`/polar-test`)

- [ ] Page loads without errors
- [ ] Environment variables show correct values
- [ ] Product ID test passes
- [ ] Test checkout creation works
- [ ] No API errors in browser console

### Debug Panel (`/subscription-debug`)

- [ ] Page loads without errors
- [ ] User authentication works
- [ ] Subscription status displays
- [ ] No database connection errors
- [ ] Debug data fetches successfully

## ✅ Component Testing

### Subscribe Button

```tsx
// Test in any page
<SubscriptionButton productId={process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID}>
  Test Subscribe
</SubscriptionButton>
```

- [ ] Button renders without errors
- [ ] Click creates checkout session
- [ ] Redirects to Polar payment page
- [ ] No console errors

### Subscription Hook

```tsx
// Test in any component
const { isSubscribed, loading, error } = useSubscriptionStatus();
```

- [ ] Hook returns without errors
- [ ] Loading state works
- [ ] Subscription status accurate
- [ ] No infinite re-renders

## ✅ Payment Flow Testing

### Test Payment

- [ ] Subscribe button clicked
- [ ] Redirected to Polar checkout
- [ ] Test card accepted: `4242 4242 4242 4242`
- [ ] Payment completed successfully
- [ ] Redirected back to success page

### Subscription Verification

- [ ] Subscription appears in debug panel
- [ ] Status shows as "active" or "trialing"
- [ ] User can access premium features
- [ ] Subscription data accurate

## ✅ Webhook Testing (Optional for Development)

### Local Development (with ngrok)

- [ ] ngrok installed and running
- [ ] HTTPS URL obtained
- [ ] Webhook configured in Polar dashboard
- [ ] Test webhook delivery successful

### Webhook Verification

- [ ] Webhook events appear in `payment_logs` table
- [ ] Signature verification passes
- [ ] Subscription status updates correctly
- [ ] No webhook processing errors

## ✅ Error Handling

### Common Scenarios

- [ ] Non-authenticated users handled gracefully
- [ ] Invalid product IDs show clear errors
- [ ] Network failures display user-friendly messages
- [ ] Duplicate subscriptions prevented/cleaned

### Error Logging

- [ ] Server errors logged appropriately
- [ ] Client errors captured in console
- [ ] Webhook errors stored in database
- [ ] No sensitive data exposed in errors

## ✅ Security Verification

### Environment Security

- [ ] Service role key not exposed to client
- [ ] API keys not committed to git
- [ ] Webhook secrets properly secured
- [ ] Production keys different from development

### Database Security

- [ ] RLS policies prevent unauthorized access
- [ ] Users can only see their own subscriptions
- [ ] Service role required for admin operations
- [ ] Input validation on all endpoints

## ✅ Production Readiness (When Ready)

### Configuration

- [ ] `POLAR_SERVER="production"`
- [ ] Production product ID configured
- [ ] Production webhook URL set
- [ ] Production domain in `NEXT_PUBLIC_APP_URL`

### Testing

- [ ] Full payment flow tested in production
- [ ] Webhook delivery verified
- [ ] Database operations working
- [ ] No development artifacts remaining

## 🎯 Final Verification

### User Experience Test

1. **As a new user**:

   - [ ] Can view pricing page
   - [ ] Can click subscribe button
   - [ ] Can complete payment
   - [ ] Gets access to premium features

2. **As a subscribed user**:

   - [ ] Can view subscription status
   - [ ] Can access premium features
   - [ ] Can cancel subscription (if implemented)
   - [ ] Subscription persists across sessions

3. **As an admin/developer**:
   - [ ] Can monitor subscriptions in debug panel
   - [ ] Can view webhook events in database
   - [ ] Can troubleshoot issues easily
   - [ ] Can add new premium features

## 🚨 Troubleshooting

If any checklist item fails:

1. **Check logs**: Browser console + server logs
2. **Verify environment**: All variables set correctly
3. **Test API endpoints**: Use debug tools
4. **Check database**: Verify table structure
5. **Review documentation**: Implementation guide has solutions

## 🎉 Success Criteria

✅ **All checklist items completed**  
✅ **End-to-end payment flow working**  
✅ **No errors in production testing**  
✅ **Documentation reviewed and understood**

**Congratulations!** Your Polar subscription system is ready for production use! 🚀

---

_Last updated: [Current Date]_  
_For detailed help, see: `docs/SUBSCRIPTION_IMPLEMENTATION_GUIDE.md`_
