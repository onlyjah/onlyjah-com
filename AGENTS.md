# OnlyJah working instructions

Start at docs/README.md and docs/DEVELOPMENT.md. Confirm the actual checkout, branch and remote before editing. Private session evidence and provider scope live in the ignored docs/handoff directory; do not publish those records or infer account permissions from login.

## Voice and provenance

Use Jah's verbatim sourced words; preserve spelling, grammar and repetition. New directions belong in dated private docs/sources files and the canonical docs/content-review/content/master-quotes.json, with exact spans, hashes and tags. src/content/quotes.json is generated. Never claim access to an unavailable conversation. Keep technical implementation notes distinct from Jah quotations. Publication requires the copy approval check.

Do not generate artwork or import AI mockup copy as human-authored content. The user-supplied design-kit token values may inform selectable presets; retain their source hashes and document adaptations. Photographs need verified source/license records and visible attribution. Lucide motion must honor reduced-motion preferences.

## Architecture and editing

Keep the static frontend portable and trusted backend software separate. TanStack Start prerenders .output/public; native build-time server output is removed after generation. Deploy only that static directory. Resend is email delivery, not frontend hosting.

Use pnpm and its authoritative lockfile, Biome, TypeScript, real shadcn/Base UI primitives and Tailwind semantic tokens. Generic components, blocks, sections, layouts and browser preferences receive data through props/context. Keep routes, editorial content and provider calls in features/routes. Prefer reuse to speculative abstractions. Default Roots remains available alongside optional design presets.

Clerk verifies identity; Neon grants/RLS authorize records. Browser visibility is not authorization. Never bundle database passwords, provider secrets or privileged credentials. Publishing, moderation, paid features, organization actions and seller payments are separate permissions. A catalog subscription label does not implement billing. Do not claim SSO, write persistence or two-account isolation from provider configuration alone.

## Verification and continuity

Preserve stashes, branches, original handoff sources and unrelated adjacent work. Use dev branches and a reviewed PR toward staging. Run relevant lint, boundary, quote/copy, type, build, behavior and static/HTTP checks; review git diff --check and exact staged paths. Inspect the public payload for private records before publishing.

pnpm export:ui creates an allowlisted, hashed source snapshot with optional branding and licenses. It excludes env files, member features, routes and private archives. Consult docs/FOLDERS.md before cleanup or extraction. Update the dated private handoff with actual revision, checks, mutations, missing inputs and one next step. Report browser/deployment acceptance only when actually observed. Live provider access/configuration requirements are documented separately; do not treat documentation as an enabled control.
