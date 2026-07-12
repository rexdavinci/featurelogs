create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
