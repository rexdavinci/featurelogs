create index if not exists logs_user_created_at_idx on public.logs (user_id, created_at desc);
