create policy "voice_templates_insert_own" on public.voice_templates for insert with check (auth.uid() = user_id);
