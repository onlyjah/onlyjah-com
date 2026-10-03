## Your words, your drafts

Sign in, then open [Forge](/forge). The access panel compares your signed-in Clerk account with the identity returned by the authenticated data service. A publish button is enabled only when the service returns a publishing grant. A successful login alone does not confer a grant.

Write Markdown, import a `.md` file, preview it, and save a private draft. Drafts are saved to your account in Neon when the Data API is configured; errors never report a successful save. Download Markdown before leaving if you have unsaved work. The list shows your 100 most recently updated posts. Concurrent edits use revisions; a stale editor must reload rather than overwrite a newer save.

Saving edits to a published work changes that public work. To edit privately, return it to draft first. Publish requires an explicit confirmation. Personal publication also requires a public artist profile, which you can create separately in [Account](/account). The private account introduction is not automatically copied into a public profile.

## Media and portfolios

[Media](/media) shows OnlyJah's publications and featured works. [Resident art](/media/art), [Music](/media/music) and [Videos](/media/videos) show published works; drafts are excluded by database policy. Artist profiles and publications use `/artist?name=handle` and `/media/post?id=uuid` so links work on a directory-index static host without an application server or wildcard rewrite. Newly published content loads in the browser; its text is not automatically prerendered for search engines until a publication build/ingestion process is added.

Add YouTube video, SoundCloud track, or Spotify track/album/playlist/episode links one per line. Add public HTTPS image links for a gallery. External players/images load after the reader chooses them. Raw iframe HTML, scripts and raw HTML Markdown are not rendered. Music/image files are not uploaded by this interface yet; use existing hosted media you have permission to share.

An optional public GitHub repository URL can be listed on your artist profile. The app does not clone, execute or automatically publish from it. A future importer needs explicit review and safe content processing. Markdown downloads contain the title/body; attachment metadata is available through the JSON API.

## API access from a terminal

The current API is the managed Neon Data API, shared by Forge, Media, Market and Realm. It is independent of the static host. Requests use short-lived Clerk session JWTs, with PostgreSQL privileges and row policies authorizing data. There is no browser database password, permanent frontend admin key, or anonymous draft access.

Copy a short-lived API token with the signed-in Forge access panel. Do not paste it into chat, source files or shell history. In your terminal, set the public endpoint from `VITE_NEON_DATA_API_URL` (not a Postgres URL), then read the token without echo:

```bash
export OJ_DATA_API_URL='https://YOUR-DEVELOPMENT-DATA-API/neondb/rest/v1'
read -rsp 'Short-lived Clerk token: ' OJ_SESSION_JWT
printf '\n'
# Token travels through curl configuration on stdin, not a command-line argument.
oj_request() {
  curl --silent --show-error --fail-with-body --config - "$@" <<EOF
header = "Authorization: Bearer ${OJ_SESSION_JWT}"
header = "Content-Type: application/json"
EOF
}
oj_request --request POST --data '{}' "$OJ_DATA_API_URL/rpc/my_access"
```

The token expires quickly; copy/read a fresh token when necessary. `my_access` returns the server-resolved `user_id`, draft access, personal/OnlyJah publishing grants, curation and Ketema membership. It does not grant anything. To list only your rows, use the returned ID:

```bash
export OJ_USER_ID='user_ID_RETURNED_BY_MY_ACCESS'
oj_request "$OJ_DATA_API_URL/posts?owner_id=eq.$OJ_USER_ID&status=eq.draft&select=*&order=updated_at.desc&limit=100"
oj_request "$OJ_DATA_API_URL/posts?owner_id=eq.$OJ_USER_ID&status=eq.published&select=*&order=updated_at.desc&limit=100"
```

Use `offset=100` for the next page; database policy always filters unauthorized rows. Download a draft JSON record directly:

```bash
export OJ_POST_ID='UUID_FROM_YOUR_DRAFT_INDEX'
oj_request "$OJ_DATA_API_URL/posts?id=eq.$OJ_POST_ID&select=*" --output draft.json
```

Create `draft-input.json` containing only editable fields:

```json
{
  "title": "Your title",
  "body": "Your Markdown",
  "kind": "writing",
  "target": "personal",
  "embed_urls": [],
  "gallery_urls": [],
  "tags": []
}
```

```bash
oj_request --request POST --header 'Prefer: return=representation' \
  --data-binary @draft-input.json "$OJ_DATA_API_URL/posts"
# Replace 1 below with the returned current revision.
oj_request --request PATCH --header 'Prefer: return=representation' \
  --data '{"status":"published"}' \
  "$OJ_DATA_API_URL/posts?id=eq.$OJ_POST_ID&revision=eq.1"
unset OJ_SESSION_JWT
```

Publication requires a grant even if requested through curl. Check that an update returns exactly one row; an empty array means a revision conflict or inaccessible row, not success. Never submit `owner_id`, permission flags or server timestamps. A valid token from another member cannot read or change your private drafts.

Public collections need no member sign-in, but Neon still requires a short-lived anonymous JWT. The frontend obtains it from the verified development guest-token service; this does not create a Clerk or Neon member account. In a terminal, fetch it from the public base URL in `VITE_NEON_PUBLIC_AUTH_URL`, then reuse the same `oj_request` helper with the guest token:

