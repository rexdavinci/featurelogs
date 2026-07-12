create policy "logs_select_own" on public.logs for select using (auth.uid() = user_id);
