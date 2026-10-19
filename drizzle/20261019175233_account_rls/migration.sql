-- Application connections must use the restricted login provisioned by db:secure.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'featurelogs_app') THEN
    CREATE ROLE featurelogs_app NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'featurelogs_auth') THEN
    CREATE ROLE featurelogs_auth NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
END $$;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO featurelogs_app, featurelogs_auth;
REVOKE ALL ON public.projects, public.logs, public.style_templates, public.usage_events, public.profiles,
  public.auth_users, public.auth_sessions, public.auth_password_resets FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects, public.logs, public.style_templates,
  public.usage_events, public.profiles TO featurelogs_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.auth_users, public.auth_sessions, public.auth_password_resets TO featurelogs_auth;
GRANT SELECT (id, email, email_normalized, created_at, updated_at), DELETE ON public.auth_users TO featurelogs_app;
GRANT SELECT (id, user_id, expires_at, created_at), DELETE ON public.auth_sessions TO featurelogs_app;
GRANT SELECT (email_normalized, user_id, expires_at, requested_at), DELETE ON public.auth_password_resets TO featurelogs_app;
--> statement-breakpoint
DO $$ DECLARE table_name text; owner_column text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['projects','logs','style_templates','usage_events','profiles','auth_users','auth_sessions','auth_password_resets'] LOOP
    owner_column := CASE table_name WHEN 'profiles' THEN 'uid' WHEN 'auth_users' THEN 'id' ELSE 'user_id' END;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', table_name);
    EXECUTE format('CREATE POLICY own_rows ON public.%I TO featurelogs_app USING (%I = NULLIF(current_setting(''app.user_id'', true), '''')) WITH CHECK (%I = NULLIF(current_setting(''app.user_id'', true), ''''))', table_name, owner_column, owner_column);
  END LOOP;
  FOREACH table_name IN ARRAY ARRAY['auth_users','auth_sessions','auth_password_resets'] LOOP
    EXECUTE format('CREATE POLICY auth_service ON public.%I TO featurelogs_auth USING (true) WITH CHECK (true)', table_name);
  END LOOP;
END $$;
--> statement-breakpoint
-- A reset requested before signup has a null user_id but still belongs to that email.
ALTER POLICY own_rows ON public.auth_password_resets TO featurelogs_app
  USING (user_id = NULLIF(current_setting('app.user_id', true), '') OR email_normalized IN
    (SELECT email_normalized FROM public.auth_users WHERE id = NULLIF(current_setting('app.user_id', true), '')))
  WITH CHECK (user_id = NULLIF(current_setting('app.user_id', true), ''));
--> statement-breakpoint
-- A valid owner ID alone is insufficient when writing data against another user's project.
CREATE POLICY owned_project ON public.logs AS RESTRICTIVE FOR ALL TO featurelogs_app
  USING (true) WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = NULLIF(current_setting('app.user_id', true), '')));
CREATE POLICY owned_project ON public.style_templates AS RESTRICTIVE FOR ALL TO featurelogs_app
  USING (true) WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = NULLIF(current_setting('app.user_id', true), '')));
--> statement-breakpoint
-- NOT VALID preserves legacy orphan rows but enforces new writes and cascades deletions.
ALTER TABLE public.auth_sessions ADD CONSTRAINT auth_sessions_user_fk FOREIGN KEY (user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE public.auth_password_resets ADD CONSTRAINT auth_password_resets_user_fk FOREIGN KEY (user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE NOT VALID;
--> statement-breakpoint
-- Only the pre-existing public projection is available anonymously, never raw drafts.
CREATE FUNCTION public.featurelogs_public_ranking()
RETURNS TABLE (project_id text, project_name text, count integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT l.project_id, l.project_name, count(*)::integer
  FROM public.logs l
  WHERE l.created_at >= to_char((now() - interval '30 days') AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  GROUP BY l.project_id, l.project_name
  ORDER BY count(*) DESC, l.project_name ASC
  LIMIT 100
$function$;
REVOKE ALL ON FUNCTION public.featurelogs_public_ranking() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.featurelogs_public_ranking() TO featurelogs_app;
