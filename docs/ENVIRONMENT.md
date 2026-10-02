# Development configuration

The active frontend settings are the Clerk test publishable key, Neon development Data API URL, Neon guest Auth URL and `VITE_RELEASE_STAGE=testing`. Values stay in ignored local files and Railway development variables. These are public build settings. Provider secret keys and database passwords never belong in `VITE_` variables or static assets.

Railway's environment is literally named `develpment`; the deployed source branch is `test`. The local working branch is `rebuild/oj-web`. Testing and production have separate targets. Railway development builds with `pnpm build:testing` and serves static files with `pnpm start`; public settings are embedded at build time.

Vite loads `.env.local` in both development and production mode. Use mode-specific ignored files or provider-injected overrides when separating environments. `.env.example` contains blank names only. Production is not authorized by this release.

Neon project `lingering-pond-34649517`, database `neondb`: development is `br-red-smoke-b55ot7pn`; production is `br-crimson-dew-b5z6k4vc`. Migration 006 was validated on a preview child of development before application to development. All ten public tables enforce RLS and FORCE RLS. No real contributor or stewardship grant was assigned. The private development bucket remains separate from a working upload service.

Clerk's matching development instance is verified by both its instance type and matching public/private JWKS keys. Personal sign-in no longer requires an organization. Billing remains unavailable until the matching accountless app is claimed. Restrict user-created organizations in the Dashboard and then enable only confirmed steward identities; suggested organization naming rules are unrelated to that permission. Do not treat a local duty table as enforcement in Clerk's own API.

One real member's token/read access was confirmed before reboot. Save/reload, two-account browser isolation and collaborative editing still need live acceptance checks. See [testing readiness](testing/STAGING-READINESS.md), [authoring setup](AUTHORING.md) and the archived environment report for chronological evidence.

Unused Convex and historical environment aliases remain local references, not active integrations. This agent is not synchronized with VS Code's process; both tools may read the same disk checkout. A configured service or named bucket does not establish a completed feature.
