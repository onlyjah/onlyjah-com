-- Development-only additive migration. Apply after 001-member-profiles.sql.
-- Clerk JWT verification must be configured separately on the existing Data API.
BEGIN;

CREATE TABLE public.publication_grants (
  clerk_user_id text PRIMARY KEY,
  personal_publish boolean NOT NULL DEFAULT false,
  onlyjah_publish boolean NOT NULL DEFAULT false,
  curate boolean NOT NULL DEFAULT false,
  ketema boolean NOT NULL DEFAULT false
);
ALTER TABLE public.publication_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_grants FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.publication_grants FROM PUBLIC, anonymous, authenticated;
GRANT SELECT ON public.publication_grants TO authenticated;
CREATE POLICY own_grants ON public.publication_grants FOR SELECT TO authenticated USING (clerk_user_id = auth.user_id());

CREATE FUNCTION public.my_access() RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
 SELECT jsonb_build_object('user_id', auth.user_id(), 'drafts', auth.user_id() IS NOT NULL,
 'personal_publish', COALESCE((SELECT personal_publish FROM public.publication_grants WHERE clerk_user_id=auth.user_id()),false),
 'onlyjah_publish', COALESCE((SELECT onlyjah_publish FROM public.publication_grants WHERE clerk_user_id=auth.user_id()),false),
 'curate', COALESCE((SELECT curate FROM public.publication_grants WHERE clerk_user_id=auth.user_id()),false),
 'ketema', COALESCE((SELECT ketema FROM public.publication_grants WHERE clerk_user_id=auth.user_id()),false));
$$;
REVOKE ALL ON FUNCTION public.my_access() FROM PUBLIC, anonymous;
GRANT EXECUTE ON FUNCTION public.my_access() TO authenticated;

CREATE FUNCTION public.valid_media_urls(urls text[], gallery boolean) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path='' AS $$
 SELECT cardinality(urls) <= 12 AND NOT EXISTS (
 SELECT FROM unnest(urls) AS u WHERE u IS NULL OR length(u)>2048 OR
 CASE WHEN gallery THEN u !~* '^https://[A-Za-z0-9.-]+/[^[:space:]@]*\.(jpg|jpeg|png|webp)(\?[^[:space:]]*)?$'
 ELSE u !~ '^https://(www\.)?(youtube\.com/watch\?v=[A-Za-z0-9_-]{11}(&[^[:space:]]*)?|youtu\.be/[A-Za-z0-9_-]{11}(\?[^[:space:]]*)?|soundcloud\.com/[A-Za-z0-9_-]+/[A-Za-z0-9_-]+|open\.spotify\.com/(track|album|playlist|episode)/[A-Za-z0-9]+)(\?[^[:space:]]*)?$' END);
