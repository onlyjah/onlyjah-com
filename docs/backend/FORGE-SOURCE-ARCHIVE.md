# Private source archive: development slice

Forge now offers private original-text intake alongside its existing draft editor. Paste a note or import UTF-8 text/Markdown, add a title and tags, reopen it from the source list, and download the original record. It stores exact text without editorial rewriting or publishing. The list searches titles and tags among the latest 100 records; original text loads on selection.

Migration 007 follows 006. Applied to Neon development branch br-red-smoke-b55ot7pn after successful application on isolated preview br-lively-glade-b5h2cgqy. Production is unchanged.

The authenticated database subject supplies ownership. RLS isolates reads and inserts. Clients cannot set owner, digest, byte count or creation date and have no update/delete grant. SHA-256 identifies identical UTF-8 text within one account; retries return the existing record, retaining its original metadata. A per-account transaction lock serializes intake and quota accounting.

Pilot limits: 1,000,000 UTF-8 bytes per original, 500,000,000 bytes for originals plus titles/tags, and 20 new sources per minute. This meter covers this text archive only, not total account storage, existing drafts, bandwidth or compute. It does not implement paid entitlements, the 1 TB slider, billing or a global request limiter. Do not present these pilot limits as a complete account allocation system.

Verified: migration application; missing-identity intake refusal; anonymous access denial; restricted authenticated column grants; no authenticated update/delete grants; client tests for verbatim payload, authority exclusion, missing session, byte limits, metadata-only lists and meter subject mismatch. Repository validation passed: lint, quote/copy checks, testing build, TypeScript, 44 tests, static validation and smoke checks across 85 routes.

Pending: real signed-in save/reload and two-account isolation; concurrent duplicate/quota boundary testing; deployed Data API schema cache confirmation; browser QA. No real user was impersonated and no private chat transcript was uploaded by this change.

Next: source-linked exact quote spans with separate editorial annotations; binary object storage with reserved-byte accounting; fine-grained revocable agent credentials through a separate trusted API/MCP service. Original sources belong in private storage, never this public repository. The frontend remains static deployable; this slice uses the existing Clerk/Neon boundary rather than creating backend HTTP handlers in the frontend repo.
