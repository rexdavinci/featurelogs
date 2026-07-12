create policy "voice_templates_update_own" on public.voice_templates for update using (auth.uid() = user_id);
