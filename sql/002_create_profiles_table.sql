create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  is_subscribed boolean not null default false,
  stripe_customer_id text
);