$$;
REVOKE ALL ON FUNCTION public.valid_media_urls(text[],boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.valid_media_urls(text[],boolean) TO authenticated;

CREATE TABLE public.artist_profiles (
 owner_id text PRIMARY KEY DEFAULT auth.user_id() NOT NULL,
 slug text UNIQUE NOT NULL CHECK(slug ~ '^[a-z0-9][a-z0-9-]{2,39}$' AND slug <> 'onlyjah'),
 display_name text NOT NULL CHECK(char_length(btrim(display_name)) BETWEEN 1 AND 80),
 bio text NOT NULL DEFAULT '' CHECK(char_length(bio)<=600),
 blog_repo text NOT NULL DEFAULT '' CHECK(blog_repo='' OR blog_repo ~ '^https://github\.com/[A-Za-z0-9_-]+/[A-Za-z0-9_.-]+/?$')
);
ALTER TABLE public.artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_profiles FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.artist_profiles FROM PUBLIC, anonymous, authenticated;
GRANT SELECT(slug,display_name,bio,blog_repo) ON public.artist_profiles TO anonymous;
GRANT SELECT ON public.artist_profiles TO authenticated;
GRANT INSERT(slug,display_name,bio,blog_repo), UPDATE(slug,display_name,bio,blog_repo) ON public.artist_profiles TO authenticated;
CREATE POLICY public_artists ON public.artist_profiles FOR SELECT TO anonymous,authenticated USING(true);
CREATE POLICY own_artist_insert ON public.artist_profiles FOR INSERT TO authenticated WITH CHECK(owner_id=auth.user_id());
CREATE POLICY own_artist_update ON public.artist_profiles FOR UPDATE TO authenticated USING(owner_id=auth.user_id()) WITH CHECK(owner_id=auth.user_id());

-- Public profile URLs are stable; renaming requires a future reviewed redirect flow.
CREATE FUNCTION public.guard_artist_slug() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN IF NEW.slug IS DISTINCT FROM OLD.slug THEN RAISE EXCEPTION 'Public handles cannot be renamed yet' USING ERRCODE='23514'; END IF; RETURN NEW; END; $$;
REVOKE ALL ON FUNCTION public.guard_artist_slug() FROM PUBLIC,anonymous;
CREATE TRIGGER guard_artist_slug BEFORE UPDATE ON public.artist_profiles FOR EACH ROW EXECUTE FUNCTION public.guard_artist_slug();

CREATE TABLE public.posts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_id text NOT NULL DEFAULT auth.user_id(),
 target text NOT NULL DEFAULT 'personal' CHECK(target IN ('personal','onlyjah')),
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
 kind text NOT NULL DEFAULT 'writing' CHECK(kind IN ('writing','music','gallery','video')),
 title text NOT NULL CHECK(char_length(btrim(title)) BETWEEN 1 AND 160),
 body text NOT NULL DEFAULT '' CHECK(char_length(body)<=100000),
 embed_urls text[] NOT NULL DEFAULT '{}' CHECK(public.valid_media_urls(embed_urls,false)),
 gallery_urls text[] NOT NULL DEFAULT '{}' CHECK(public.valid_media_urls(gallery_urls,true)),
 tags text[] NOT NULL DEFAULT '{}' CHECK(cardinality(tags)<=8 AND char_length(array_to_string(tags,','))<=240),
 artist_slug text NOT NULL DEFAULT '',
 author_name text NOT NULL DEFAULT '',
 featured boolean NOT NULL DEFAULT false,
 revision integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 published_at timestamptz
);
CREATE INDEX posts_owner_updated ON public.posts(owner_id,updated_at DESC);
CREATE INDEX posts_public_feed ON public.posts(target,kind,published_at DESC) WHERE status='published';
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.posts FROM PUBLIC, anonymous, authenticated;
GRANT SELECT(id,target,status,kind,title,body,embed_urls,gallery_urls,tags,artist_slug,author_name,featured,revision,published_at) ON public.posts TO anonymous;
GRANT SELECT ON public.posts TO authenticated;
GRANT INSERT(target,kind,title,body,embed_urls,gallery_urls,tags) ON public.posts TO authenticated;
GRANT UPDATE(target,status,kind,title,body,embed_urls,gallery_urls,tags,featured) ON public.posts TO authenticated;
CREATE POLICY public_or_own_posts ON public.posts FOR SELECT TO anonymous,authenticated USING(status='published' OR owner_id=auth.user_id());
CREATE POLICY own_drafts ON public.posts FOR INSERT TO authenticated WITH CHECK(owner_id=auth.user_id() AND status='draft' AND (target='personal' OR (public.my_access()->>'onlyjah_publish')::boolean));
CREATE POLICY own_post_updates ON public.posts FOR UPDATE TO authenticated USING(owner_id=auth.user_id()) WITH CHECK(owner_id=auth.user_id() AND (target='personal' OR (public.my_access()->>'onlyjah_publish')::boolean) AND (status='draft' OR (public.my_access()->>CASE WHEN target='onlyjah' THEN 'onlyjah_publish' ELSE 'personal_publish' END)::boolean));

CREATE FUNCTION public.guard_post() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF TG_OP='INSERT' THEN
   NEW.artist_slug := COALESCE((SELECT slug FROM public.artist_profiles WHERE owner_id=auth.user_id()),'');
   NEW.author_name := COALESCE((SELECT display_name FROM public.member_profiles WHERE clerk_user_id=auth.user_id()),'Resident artist');
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
   NEW.author_name := COALESCE((SELECT display_name FROM public.member_profiles WHERE clerk_user_id=auth.user_id()),'Resident artist');
   NEW.published_at := COALESCE(NEW.published_at,now());
 ELSE NEW.published_at := NULL; NEW.featured := false;
 END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.guard_post() FROM PUBLIC,anonymous;
