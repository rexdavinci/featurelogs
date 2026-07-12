create policy "projects_update_own" on public.projects for update using (auth.uid() = user_id);
