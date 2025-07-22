-- Migration script to update subscriptions table for Polar
-- This should be run in your Supabase SQL editor

-- Add new Polar columns
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS polar_subscription_id varchar UNIQUE,
ADD COLUMN IF NOT EXISTS polar_customer_id varchar,
ADD COLUMN IF NOT EXISTS renews_at timestamp with time zone;

-- Create index for Polar subscription ID
CREATE INDEX IF NOT EXISTS idx_subscriptions_polar_id ON public.subscriptions(polar_subscription_id);

-- Update the table comment
COMMENT ON TABLE public.subscriptions IS 'handles user subscription info, connected to Polar.';

-- For migration: you can choose to either:
-- 1. Keep both LemonSqueezy and Polar columns during transition
-- 2. Or drop LemonSqueezy columns after full migration

-- Option 1: Keep both (recommended during transition)
-- ALTER TABLE public.subscriptions 
-- ALTER COLUMN lemonsqueezy_subscription_id DROP NOT NULL,
-- ALTER COLUMN lemonsqueezy_customer_id DROP NOT NULL;

-- Option 2: Drop LemonSqueezy columns (after full migration)
-- ALTER TABLE public.subscriptions 
-- DROP COLUMN IF EXISTS lemonsqueezy_subscription_id,
-- DROP COLUMN IF EXISTS lemonsqueezy_customer_id;
-- DROP INDEX IF EXISTS idx_subscriptions_lemonsqueezy_id;

-- Add constraint to ensure either LemonSqueezy or Polar ID exists
-- ALTER TABLE public.subscriptions 
-- ADD CONSTRAINT check_subscription_provider 
-- CHECK (
--     (lemonsqueezy_subscription_id IS NOT NULL) OR 
--     (polar_subscription_id IS NOT NULL)
-- );
