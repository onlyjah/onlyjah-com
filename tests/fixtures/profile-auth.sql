-- Scratch-database fixture only. Neon supplies the real auth function and roles.
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE anonymous NOLOGIN;
CREATE SCHEMA auth;
CREATE FUNCTION auth.user_id() RETURNS text LANGUAGE sql STABLE
  AS $$ SELECT current_setting('test.user_id', true) $$;
GRANT USAGE ON SCHEMA auth TO authenticated;
