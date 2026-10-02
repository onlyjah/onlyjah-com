-- Additive migration. Apply only after 005 on the explicitly selected development branch.
-- No existing person receives a grant. Billing and stewardship writes require a trusted service.
BEGIN;

CREATE TABLE public.member_entitlements (
  clerk_user_id text NOT NULL,
  feature text NOT NULL CHECK (feature IN ('personal_publish','marketplace_post','file_upload')),
  source text NOT NULL CHECK (source IN ('clerk_billing','stewardship')),
  valid_until timestamptz NOT NULL,
  source_reference text NOT NULL,
  PRIMARY KEY (clerk_user_id,feature,source)
);
ALTER TABLE public.member_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_entitlements FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.member_entitlements FROM PUBLIC,anonymous,authenticated;
GRANT SELECT ON public.member_entitlements TO authenticated;
CREATE POLICY own_entitlements ON public.member_entitlements FOR SELECT TO authenticated
  USING (clerk_user_id=public.current_member_id());

CREATE TABLE public.stewardship_duties (
  clerk_user_id text NOT NULL,
  duty text NOT NULL CHECK (duty IN ('organization_create','comment_moderate','project_steward','fulfillment_manage')),
  resource text NOT NULL,
  PRIMARY KEY (clerk_user_id,duty,resource)
);
ALTER TABLE public.stewardship_duties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stewardship_duties FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.stewardship_duties FROM PUBLIC,anonymous,authenticated;
GRANT SELECT ON public.stewardship_duties TO authenticated;
CREATE POLICY own_duties ON public.stewardship_duties FOR SELECT TO authenticated
  USING (clerk_user_id=public.current_member_id());

CREATE FUNCTION public.has_member_feature(requested text) RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT EXISTS (SELECT FROM public.member_entitlements
  WHERE clerk_user_id=public.current_member_id() AND feature=requested AND valid_until>now());
