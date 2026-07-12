create policy "projects_select_own" on public.projects for select using (auth.uid() = user_id);