```bash
export OJ_PUBLIC_AUTH_URL='https://YOUR-VERIFIED-DEVELOPMENT-AUTH/neondb/auth'
OJ_SESSION_JWT=$(curl --silent --show-error --fail-with-body "$OJ_PUBLIC_AUTH_URL/token/anonymous" | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])')
oj_request "$OJ_DATA_API_URL/posts?status=eq.published&select=id,title,kind,body,artist_slug,author_name&limit=40"
oj_request "$OJ_DATA_API_URL/market_listings?status=eq.published&select=id,organization,title,description,price_label&limit=50"
unset OJ_SESSION_JWT
```

## Organizations and Ketema

Organization creation is restricted to verified designated stewards in the current testing policy. The older $7k qualification proposal is historical and superseded. Signup creates no organization or publishing privilege. OJ-Ark paid capacity is a separate proposed entitlement; it does not grant organization administration or authorship duties.

Ketema is invitation only. Its membership, private room and perks are distinct from organization payment/status, administrator duties and publishing rights. [Community](/realm/community) offers an authenticated development message board with manual refresh; production moderation, reporting, retention and rate limiting remain trusted Realm-backend work. Do not treat this as a production-ready chat service.

## Activation status

Development schema migrations 001–003 and managed-identity repair 005 are effective. Public guest reads and private-resource denials have been checked. The repaired access function succeeds as the authenticated database role. Jah's latest signed Clerk token now contains `role: authenticated`; the diagnostic reports the expected database subject and HTTP 200 for access, private profile and draft reads. Private draft capability is true; personal/OnlyJah publishing, curation and Ketema are false. One-account real member reads are verified. Save/reload and two-account live isolation remain under testing; read success alone does not prove a successful write. Payment verification, organization onboarding, binary uploads/streaming, Git-repository import, lifecycle webhooks and privileged administrator operations belong in the separate Ark backend direction. No payment, production publication or new paid service has been set up.

To diagnose development access from this source checkout, run `pnpm check:member user_YOUR_SIGNED_IN_ACCOUNT_ID` in your terminal. At its hidden prompt, copy a fresh token from Forge and paste it into the terminal. The command keeps it in memory, checks the Clerk signature/account, and reports sanitized Neon status/capabilities. It reads profiles/drafts without printing their contents and changes no records or grants. This diagnostic is pinned to the verified development API and test Clerk application; it is not a production CLI. Share only its JSON report, never the token. “Not verified” means storage could not confirm access; “not granted” means the verified service returned no publishing grant.

### Next persistence check

In signed-in Forge, create a new draft titled “Private storage check” with body “Development persistence test.” Click Save private draft, reload the page, then reopen it from the saved list. The title and body must return unchanged; report an error if they do not. This check remains pending and does not publish anything or grant rights. Test private profile save/reload and a second real account separately before inviting testers.

### Development session claim setup

In Clerk Dashboard, select the development instance with frontend domain `patient-aphid-402.clerk.accounts.dev`. Open Sessions → Customize session token. Merge this property into the existing Claims JSON and save, preserving other claims:

```json
{
  "role": "authenticated"
}
```

This is a signed session claim, not user-editable metadata, a new JWT template, or an environment variable. It selects the existing member database role; PostgreSQL row policies and separate publishing grants still authorize each operation. Never put an admin/captain role here or grant member access to anonymous callers. [Clerk session customization](https://clerk.com/docs/guides/sessions/customize-session-tokens), [PostgREST role extraction and anonymous fallback](https://postgrest.org/en/stable/references/auth.html).

After saving, use Forge's Copy short-lived API token button, which requests a fresh token rather than a cached one. On an older static build, wait at least a minute and reload first. Rerun the diagnostic: expect `databaseRoleClaim: authenticated`, a matching database subject, and `MEMBER_READ_ACCESS_VERIFIED`. Jah reported this successful result on 2 October 2026. Exit code 1 means verification failed, not that the diagnostic wrote anything. [Clerk token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).

Sources: [Neon Data API access control and anonymous JWTs](https://neon.com/docs/data-api/access-control), [custom Clerk JWT verification](https://neon.com/docs/data-api/custom-authentication-providers), [Clerk session tokens](https://clerk.com/docs/guides/sessions/session-tokens), [YouTube embeds](https://developers.google.com/youtube/player_parameters), [SoundCloud widgets](https://developers.soundcloud.com/docs/api/html5-widget), [Spotify embeds](https://developer.spotify.com/documentation/embeds/tutorials/creating-an-embed).


### Composition backups

Forge can import Markdown or `.txt` blurbs, search the loaded post list by title/text/tags, and display writing statistics. Download full draft backup preserves title, body, collection, publication target, media URLs, gallery URLs and tags as versioned JSON. Restore loads a new unsaved draft; it does not overwrite an existing post or publish it. Save explicitly to persist it. The loaded list remains limited to 100 posts. Binary uploads and paid storage remain unimplemented.
