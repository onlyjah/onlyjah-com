-- Additive development migration; activation status is recorded in the current handoff.
-- Prerequisites: Data API configured to verify this app's Clerk JWKS,
-- authenticated/anonymous roles, and auth.user_id() supplied by Neon.
-- Review existing schemas and grants first; do not run against production.
BEGIN;

CREATE TABLE public.member_profiles (
  clerk_user_id text PRIMARY KEY DEFAULT auth.user_id(),
  display_name text NOT NULL CHECK (char_length(btrim(display_name)) BETWEEN 1 AND 80),
  bio text NOT NULL DEFAULT '' CHECK (char_length(bio) <= 600),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_profiles FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public.member_profiles FROM PUBLIC, anonymous, authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT (clerk_user_id, display_name, bio) ON public.member_profiles TO authenticated;
GRANT INSERT (display_name, bio) ON public.member_profiles TO authenticated;
GRANT UPDATE (display_name, bio) ON public.member_profiles TO authenticated;

CREATE POLICY read_own_profile ON public.member_profiles
  FOR SELECT TO authenticated USING (clerk_user_id = auth.user_id());
CREATE POLICY create_own_profile ON public.member_profiles
  FOR INSERT TO authenticated WITH CHECK (clerk_user_id = auth.user_id());
CREATE POLICY edit_own_profile ON public.member_profiles
  FOR UPDATE TO authenticated USING (clerk_user_id = auth.user_id())
  WITH CHECK (clerk_user_id = auth.user_id());

COMMIT;
