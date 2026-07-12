create policy "logs_update_own" on public.logs for update using (auth.uid() = user_id);
