-- Run ONLY on a new disposable scratch database after migrations 001–005.
\set ON_ERROR_STOP on
DO $$ BEGIN IF current_database() NOT LIKE 'onlyjah_test_%' THEN RAISE EXCEPTION 'Refusing a non-test database'; END IF; END $$;

CREATE FUNCTION public.test_assert(value boolean, label text) RETURNS void LANGUAGE plpgsql AS $$ BEGIN IF value IS DISTINCT FROM true THEN RAISE EXCEPTION 'FAIL: %',label; END IF; END $$;
GRANT EXECUTE ON FUNCTION public.test_assert(boolean,text) TO authenticated,anonymous;
SELECT public.test_assert(NOT has_schema_privilege('authenticated','auth','USAGE'),'repair preserves managed auth schema isolation');
SELECT public.test_assert(NOT has_function_privilege('anonymous','public.current_member_id()','EXECUTE'),'guests cannot call member identity adapter');
SELECT public.test_assert(NOT (SELECT prosecdef FROM pg_proc WHERE oid='public.current_member_id()'::regprocedure),'identity adapter never elevates caller privileges');
SELECT public.test_assert(NOT has_schema_privilege('anonymous','auth','USAGE'),'repair does not grant guest auth schema access');
SELECT public.test_assert(NOT has_schema_privilege('authenticated','auth','CREATE'),'repair cannot create or replace auth functions');

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','user_alice',false);
SELECT public.test_assert((public.my_access()->>'drafts')::boolean,'members can draft');
SELECT public.test_assert(NOT (public.my_access()->>'personal_publish')::boolean,'signup has no publish grant');
SELECT public.test_assert(NOT (public.my_access()->>'ketema')::boolean,'signup has no invitation');
INSERT INTO public.member_profiles(display_name,bio) VALUES('Alice','Private bio');
INSERT INTO public.member_profiles(display_name,bio) VALUES('Alice revised','Private bio revised') ON CONFLICT(clerk_user_id) DO UPDATE SET display_name=EXCLUDED.display_name,bio=EXCLUDED.bio;
INSERT INTO public.artist_profiles(slug,display_name,bio) VALUES('alice-art','Alice','Public bio');
INSERT INTO public.posts(title,body) VALUES('Private Alice draft','Secret words');
SELECT public.test_assert((SELECT owner_id='user_alice' FROM public.posts WHERE title='Private Alice draft'),'owner comes from verified subject');
DO $$ BEGIN
 BEGIN UPDATE public.posts SET status='published'; RAISE EXCEPTION 'FAIL unauthorized publish'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN INSERT INTO public.posts(title,target) VALUES('Forged OnlyJah','onlyjah'); RAISE EXCEPTION 'FAIL org draft'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN INSERT INTO public.posts(title,owner_id) VALUES('Forged owner','user_bob'); RAISE EXCEPTION 'FAIL forged owner'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN INSERT INTO public.publication_grants(clerk_user_id,onlyjah_publish) VALUES('user_alice',true); RAISE EXCEPTION 'FAIL self grant'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN UPDATE public.artist_profiles SET slug='changed-url'; RAISE EXCEPTION 'FAIL handle rename'; EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claim.sub','user_bob',false);
SELECT public.test_assert((SELECT count(*)=0 FROM public.posts),'Bob cannot read Alice drafts');
SELECT public.test_assert((SELECT count(*)=0 FROM public.member_profiles),'Bob cannot read Alice private profile');
SELECT public.test_assert((SELECT count(*)=1 FROM public.artist_profiles),'public artist opt-in visible');
UPDATE public.posts SET body='Bob overwrite';
DO $$ BEGIN
 BEGIN INSERT INTO public.community_messages(room,body) VALUES('ketema','Intrusion'); RAISE EXCEPTION 'FAIL uninvited chat'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
INSERT INTO public.community_messages(body) VALUES('Member conversation');
RESET ROLE;
INSERT INTO public.publication_grants(clerk_user_id,personal_publish,ketema) VALUES('user_alice',true,true);
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','user_alice',false);
SELECT public.test_assert((SELECT body='Secret words' FROM public.posts),'cross-user write made no changes');
UPDATE public.posts SET status='published' WHERE title='Private Alice draft';
SELECT public.test_assert((SELECT revision=2 AND artist_slug='alice-art' AND author_name='Alice' AND published_at IS NOT NULL FROM public.posts),'published metadata derives from account and profile');
UPDATE public.posts SET body='Would overwrite' WHERE revision=1;
SELECT public.test_assert((SELECT body='Secret words' FROM public.posts),'stale revision preserves saved draft');
DO $$ BEGIN
 BEGIN INSERT INTO public.posts(title,target) VALUES('Still not OnlyJah','onlyjah'); RAISE EXCEPTION 'FAIL personal grant escalated'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN UPDATE public.posts SET featured=true; RAISE EXCEPTION 'FAIL unauthorized curation'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN INSERT INTO public.posts(title,embed_urls) VALUES('Invalid player',ARRAY['https://evil.test/player']); RAISE EXCEPTION 'FAIL embed domain'; EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN INSERT INTO public.posts(title,gallery_urls) VALUES('Credential gallery',ARRAY['https://u:p@example.test/image.jpg']); RAISE EXCEPTION 'FAIL credential URL'; EXCEPTION WHEN check_violation THEN NULL; END;
END $$;
INSERT INTO public.community_messages(room,body) VALUES('ketema','Private invited conversation');
RESET ROLE;
INSERT INTO public.publication_grants(clerk_user_id,onlyjah_publish,curate) VALUES('user_captain',true,true);
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','user_captain',false);
INSERT INTO public.posts(title,target) VALUES('OnlyJah work','onlyjah');
UPDATE public.posts SET status='published',featured=true WHERE title='OnlyJah work';
INSERT INTO public.market_listings(title,description,status) VALUES('OnlyJah listing','Public details','published');
RESET ROLE;
INSERT INTO public.ketema_perks(listing_id,details) SELECT id,'Private perk' FROM public.market_listings;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','user_bob',false);
SELECT public.test_assert((SELECT count(*)=0 FROM public.community_messages WHERE room='ketema'),'uninvited cannot read Ketema chat');
SELECT public.test_assert((SELECT count(*)=0 FROM public.ketema_perks),'uninvited cannot read perks');
SELECT set_config('request.jwt.claim.sub','user_alice',false);
SELECT public.test_assert((SELECT count(*)=1 FROM public.ketema_perks),'invited member can read perks');
RESET ROLE;
SET ROLE anonymous;
SELECT set_config('request.jwt.claim.sub','',false);
SELECT public.test_assert((SELECT count(title)=2 FROM public.posts),'public can read only publications');
SELECT public.test_assert((SELECT count(title)=1 FROM public.market_listings),'public can read OnlyJah listings');
DO $$ BEGIN
 BEGIN PERFORM bio FROM public.member_profiles; RAISE EXCEPTION 'FAIL private profile exposed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM owner_id FROM public.posts; RAISE EXCEPTION 'FAIL public owner ID exposed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM public.my_access(); RAISE EXCEPTION 'FAIL anonymous access RPC'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM body FROM public.community_messages; RAISE EXCEPTION 'FAIL anonymous chat'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SELECT 'PASS: grants, owner defaults, upsert, draft isolation, publication gates, revisions, curation, links, organization separation, Ketema and anonymous boundaries';
