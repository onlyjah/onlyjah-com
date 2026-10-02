# Testing release readiness

The workstation recovery is complete. Original source hashes are preserved, the lost temporary edits were replayed into persistent storage, and the recovered changes are installed in the actual `onlyjah-rebuild` checkout. The existing test history has been reconciled without rewriting it. Live deployment verification is pending; do not infer it from local checks.

Local validation passes: build, type checking, formatting, 37 automated tests, 85 prerendered pages, 66 assets, internal destinations, direct URLs, slash variants, 404s and HTTP method handling and eight legacy URL redirects. The public manifest fallback is verified without the private master. Default publication builds reject pending author approvals. Scoped moderation is implemented in the community UI, with authority enforced by PostgreSQL.

Database validation passed migrations 001-006 and ownership/expiry/collaboration/moderation fixtures in an isolated local database. Migration 006 passed preview catalog checks before installation on development. All ten development tables force RLS. Newly added entitlement, stewardship and Forge item tables are empty. No human received a new grant, no real post was published, and production was not migrated.

Clerk development's public/private keys match. Personal sign-in no longer forces organization creation. The global user-created organization restriction is still pending in the matching Dashboard; naming defaults do not enforce that permission. Only confirmed adam and Jah Noah subjects may later receive an exception. The accountless app must be claimed before Billing can be enabled. No subscription price or checkout is active.

Railway development (`develpment`) is configured to build `test` with `pnpm build:testing`, serve static files with `pnpm start` and use the verified public development settings. Cloudflare already fronts `test.onlyjah.com`. The next source deployment must be verified by commit and HTTP checks. Production configuration and deployment are outside this release.

The public repository receives only selected excerpts and a checked manifest. Conversation evidence, the complete editable quote master, original sources and historical handoff packs remain private local files. The local review library has 167 records, 52 terms, 128 proposed placements, ten source collections and nine runtime slots. Its current heuristic wording audit records 454 candidates; 418 unmatched functional/factual strings need Jah wording or an explicit exception. Testing copy is marked for review and noindexed.

Live acceptance remains open: actual profile/draft save and reload, two-member isolation, two-editor conflict handling, paid feature expiry through provider sync, organization restrictions and moderator operation with a reviewed duty. One account's signed-in reads were verified before reboot, not its persistence writes. Static/HTTP tests do not imply these browser-operated checks.

Uploads require a trusted authorization/presign service despite the existing private development bucket. Seller onboarding/checkout/payouts, refunds, disputes, platform fees and fulfillment are separate from Clerk subscriptions and remain inactive. Matrix, notifications and meetings remain later work as Jah requested. Ten-person onboarding awaits identities, contributor terms, provider ownership and the live acceptance checks.
