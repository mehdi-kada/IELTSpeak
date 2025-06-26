# LemonSqueezy Webhook Debugging Guide

## Overview

This guide helps you debug why webhooks might not be updating your database and premium status after payments are processed.

## Quick Debugging Steps

### 1. First, Check Your Setup

Visit: `your-domain.com/api/test/verify-setup`

This will show you:

- ✅ Environment variables status
- 📊 Recent subscriptions in database
- 👤 Recent user profiles
- 🗂️ Database table structure

### 2. Test Manual Webhook Processing

**Test the webhook flow manually:**

```bash
# POST to /api/test/webhook-test
{
  "userId": "your-user-id-here",
  "subscriptionId": "optional-sub-id"
}
```

This simulates what LemonSqueezy sends to your webhook and shows you exactly where the process fails.

### 3. Check Environment Variables

Visit: `your-domain.com/api/test/env-check`

Ensure these are set:

- `LEMONSQUEEZY_API_KEY`
- `LEMONSQUEEZY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Manual Database Test

**Test if database operations work:**

```bash
# POST to /api/test/verify-setup
{
  "userId": "your-user-id"
}
```

This creates a test subscription and updates premium status to verify database connectivity.

## Common Issues & Solutions

### Issue 1: Webhook Not Receiving Requests

**Symptoms:** No webhook logs in your server console

**Check:**

1. LemonSqueezy webhook URL is correct: `https://your-domain.com/api/webhooks/lemonsqueezy`
2. Webhook is enabled in LemonSqueezy dashboard
3. Your server is accessible from external requests (not localhost)

**Test:** Use webhook testing tools or LemonSqueezy's webhook test feature

### Issue 2: Invalid Signature Error

**Symptoms:** Logs show "Invalid webhook signature"

**Solutions:**

1. Verify `LEMONSQUEEZY_WEBHOOK_SECRET` matches what's in LemonSqueezy dashboard
2. Ensure no extra spaces or characters in the secret
3. Check that the secret hasn't been regenerated in LemonSqueezy

### Issue 3: No User ID in Custom Data

**Symptoms:** Logs show "No user ID found in subscription data"

**Check:**

1. Checkout creation is passing user_id in custom_data:

   ```javascript
   custom_data: {
     user_id: currentUser.id;
   }
   ```

2. User is logged in during checkout process

### Issue 4: Database Connection Issues

**Symptoms:** Subscription upsert or profile update fails

**Solutions:**

1. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
2. Check Supabase RLS policies allow service role operations
3. Ensure database tables exist with correct schema

### Issue 5: User Not Found or Profile Issues

**Symptoms:** Premium status doesn't update

**Check:**

1. User exists in profiles table
2. User ID format matches between auth and profiles
3. `is_premium` column exists and is boolean type

## Real-Time Debugging

### Step 1: Enable Detailed Logging

The webhook handler now includes timestamps and detailed logging:

```bash
# Watch your server logs while testing:
npm run dev
# or check production logs
```

### Step 2: Monitor Webhook Calls

Look for these log patterns:

```
🔔 [timestamp] Webhook received
📝 [timestamp] Webhook body length: X
🔐 [timestamp] Signature present: true
✅ [timestamp] Webhook signature verified
🎯 [timestamp] Event type: subscription_created
👤 [timestamp] Found user ID: user_xxx
💾 [timestamp] Attempting to save subscription
✅ [timestamp] Subscription updated successfully
🏆 [timestamp] Updating user premium status
✅ [timestamp] Premium status updated successfully
```

### Step 3: Use Test Endpoints

We've created several test endpoints to help debug:

1. **`/api/test/webhook-test`** - Simulate a complete webhook
2. **`/api/test/verify-setup`** - Check overall system status
3. **`/api/test/webhook-debug`** - Detailed webhook debugging info
4. **`/api/test/update-premium`** - Manually update premium status

## Testing Flow

### 1. Test Local Webhook Processing

```bash
curl -X POST https://your-domain.com/api/test/webhook-test \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-id"}'
```

### 2. Check Database State

```bash
curl https://your-domain.com/api/test/verify-setup?userId=your-user-id
```

### 3. Manual Premium Update (if needed)

```bash
curl -X POST https://your-domain.com/api/test/update-premium \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-id", "isPremium": true}'
```

## Troubleshooting Checklist

- [ ] Environment variables are set correctly
- [ ] Webhook URL is configured in LemonSqueezy dashboard
- [ ] Webhook secret matches between app and LemonSqueezy
- [ ] User ID is being passed in checkout custom_data
- [ ] Database tables (subscriptions, profiles) exist
- [ ] Supabase service role key has proper permissions
- [ ] Server logs show webhook requests being received
- [ ] Webhook signature verification passes
- [ ] User ID is found in webhook payload
- [ ] Database operations complete successfully

## Next Steps

1. **Test the webhook flow** using the test endpoints
2. **Check server logs** for detailed error messages
3. **Verify database state** using the verification endpoint
4. **Fix any issues** found in the logs
5. **Test with real payment** once manual tests pass

## Need More Help?

Check the detailed logs in your server console - they now include timestamps and step-by-step progress information that will help identify exactly where the process is failing.

The test endpoints will help you isolate whether the issue is:

- Webhook delivery (LemonSqueezy → Your server)
- Webhook processing (Signature, parsing, user ID extraction)
- Database operations (Subscription creation, premium status update)
- Environment configuration (Missing variables, wrong values)
