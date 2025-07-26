-- table for profiles
create table public.profiles (
  id uuid not null,
  created_at timestamp with time zone not null default now(),
  full_name text null,
  avatar_url text null,
  is_premium boolean null default false,
  name text null,
  age integer null,
  gender character varying(10) null,
  hometown text null,
  country character varying(100) null,
  occupation character varying(100) null,
  education_level character varying(100) null,
  favorite_subject text null,
  hobbies text[] null,
  travel_experience text null,
  favorite_food text null,
  life_goal text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_age_check check (
    (
      (age >= 10)
      and (age <= 100)
    )
  ),
  constraint profiles_gender_check check (
    (
      (gender)::text = any (
        (
          array[
            'Male'::character varying,
            'Female'::character varying,
            'Other'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;


-- table for the sessions : 
create table public.sessions (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  created_at timestamp with time zone not null default now(),
  level public.bands not null,
  ielts_rating jsonb null,
  feedback jsonb null,
  constraint sessions_pkey primary key (id),
  constraint sessions_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_sessions_user_id on public.sessions using btree (user_id) TABLESPACE pg_default;



-- table for the subscriptions : 
create table public.subscriptions (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  status character varying not null,
  plan_name character varying not null,
  current_period_start timestamp with time zone null,
  current_period_end timestamp with time zone null,
  cancel_at_period_end boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  renews_at timestamp with time zone null,
  polar_subscription_id character varying null,
  polar_customer_id character varying null,
  constraint subscriptions_pkey primary key (id),
  constraint subscriptions_polar_subscription_id_key unique (polar_subscription_id),
  constraint subscriptions_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint subscriptions_status_check check (
    (
      (status)::text = any (
        (
          array[
            'active'::character varying,
            'cancelled'::character varying,
            'expired'::character varying,
            'on_trial'::character varying,
            'paused'::character varying,
            'unpaid'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_polar_id on public.subscriptions using btree (polar_subscription_id) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_user_id on public.subscriptions using btree (user_id) TABLESPACE pg_default;

create trigger update_subscriptions_updated_at BEFORE
update on subscriptions for EACH row
execute FUNCTION update_updated_at_column ();



-- activate rls policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;



CREATE POLICY "Profiles - Allow individual read access"
ON public.profiles FOR SELECT
USING (auth.uid() = id);


CREATE POLICY "Profiles - Allow individual update access"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

.
CREATE POLICY "Sessions - Allow individual read access"
ON public.sessions FOR SELECT
USING (auth.uid() = user_id);


CREATE POLICY "Sessions - Allow individual insert access"
ON public.sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);


CREATE POLICY "Sessions - Allow individual update access"
ON public.sessions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- no rls for the subscriptoin table 

-- function to add a profile row for each user that signs in
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

