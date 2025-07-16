do $$
begin
    -- just setting up some custom types if they're not already there.
    -- these help keep things consistent, like skill levels or session types.
    if not exists (select 1 from pg_type where typname = 'proficiency_level') then
        create type public.proficiency_level as enum ('a1', 'a2', 'b1', 'b2', 'c1', 'c2');
    end if;
    if not exists (select 1 from pg_type where typname = 'session_mode') then
        create type public.session_mode as enum ('general', 'exam');
    end if;
    if not exists (select 1 from pg_type where typname = 'subscription_tier') then
        create type public.subscription_tier as enum ('free', 'pro');
    end if;
end$$;

---

-- table: profiles
-- this table stores all the basic info about our users, like their name, picture, and current settings.
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    full_name text,
    avatar_url text,
    current_level public.proficiency_level not null default 'b1',
    subscription public.subscription_tier not null default 'free',
    polar_customer_id text unique
);

comment on table public.profiles is 'holds user profiles with their public details and app settings.';

---

-- table: sessions
-- here's where we keep track of every practice session a user completes, along with their results and any feedback.
create table if not exists public.sessions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamptz not null default now(),
    mode public.session_mode not null,
    level public.proficiency_level not null,
    ielts_rating jsonb,
    toefl_rating jsonb,
    feedback text
);

comment on table public.sessions is 'records practice session details, results, and feedback.';

-- we're adding an index here to make searching for sessions by user super fast.
create index if not exists idx_sessions_user_id on public.sessions(user_id);

---

-- table: subscriptions
-- this table manages all our user subscriptions, linking up with lemon squeezy for payment stuff.
create table if not exists public.subscriptions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    lemonsqueezy_subscription_id varchar not null unique,
    lemonsqueezy_customer_id varchar not null,
    status varchar not null check (status in ('active', 'cancelled', 'expired', 'on_trial', 'paused', 'unpaid')),
    plan_name varchar not null,
    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,
    cancel_at_period_end boolean default false,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

comment on table public.subscriptions is 'handles user subscription info, connected to lemon squeezy.';

-- these indexes help us quickly look up subscriptions by user or by their lemon squeezy id.
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_lemonsqueezy_id on public.subscriptions(lemonsqueezy_subscription_id);

-- function: update_updated_at_column
-- a small helper function that automatically updates the 'updated_at' timestamp to right now.
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- trigger: update_subscriptions_updated_at
-- this trigger makes sure the 'updated_at' column gets a fresh timestamp
-- every time a subscription record is changed.
create trigger update_subscriptions_updated_at
    before update on public.subscriptions
    for each row
    execute function public.update_updated_at_column();

---

-- function: handle_new_user
-- this function automatically creates a new profile for a user as soon as they sign up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- trigger: on_auth_user_created
-- this trigger kicks in right after a new user is added to our authentication system,
-- then calls 'handle_new_user' to set up their profile.
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

---

-- turning on row level security (rls) for better data protection.
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.subscriptions enable row level security; -- also turning on rls for the new subscriptions table.

-- just cleaning up any old rls policies to avoid issues if we run this script again.
drop policy if exists "profiles - allow individual read access" on public.profiles;
drop policy if exists "profiles - allow individual update access" on public.profiles;
drop policy if exists "sessions - allow individual read access" on public.sessions;
drop policy if exists "sessions - allow individual insert access" on public.sessions;
drop policy if exists "sessions - allow individual update access" on public.sessions;
drop policy if exists "subscriptions - allow individual read access" on public.subscriptions;
drop policy if exists "subscriptions - allow individual insert access" on public.subscriptions;
drop policy if exists "subscriptions - allow individual update access" on public.subscriptions;

---

-- policies for 'profiles' table

-- 1. users can only see their own profile information.
create policy "profiles - allow individual read access"
on public.profiles for select
using (auth.uid() = id);

-- 2. users can only make changes to their own profile.
create policy "profiles - allow individual update access"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

---

-- policies for 'sessions' table

-- 1. users can only view their own past practice sessions.
create policy "sessions - allow individual read access"
on public.sessions for select
using (auth.uid() = user_id);

-- 2. users can only create new sessions for themselves.
-- the 'with check' part is super important here; it stops anyone from creating a session for another user.
create policy "sessions - allow individual insert access"
on public.sessions for insert
with check (auth.uid() = user_id);

-- 3. users can only update their own session records.
-- this is useful if they need to add more details or feedback after a session.
create policy "sessions - allow individual update access"
on public.sessions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

---

-- policies for 'subscriptions' table

-- 1. users can only see their own subscription details.
create policy "subscriptions - allow individual read access"
on public.subscriptions for select
using (auth.uid() = user_id);

-- 2. we allow new subscription records to be added for internal system use (like when a payment comes in).
-- users usually don't create these directly; it's handled by our payment provider.
create policy "subscriptions - allow individual insert access"
on public.subscriptions for insert
with check (auth.uid() = user_id); -- still making sure it's linked to a user for safety.

-- 3. we allow subscription records to be updated for internal system use (e.g., when a subscription status changes).
create policy "subscriptions - allow individual update access"
on public.subscriptions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
