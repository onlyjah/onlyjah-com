-- Run after attempted migration 004 and BEFORE effective migration 005.
\set ON_ERROR_STOP on
DO $$ BEGIN
 IF current_database() NOT LIKE 'onlyjah_test_%' THEN
   RAISE EXCEPTION 'Refusing a non-test database';
 END IF;
 IF has_schema_privilege('authenticated','auth','USAGE') THEN
   RAISE EXCEPTION 'Fixture hides the missing auth schema permission';
 END IF;
END $$;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','user_regression',false);
DO $$ BEGIN
 BEGIN
   PERFORM public.my_access();
   RAISE EXCEPTION 'Expected missing auth schema permission before repair';
 EXCEPTION WHEN insufficient_privilege THEN
   IF SQLERRM NOT LIKE '%permission denied for schema auth%' THEN
     RAISE EXCEPTION 'Unexpected permission failure: %',SQLERRM;
   END IF;
 END;
END $$;
RESET ROLE;
SELECT 'PASS: original live auth-schema permission failure reproduced';
