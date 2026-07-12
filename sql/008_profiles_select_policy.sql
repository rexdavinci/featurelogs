create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
