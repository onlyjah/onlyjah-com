-- Private UTF-8 source intake. Development only, after 006.
BEGIN;
CREATE TABLE public.forge_sources (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_id text NOT NULL DEFAULT public.current_member_id(),
 title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 160),
 original_text text NOT NULL CHECK (octet_length(original_text) BETWEEN 1 AND 1000000),
 source_kind text NOT NULL CHECK(source_kind IN ('chat','note','document')),
 tags text[] NOT NULL DEFAULT '{}' CHECK(cardinality(tags)<=30 AND array_position(tags,NULL) IS NULL AND array_to_string(tags,',') IS NOT NULL AND char_length(array_to_string(tags,','))<=1000),
 sha256 text NOT NULL,
 stored_bytes bigint NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(owner_id,sha256)
);
ALTER TABLE public.forge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forge_sources FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.forge_sources FROM PUBLIC,anonymous,authenticated;
GRANT SELECT ON public.forge_sources TO authenticated;
GRANT INSERT(title,original_text,source_kind,tags) ON public.forge_sources TO authenticated;
CREATE POLICY private_sources_read ON public.forge_sources FOR SELECT TO authenticated USING(owner_id=public.current_member_id());
CREATE POLICY private_sources_insert ON public.forge_sources FOR INSERT TO authenticated WITH CHECK(owner_id=public.current_member_id());
CREATE FUNCTION public.guard_source_intake() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE member_id text:=public.current_member_id(); bytes_used bigint; recent_count integer; content_hash text;
BEGIN
 IF member_id IS NULL OR NEW.owner_id IS DISTINCT FROM member_id THEN RAISE EXCEPTION 'Account verification required' USING ERRCODE='42501'; END IF;
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('forge-source:'||member_id,0));
 content_hash:=encode(sha256(convert_to(NEW.original_text,'UTF8')),'hex');
 IF EXISTS(SELECT FROM public.forge_sources WHERE owner_id=member_id AND sha256=content_hash) THEN RETURN NULL; END IF;
 SELECT COALESCE(sum(stored_bytes),0),count(*) FILTER(WHERE created_at>now()-interval '1 minute') INTO bytes_used,recent_count FROM public.forge_sources WHERE owner_id=member_id;
 IF recent_count>=20 THEN RAISE EXCEPTION 'Source intake rate reached; retry in one minute' USING ERRCODE='P0001'; END IF;
 IF bytes_used+octet_length(NEW.original_text)+octet_length(NEW.title)+octet_length(array_to_string(NEW.tags,','))>500000000 THEN RAISE EXCEPTION 'Private source archive capacity reached' USING ERRCODE='P0001'; END IF;
 NEW.sha256:=content_hash;
 NEW.stored_bytes:=octet_length(NEW.original_text)::bigint+octet_length(NEW.title)+octet_length(array_to_string(NEW.tags,','));
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.guard_source_intake() FROM PUBLIC,anonymous;
CREATE TRIGGER source_intake BEFORE INSERT ON public.forge_sources FOR EACH ROW EXECUTE FUNCTION public.guard_source_intake();
CREATE FUNCTION public.archive_source(source_title text, source_text text, kind text, source_tags text[] DEFAULT '{}') RETURNS public.forge_sources LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE result public.forge_sources;
BEGIN
 INSERT INTO public.forge_sources(title,original_text,source_kind,tags) VALUES(source_title,source_text,kind,source_tags) RETURNING * INTO result;
 IF result.id IS NULL THEN SELECT * INTO result FROM public.forge_sources WHERE owner_id=public.current_member_id() AND sha256=encode(sha256(convert_to(source_text,'UTF8')),'hex'); END IF;
 RETURN result;
END; $$;
REVOKE ALL ON FUNCTION public.archive_source(text,text,text,text[]) FROM PUBLIC,anonymous;
GRANT EXECUTE ON FUNCTION public.archive_source(text,text,text,text[]) TO authenticated;
CREATE FUNCTION public.my_archive_usage() RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT jsonb_build_object('user_id',public.current_member_id(),'used_bytes',COALESCE(sum(stored_bytes),0),'limit_bytes',500000000,'source_count',count(*)) FROM public.forge_sources WHERE owner_id=public.current_member_id();
$$;
REVOKE ALL ON FUNCTION public.my_archive_usage() FROM PUBLIC,anonymous;
GRANT EXECUTE ON FUNCTION public.my_archive_usage() TO authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
