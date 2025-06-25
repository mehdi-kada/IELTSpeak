-- Create the user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Polar identifiers
  polar_customer_id TEXT NOT NULL,
  polar_subscription_id TEXT UNIQUE, -- Make this unique
  polar_checkout_id TEXT, -- Add checkout ID for tracking
  
  -- Product information
  polar_product_id TEXT NOT NULL, -- Add product ID
  polar_product_type TEXT,
  
  -- Subscription status and timing
  status TEXT NOT NULL DEFAULT 'incomplete', -- Start with incomplete
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

-- Create or replace the trigger function for updating updated_at
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

-- Create payment_logs table if it doesn't exist (for webhook logging)
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

-- Enable RLS (Row Level Security) if needed
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policy for payment_logs (admin only)
CREATE POLICY "Only service role can access payment logs" ON payment_logs
  FOR ALL USING (auth.role() = 'service_role');
