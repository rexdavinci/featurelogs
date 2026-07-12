create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  raw_input text not null,
  output_changelog text not null,
  output_twitter text not null,
  output_linkedin text not null,
  created_at timestamptz not null default now()
);
