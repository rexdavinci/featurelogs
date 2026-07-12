create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_name text not null default ('My Startup ' || (floor(random() * 9999) + 1)::int),
  unique (user_id, project_name)
);
