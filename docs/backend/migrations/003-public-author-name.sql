-- Development patch: public authorship uses the public artist name, not private account details.
BEGIN;
CREATE OR REPLACE FUNCTION public.guard_post() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF TG_OP='INSERT' THEN
   NEW.artist_slug := COALESCE((SELECT slug FROM public.artist_profiles WHERE owner_id=auth.user_id()),'');
   NEW.author_name := COALESCE((SELECT display_name FROM public.artist_profiles WHERE owner_id=auth.user_id()),CASE WHEN NEW.target='onlyjah' THEN 'OnlyJah' ELSE 'Resident artist' END);
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
   IF NEW.target='personal' AND NOT EXISTS(SELECT FROM public.artist_profiles WHERE owner_id=auth.user_id()) THEN
     RAISE EXCEPTION 'Create a public artist profile before publishing' USING ERRCODE='23514';
   END IF;
   NEW.artist_slug := CASE WHEN NEW.target='onlyjah' THEN 'onlyjah' ELSE (SELECT slug FROM public.artist_profiles WHERE owner_id=auth.user_id()) END;
   NEW.author_name := COALESCE((SELECT display_name FROM public.artist_profiles WHERE owner_id=auth.user_id()),CASE WHEN NEW.target='onlyjah' THEN 'OnlyJah' ELSE 'Resident artist' END);
   NEW.published_at := COALESCE(NEW.published_at,now());
 ELSE NEW.published_at := NULL; NEW.featured := false;
 END IF;
 RETURN NEW;
END; $$;
NOTIFY pgrst,'reload schema';
COMMIT;