$$;
REVOKE ALL ON FUNCTION public.has_member_feature(text) FROM PUBLIC,anonymous;
GRANT EXECUTE ON FUNCTION public.has_member_feature(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.my_access() RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT jsonb_build_object(
    'user_id',public.current_member_id(),
    'drafts',public.current_member_id() IS NOT NULL,
    'personal_publish',COALESCE((SELECT personal_publish FROM public.publication_grants WHERE clerk_user_id=public.current_member_id()),false) OR public.has_member_feature('personal_publish'),
    'onlyjah_publish',COALESCE((SELECT onlyjah_publish FROM public.publication_grants WHERE clerk_user_id=public.current_member_id()),false),
    'curate',COALESCE((SELECT curate FROM public.publication_grants WHERE clerk_user_id=public.current_member_id()),false),
    'ketema',COALESCE((SELECT ketema FROM public.publication_grants WHERE clerk_user_id=public.current_member_id()),false),
    'marketplace_post',public.has_member_feature('marketplace_post'),
    'file_upload',public.has_member_feature('file_upload'),
    'organization_create',EXISTS(SELECT FROM public.stewardship_duties WHERE clerk_user_id=public.current_member_id() AND duty='organization_create' AND resource='onlyjah'),
    'comment_moderate',EXISTS(SELECT FROM public.stewardship_duties WHERE clerk_user_id=public.current_member_id() AND duty='comment_moderate' AND resource='community')
  );
$$;

ALTER TABLE public.market_listings ADD COLUMN kind text NOT NULL DEFAULT 'offering'
  CHECK (kind IN ('offering','request','swap'));
ALTER TABLE public.market_listings ADD COLUMN revision integer NOT NULL DEFAULT 1;
ALTER TABLE public.market_listings ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.market_listings ADD COLUMN artist_slug text NOT NULL DEFAULT '';
ALTER TABLE public.market_listings ADD COLUMN author_name text NOT NULL DEFAULT '';
GRANT SELECT(kind,revision,artist_slug,author_name) ON public.market_listings TO anonymous;
GRANT INSERT(kind),UPDATE(kind) ON public.market_listings TO authenticated;
-- Keep the existing explicit curator policies; contributor access is a separate path.
CREATE POLICY own_market_insert ON public.market_listings FOR INSERT TO authenticated
  WITH CHECK (owner_id=public.current_member_id() AND
    ((public.my_access()->>'curate')::boolean OR (status='draft' AND (public.my_access()->>'drafts')::boolean) OR
    (public.has_member_feature('marketplace_post') AND EXISTS(SELECT FROM public.artist_profiles WHERE owner_id=public.current_member_id()))));
CREATE POLICY own_market_update ON public.market_listings FOR UPDATE TO authenticated
  USING (owner_id=public.current_member_id())
  WITH CHECK (owner_id=public.current_member_id() AND
    (status='draft' OR (public.my_access()->>'curate')::boolean OR
    (public.has_member_feature('marketplace_post') AND EXISTS(SELECT FROM public.artist_profiles WHERE owner_id=public.current_member_id()))));

CREATE FUNCTION public.guard_market_listing() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  NEW.artist_slug:=COALESCE((SELECT slug FROM public.artist_profiles WHERE owner_id=public.current_member_id()),'');
  NEW.author_name:=COALESCE((SELECT display_name FROM public.artist_profiles WHERE owner_id=public.current_member_id()),'');
  IF TG_OP='UPDATE' THEN NEW.revision:=OLD.revision+1; NEW.updated_at:=now(); END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.guard_market_listing() FROM PUBLIC,anonymous;
CREATE TRIGGER guard_market_listing BEFORE INSERT OR UPDATE ON public.market_listings
  FOR EACH ROW EXECUTE FUNCTION public.guard_market_listing();

CREATE FUNCTION public.valid_workspace_links(urls text[]) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path='' AS $$
  SELECT cardinality(urls)<=12 AND NOT EXISTS(SELECT FROM unnest(urls) AS u
    WHERE u IS NULL OR length(u)>2048 OR u !~ '^https://[A-Za-z0-9.-]+(/[^[:space:]@]*)?$');
$$;
REVOKE ALL ON FUNCTION public.valid_workspace_links(text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.valid_workspace_links(text[]) TO authenticated;

CREATE TABLE public.forge_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id text NOT NULL DEFAULT public.current_member_id(),
  editor_ids text[] NOT NULL DEFAULT '{}' CHECK (cardinality(editor_ids)<=20),
  kind text NOT NULL CHECK (kind IN ('project','document','task','request','offering','swap')),
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 160),
  body text NOT NULL DEFAULT '' CHECK (char_length(body)<=100000),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','completed')),
  links text[] NOT NULL DEFAULT '{}' CHECK (public.valid_workspace_links(links)),
  revision integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.forge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forge_items FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.forge_items FROM PUBLIC,anonymous,authenticated;
GRANT SELECT ON public.forge_items TO authenticated;
GRANT INSERT(kind,title,body,status,links,editor_ids),UPDATE(kind,title,body,status,links,editor_ids)
  ON public.forge_items TO authenticated;
CREATE POLICY shared_items_read ON public.forge_items FOR SELECT TO authenticated
  USING (owner_id=public.current_member_id() OR public.current_member_id()=ANY(editor_ids));
CREATE POLICY own_items_insert ON public.forge_items FOR INSERT TO authenticated
  WITH CHECK (owner_id=public.current_member_id());
CREATE POLICY shared_items_update ON public.forge_items FOR UPDATE TO authenticated
  USING (owner_id=public.current_member_id() OR public.current_member_id()=ANY(editor_ids))
  WITH CHECK (owner_id=public.current_member_id() OR public.current_member_id()=ANY(editor_ids));

CREATE FUNCTION public.guard_forge_item() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF TG_OP='UPDATE' THEN
    IF OLD.owner_id<>public.current_member_id() AND NEW.editor_ids IS DISTINCT FROM OLD.editor_ids THEN
      RAISE EXCEPTION 'Only the owner can change collaborators' USING ERRCODE='42501';
    END IF;
    NEW.revision:=OLD.revision+1; NEW.updated_at:=now();
  END IF;
  RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.guard_forge_item() FROM PUBLIC,anonymous;
CREATE TRIGGER guard_forge_item BEFORE UPDATE ON public.forge_items FOR EACH ROW
  EXECUTE FUNCTION public.guard_forge_item();

GRANT DELETE ON public.community_messages TO authenticated;
CREATE POLICY scoped_comment_moderation ON public.community_messages FOR DELETE TO authenticated
  USING (room='community' AND (public.my_access()->>'comment_moderate')::boolean);

NOTIFY pgrst,'reload schema';
COMMIT;
