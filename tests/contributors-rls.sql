-- Disposable database only, after 006 and the original authoring fixtures.
\set ON_ERROR_STOP on
DO $$ BEGIN IF current_database() NOT LIKE 'onlyjah_test_%' THEN RAISE EXCEPTION 'Refusing a non-test database'; END IF; END $$;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','user_bob',false);
SELECT public.test_assert(NOT (public.my_access()->>'marketplace_post')::boolean,'signup has no market publication right');
SELECT public.test_assert(NOT (public.my_access()->>'organization_create')::boolean,'signup cannot create an organization');
INSERT INTO public.market_listings(title,description) VALUES('Bob draft offering','Private');
DO $$ BEGIN
  BEGIN UPDATE public.market_listings SET status='published' WHERE title='Bob draft offering'; RAISE EXCEPTION 'FAIL free market publication'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.member_entitlements VALUES('user_bob','marketplace_post','clerk_billing',now()+interval '1 day','forged'); RAISE EXCEPTION 'FAIL self billing'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.stewardship_duties VALUES('user_bob','organization_create','onlyjah'); RAISE EXCEPTION 'FAIL self duty'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
INSERT INTO public.forge_items(kind,title,body,editor_ids) VALUES('document','Alice and Bob document','Original',ARRAY['user_alice']);
RESET ROLE;
INSERT INTO public.member_entitlements VALUES('user_bob','marketplace_post','clerk_billing',now()+interval '1 day','fixture_verified_subscription');
INSERT INTO public.stewardship_duties VALUES('user_moderator','comment_moderate','community');
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','user_alice',false);
UPDATE public.forge_items SET body='Collaborator edit' WHERE title='Alice and Bob document' AND revision=1;
SELECT public.test_assert((SELECT revision=2 AND body='Collaborator edit' FROM public.forge_items WHERE title='Alice and Bob document'),'scoped collaborator can edit with revision');
DO $$ BEGIN
  BEGIN UPDATE public.forge_items SET editor_ids=ARRAY['user_alice','user_intruder']; RAISE EXCEPTION 'FAIL collaborator delegation'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN INSERT INTO public.forge_items(kind,title,links) VALUES('document','Unsafe link',ARRAY['javascript:alert(1)']); RAISE EXCEPTION 'FAIL unsafe links'; EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claim.sub','user_intruder',false);
SELECT public.test_assert((SELECT count(*)=0 FROM public.forge_items),'unshared account cannot read shared item');
UPDATE public.forge_items SET body='Forged edit';
SELECT set_config('request.jwt.claim.sub','user_bob',false);
SELECT public.test_assert((SELECT body='Collaborator edit' FROM public.forge_items WHERE title='Alice and Bob document'),'unshared writes made no changes');
INSERT INTO public.artist_profiles(slug,display_name) VALUES('bob-art','Bob public');
UPDATE public.market_listings SET status='published' WHERE title='Bob draft offering' AND revision=1;
SELECT public.test_assert((SELECT revision=2 AND artist_slug='bob-art' AND author_name='Bob public' FROM public.market_listings WHERE title='Bob draft offering'),'paid feature allows own listing, derived public attribution');
SELECT public.test_assert(NOT (public.my_access()->>'onlyjah_publish')::boolean,'paid market feature is not OnlyJah publication');
SELECT public.test_assert(NOT (public.my_access()->>'organization_create')::boolean,'paid market feature is not organization creation');
SELECT public.test_assert(NOT (public.my_access()->>'personal_publish')::boolean,'paid market feature does not imply another paid feature');
RESET ROLE;
UPDATE public.member_entitlements SET valid_until=now()-interval '1 second' WHERE clerk_user_id='user_bob';
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','user_bob',false);
SELECT public.test_assert(NOT (public.my_access()->>'marketplace_post')::boolean,'expired subscription loses publication access');
DO $$ BEGIN
  BEGIN UPDATE public.market_listings SET description='Edit while expired' WHERE title='Bob draft offering'; RAISE EXCEPTION 'FAIL expired edit publication'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
UPDATE public.market_listings SET status='draft' WHERE title='Bob draft offering';
SELECT public.test_assert((SELECT status='draft' FROM public.market_listings WHERE title='Bob draft offering'),'expired contributor can withdraw own listing');
SELECT set_config('request.jwt.claim.sub','user_moderator',false);
SELECT public.test_assert((public.my_access()->>'comment_moderate')::boolean,'comment duty works independently from billing');
SELECT public.test_assert(NOT (public.my_access()->>'onlyjah_publish')::boolean,'moderation is not publishing');
DELETE FROM public.community_messages WHERE room='community';
SELECT public.test_assert((SELECT count(*)=0 FROM public.community_messages WHERE room='community'),'moderator can remove community messages');
DELETE FROM public.community_messages WHERE room='ketema';
DO $$ BEGIN
  BEGIN DELETE FROM public.posts; RAISE EXCEPTION 'FAIL moderator deletes blog'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SELECT public.test_assert((SELECT count(*)=1 FROM public.community_messages WHERE room='ketema'),'moderator cannot delete private invited room');
SET ROLE anonymous;
DO $$ BEGIN
  BEGIN PERFORM body FROM public.forge_items; RAISE EXCEPTION 'FAIL public shared documents'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN PERFORM feature FROM public.member_entitlements; RAISE EXCEPTION 'FAIL public billing entitlements'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SELECT 'PASS: separate paid features, expiry, own marketplace drafts, collaborator scope, revision guards, moderation scope and private grants';
