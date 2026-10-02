-- Run ONLY in a scratch PostgreSQL database with the proposal already applied.
-- Tests use a fixture auth.user_id(); they do not verify Neon/Clerk JWT configuration.
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('test.user_id', 'user_alice', true);
INSERT INTO member_profiles (display_name, bio) VALUES ('Alice', 'Original words.');
-- Same upsert shape as the browser: the owner field is not in the payload.
INSERT INTO member_profiles (display_name, bio) VALUES ('Alice', 'Updated words.')
  ON CONFLICT (clerk_user_id) DO UPDATE SET display_name = EXCLUDED.display_name, bio = EXCLUDED.bio;
DO $$ BEGIN
  IF (SELECT bio FROM member_profiles) <> 'Updated words.' THEN RAISE EXCEPTION 'Own profile update failed'; END IF;
END $$;

SELECT set_config('test.user_id', 'user_bob', true);
DO $$ DECLARE changed text; BEGIN
  IF EXISTS (SELECT clerk_user_id FROM member_profiles WHERE clerk_user_id = 'user_alice') THEN RAISE EXCEPTION 'Another profile leaked'; END IF;
  UPDATE member_profiles SET bio = 'Stolen' WHERE clerk_user_id = 'user_alice' RETURNING clerk_user_id INTO changed;
  IF changed IS NOT NULL THEN RAISE EXCEPTION 'Cross-owner update succeeded'; END IF;
  BEGIN
    INSERT INTO member_profiles (clerk_user_id, display_name) VALUES ('user_alice', 'Impersonation');
    RAISE EXCEPTION 'Owner spoofing succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO member_profiles (display_name) VALUES (repeat('x', 81));
    RAISE EXCEPTION 'Length constraint failed';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
INSERT INTO member_profiles (display_name) VALUES ('Bob');
DO $$ BEGIN
  IF (SELECT count(clerk_user_id) FROM member_profiles) <> 1 THEN RAISE EXCEPTION 'Owner isolation failed'; END IF;
END $$;

SET LOCAL ROLE anonymous;
DO $$ BEGIN
  BEGIN
    PERFORM display_name FROM member_profiles;
    RAISE EXCEPTION 'Anonymous read succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
ROLLBACK;
