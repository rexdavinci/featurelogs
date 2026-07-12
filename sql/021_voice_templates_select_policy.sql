create policy "voice_templates_select_own" on public.voice_templates for select using (auth.uid() = user_id);
