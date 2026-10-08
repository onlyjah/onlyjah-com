-- Private search only. Public dictionary exports never include these records.
CREATE INDEX IF NOT EXISTS forge_sources_dictionary_search ON public.forge_sources USING gin (to_tsvector('simple', title || ' ' || original_text));
CREATE INDEX IF NOT EXISTS forge_items_dictionary_search ON public.forge_items USING gin (to_tsvector('simple', title || ' ' || body));
CREATE OR REPLACE FUNCTION public.dictionary_references(search_text text)
RETURNS TABLE(id uuid, kind text, title text, excerpt text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public, pg_catalog AS $$
  WITH query AS (
    SELECT phraseto_tsquery('simple', search_text) AS terms
    WHERE length(trim(search_text)) BETWEEN 1 AND 100 AND public.current_member_id() IS NOT NULL
  ), matches AS (
    SELECT s.id, s.source_kind AS kind, s.title,
      ts_headline('simple', s.original_text, q.terms, 'StartSel=, StopSel=, MaxWords=35, MinWords=15') AS excerpt,
      s.created_at AS changed
    FROM public.forge_sources s CROSS JOIN query q
    WHERE to_tsvector('simple', s.title || ' ' || s.original_text) @@ q.terms
    UNION ALL
    SELECT f.id, f.kind, f.title,
      ts_headline('simple', f.body, q.terms, 'StartSel=, StopSel=, MaxWords=35, MinWords=15') AS excerpt,
      f.updated_at AS changed
    FROM public.forge_items f CROSS JOIN query q
    WHERE to_tsvector('simple', f.title || ' ' || f.body) @@ q.terms
  )
  SELECT id, kind, title, excerpt FROM matches ORDER BY changed DESC, id LIMIT 30;
$$;
REVOKE ALL ON FUNCTION public.dictionary_references(text) FROM PUBLIC, anonymous;
GRANT EXECUTE ON FUNCTION public.dictionary_references(text) TO authenticated;
