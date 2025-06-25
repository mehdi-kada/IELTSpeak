-- Enhanced user_subscriptions table for Polar payments
create table if not exists user_subscriptions(
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  
  -- Polar identifiers
  polar_customer_id text not null,
  polar_subscription_id text unique, -- Make this unique
  polar_checkout_id text, -- Add checkout ID for tracking
  
  -- Product information
  polar_product_id text not null, -- Add product ID
  polar_product_type text,
  
  -- Subscription status and timing
  status text not null default 'incomplete', -- Start with incomplete
  current_period_start timestamp,
  current_period_end timestamp,
  cancel_at_period_end boolean default false,
  canceled_at timestamp,
  started_at timestamp,
  ends_at timestamp,
  
  -- Pricing information
  amount integer, -- Amount in cents
  currency text default 'usd',
  recurring_interval text default 'month',

  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Add indexes for better performance
create index if not exists idx_user_subscriptions_user_id on user_subscriptions(user_id);
create index if not exists idx_user_subscriptions_polar_customer_id on user_subscriptions(polar_customer_id);
create index if not exists idx_user_subscriptions_polar_subscription_id on user_subscriptions(polar_subscription_id);
create index if not exists idx_user_subscriptions_status on user_subscriptions(status);

-- Payment logs table for webhook debugging
create table if not exists payment_logs(
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  polar_event_id text,
  event_data jsonb,
  error_message text,
  status text not null default 'received',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Add index for payment logs
create index if not exists idx_payment_logs_polar_event_id on payment_logs(polar_event_id);
create index if not exists idx_payment_logs_status on payment_logs(status);
create index if not exists idx_payment_logs_event_type on payment_logs(event_type);

-- Function to update updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language "plpgsql";

-- Add trigger for user_subscriptions
drop trigger if exists update_updated_at_column_user_subscription on user_subscriptions;
create trigger update_updated_at_column_user_subscription
  before update on user_subscriptions
  for each row execute function update_updated_at_column();

-- Add trigger for payment_logs
drop trigger if exists update_updated_at_column_payment_logs on payment_logs;
create trigger update_updated_at_column_payment_logs
  before update on payment_logs
  for each row execute function update_updated_at_column();

-- Row Level Security (RLS) policies
alter table user_subscriptions enable row level security;
alter table payment_logs enable row level security;

-- Users can only see their own subscriptions
create policy "Users can view own subscriptions" on user_subscriptions
  for select using (auth.uid() = user_id);

-- Only service role can insert/update subscriptions (for webhooks)
create policy "Service role can manage subscriptions" on user_subscriptions
  for all using (auth.role() = 'service_role');

-- Only service role can manage payment logs
create policy "Service role can manage payment logs" on payment_logs
  for all using (auth.role() = 'service_role');