GRANT EXECUTE ON FUNCTION public.guard_post() TO authenticated;
CREATE TRIGGER guard_post BEFORE INSERT OR UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.guard_post();

CREATE TABLE public.market_listings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id text NOT NULL DEFAULT auth.user_id(),
 organization text NOT NULL DEFAULT 'OnlyJah' CHECK(organization='OnlyJah'),
 title text NOT NULL CHECK(char_length(btrim(title)) BETWEEN 1 AND 160),
 description text NOT NULL CHECK(char_length(description)<=5000),
 price_label text NOT NULL DEFAULT '' CHECK(char_length(price_label)<=100),
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published'))
);
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_listings FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.market_listings FROM PUBLIC,anonymous,authenticated;
GRANT SELECT(id,organization,title,description,price_label,status) ON public.market_listings TO anonymous;
GRANT SELECT ON public.market_listings TO authenticated;
GRANT INSERT(title,description,price_label,status),UPDATE(title,description,price_label,status) ON public.market_listings TO authenticated;
CREATE POLICY public_market ON public.market_listings FOR SELECT TO anonymous,authenticated USING(status='published' OR owner_id=auth.user_id());
CREATE POLICY curator_market_insert ON public.market_listings FOR INSERT TO authenticated WITH CHECK(owner_id=auth.user_id() AND (public.my_access()->>'curate')::boolean);
CREATE POLICY curator_market_update ON public.market_listings FOR UPDATE TO authenticated USING(owner_id=auth.user_id() AND (public.my_access()->>'curate')::boolean) WITH CHECK(owner_id=auth.user_id() AND (public.my_access()->>'curate')::boolean);
-- Private perks live separately; a public row must never contain privileged fields.
CREATE TABLE public.ketema_perks (
 listing_id uuid PRIMARY KEY REFERENCES public.market_listings(id), details text NOT NULL CHECK(char_length(details)<=5000)
);
ALTER TABLE public.ketema_perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ketema_perks FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.ketema_perks FROM PUBLIC,anonymous,authenticated;
GRANT SELECT ON public.ketema_perks TO authenticated;
CREATE POLICY invited_perks ON public.ketema_perks FOR SELECT TO authenticated USING((public.my_access()->>'ketema')::boolean AND EXISTS(SELECT FROM public.market_listings WHERE id=listing_id AND status='published'));

CREATE TABLE public.community_messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id text NOT NULL DEFAULT auth.user_id(),
 room text NOT NULL DEFAULT 'community' CHECK(room IN ('community','ketema')),
 body text NOT NULL CHECK(char_length(btrim(body)) BETWEEN 1 AND 1200),
 author_name text NOT NULL DEFAULT 'Member',
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX community_room_created ON public.community_messages(room,created_at DESC);
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.community_messages FROM PUBLIC,anonymous,authenticated;
GRANT SELECT(id,room,body,author_name,created_at) ON public.community_messages TO authenticated;
GRANT INSERT(room,body) ON public.community_messages TO authenticated;
CREATE POLICY members_chat_read ON public.community_messages FOR SELECT TO authenticated USING(room='community' OR (public.my_access()->>'ketema')::boolean);
CREATE POLICY members_chat_write ON public.community_messages FOR INSERT TO authenticated WITH CHECK(owner_id=auth.user_id() AND (room='community' OR (public.my_access()->>'ketema')::boolean));

CREATE FUNCTION public.name_message() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN NEW.author_name:=COALESCE((SELECT display_name FROM public.artist_profiles WHERE owner_id=auth.user_id()),'Member'); RETURN NEW; END; $$;
REVOKE ALL ON FUNCTION public.name_message() FROM PUBLIC,anonymous;
CREATE TRIGGER name_message BEFORE INSERT ON public.community_messages FOR EACH ROW EXECUTE FUNCTION public.name_message();

-- Refresh PostgREST's table/function cache after the transaction commits.
NOTIFY pgrst,'reload schema';
COMMIT;
