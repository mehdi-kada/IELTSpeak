-- Final database migration to remove LemonSqueezy columns
-- Run this AFTER migrating all existing subscriptions to Polar

-- Drop LemonSqueezy columns and indexes
ALTER TABLE public.subscriptions 
DROP COLUMN IF EXISTS lemonsqueezy_subscription_id CASCADE,
DROP COLUMN IF EXISTS lemonsqueezy_customer_id CASCADE;

-- Drop the old LemonSqueezy index
DROP INDEX IF EXISTS idx_subscriptions_lemonsqueezy_id;

-- Make Polar columns required now
ALTER TABLE public.subscriptions 
ALTER COLUMN polar_subscription_id SET NOT NULL,
ALTER COLUMN polar_customer_id SET NOT NULL;

-- Update the table comment
COMMENT ON TABLE public.subscriptions IS 'handles user subscription info, connected to Polar only.';

-- Clean up any constraint that might reference old columns
-- ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS check_subscription_provider;
