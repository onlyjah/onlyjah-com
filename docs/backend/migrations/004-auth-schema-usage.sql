-- Development repair after 001–003: member RPC SQL needs to resolve auth.user_id().
-- Function EXECUTE alone does not confer schema USAGE. No table/admin grants.
-- Apply only to the explicitly verified development branch; inspect production separately.
-- Historical attempted repair: Neon cloud_admin owns auth; neondb_owner lacks
-- grant option, so these statements gave warnings and no effective schema grant.
-- Migration 005 is the effective managed-provider repair. Do not assume success
-- from an empty SQL-tool response; inspect has_schema_privilege after grants.
BEGIN;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT EXECUTE ON FUNCTION auth.user_id() TO authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
