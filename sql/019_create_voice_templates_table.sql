create table if not exists public.voice_templates (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb not null,
  updated_at timestamptz not null default now()
);
