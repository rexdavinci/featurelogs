create policy "projects_insert_own" on public.projects for insert with check (auth.uid() = user_id);
