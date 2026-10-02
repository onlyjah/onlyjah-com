-- Managed-schema repair. Neon owns auth and the migration role cannot grant its USAGE.
-- SQL-standard body binds the provider function at creation, without runtime name lookup.
-- SECURITY INVOKER throughout: preserve verified JWT identity and all caller RLS/grants.
-- Migration 004's auth-schema grant was attempted but ineffective on this Neon branch.
BEGIN;
CREATE FUNCTION public.current_member_id() RETURNS text LANGUAGE sql STABLE
 SECURITY INVOKER SET search_path='' BEGIN ATOMIC
 SELECT auth.user_id();
END;
REVOKE ALL ON FUNCTION public.current_member_id() FROM PUBLIC,anonymous;
GRANT EXECUTE ON FUNCTION public.current_member_id() TO authenticated;

CREATE OR REPLACE FUNCTION public.my_access() RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
 SELECT jsonb_build_object('user_id', public.current_member_id(), 'drafts', public.current_member_id() IS NOT NULL,
 'personal_publish', COALESCE((SELECT personal_publish FROM public.publication_grants WHERE clerk_user_id=public.current_member_id()),false),
 'onlyjah_publish', COALESCE((SELECT onlyjah_publish FROM public.publication_grants WHERE clerk_user_id=public.current_member_id()),false),
 'curate', COALESCE((SELECT curate FROM public.publication_grants WHERE clerk_user_id=public.current_member_id()),false),
 'ketema', COALESCE((SELECT ketema FROM public.publication_grants WHERE clerk_user_id=public.current_member_id()),false));
$$;
REVOKE ALL ON FUNCTION public.my_access() FROM PUBLIC, anonymous;
GRANT EXECUTE ON FUNCTION public.my_access() TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_post() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF TG_OP='INSERT' THEN
   NEW.artist_slug := COALESCE((SELECT slug FROM public.artist_profiles WHERE owner_id=public.current_member_id()),'');
   NEW.author_name := COALESCE((SELECT display_name FROM public.artist_profiles WHERE owner_id=public.current_member_id()),CASE WHEN NEW.target='onlyjah' THEN 'OnlyJah' ELSE 'Resident artist' END);
 ELSE
   IF NEW.featured IS DISTINCT FROM OLD.featured AND NOT (public.my_access()->>'curate')::boolean THEN
     RAISE EXCEPTION 'Curation permission required' USING ERRCODE='42501';
   END IF;
   IF OLD.status='published' AND NEW.target IS DISTINCT FROM OLD.target THEN
     RAISE EXCEPTION 'Return to draft before changing publication identity' USING ERRCODE='42501';
   END IF;
   NEW.revision := OLD.revision+1;
   NEW.updated_at := now();
 END IF;
 IF NEW.status='published' THEN
   IF NOT (public.my_access()->>CASE WHEN NEW.target='onlyjah' THEN 'onlyjah_publish' ELSE 'personal_publish' END)::boolean THEN
     RAISE EXCEPTION 'Publication permission required' USING ERRCODE='42501';
   END IF;
   IF NEW.target='personal' AND NOT EXISTS(SELECT FROM public.artist_profiles WHERE owner_id=public.current_member_id()) THEN
     RAISE EXCEPTION 'Create a public artist profile before publishing' USING ERRCODE='23514';
   END IF;
   NEW.artist_slug := CASE WHEN NEW.target='onlyjah' THEN 'onlyjah' ELSE (SELECT slug FROM public.artist_profiles WHERE owner_id=public.current_member_id()) END;
   NEW.author_name := COALESCE((SELECT display_name FROM public.artist_profiles WHERE owner_id=public.current_member_id()),CASE WHEN NEW.target='onlyjah' THEN 'OnlyJah' ELSE 'Resident artist' END);
   NEW.published_at := COALESCE(NEW.published_at,now());
 ELSE NEW.published_at := NULL; NEW.featured := false;
 END IF;
 RETURN NEW;
END; $$;
CREATE OR REPLACE FUNCTION public.name_message() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN NEW.author_name:=COALESCE((SELECT display_name FROM public.artist_profiles WHERE owner_id=public.current_member_id()),'Member'); RETURN NEW; END; $$;
REVOKE ALL ON FUNCTION public.name_message() FROM PUBLIC,anonymous;
NOTIFY pgrst,'reload schema';
COMMIT;
