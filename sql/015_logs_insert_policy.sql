create policy "logs_insert_own" on public.logs for insert with check (auth.uid() = user_id);
