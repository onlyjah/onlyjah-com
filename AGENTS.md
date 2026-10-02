# OnlyJah / Ark working instructions

Read docs/handoff for current evidence and OnlyJah-Codex-Handoff/CURRENT-CONTEXT.md and CODEX-RUNBOOK.md for the original handoff. Current user instructions take precedence over historical plans.

## Jah’s voice and editorial control

Use Jah’s verbatim, sourced words wherever possible. AI-written descriptive copy is a last resort; keep any necessary technical status notes brief and distinct from quotations. Never attribute synthesized planning documents or invented text to Jah. Do not correct grammar, spelling, or repetitions inside quotations.

Quotation sources live in docs/sources; the canonical editable quotation master is docs/content-review/content/master-quotes.json; src/content/quotes.json is generated. Preserve source dates and conversation labels. Add new interview answers as dated sources. Account-wide messages are not accessible unless the user supplies them; do not claim otherwise.

Ask one focused interview question when content or placement needs Jah’s input. Treat page order and content placement as user decisions. Preserve earlier writing as historical/editorial baseline rather than presenting it as Jah’s voice.

## Current direction

Portable static frontend in this repository, backend software in a separate repository; no launch monorepo. OnlyJah and Ark are twin stars. Forge creates, Media publishes, Realm connects.

Jah's current product labels: Forge - Distributed Project Management; Media - Distributed Media Distribution; Realm - Distributed Communications. Ark renders differently by account type. The private captain/delegated-admin control plane is a design requirement, not implemented auth; read docs/backend/ARK-ACCESS-DESIGN.md. Keep administrator duties separate from paid feature entitlements and enforce them in trusted backend code.

Use pnpm for installs and scripts; pnpm-lock.yaml is authoritative. Jah confirmed this workflow on 2026-10-02.

Use actual shadcn/Base UI components with Tailwind for the shared UI; Biome for formatting/lint; TanStack Start for the app. Preserve red, gold, green, and black. Jah's latest direction softens the earlier square/corporate treatment: warmer, organic roots colors, friendlier cards and modestly smaller spacing. Keep balanced columns, tagged docs, readable contrast, and keyboard access. Non-AI, royalty-free/public-domain/Creative Commons placeholder photographs are authorized; preserve visible credits and source/license records. Do not generate AI pictures.

Page composition belongs in routes, with ignored reusable templates under routes/-templates. Generic components/ui, blocks, sections and layouts receive content through props; keep provider hooks and app-specific content in features/routes. Reuse before adding abstractions. Theme tokens live in src/theme.css for tweakcn pastes; do not restore bespoke oj-* CSS.

Jah wants visual mockups before broad style/layout changes. The latest message directly authorizes the roots palette/card/photo changes; /design-preview still holds the separate compact/brighter proposal for review. The requested theme toggle is integrated. No AI mockup images were requested or generated. Document the two shadcn source accessibility adjustments rather than claiming components/ui is untouched upstream.

Jah selected Clerk authentication + Neon Postgres on 2026-10-02. Development migrations 001–003 and 005 are effective; 004 was an attempted auth-schema grant that did not take effect because the migration role lacks grant option on the managed schema. The original 403 was followed by a valid signed token missing role; development API reads .role and falls back to anonymous. Jah's latest hidden-input diagnostic now verifies authenticated role, expected database subject, my_access/profile/draft reads all HTTP 200, drafts true and all publishing/curation/Ketema grants false. Real member reads are verified for this one development account; profile/draft save/reload and two-account live isolation remain unverified. Do not repeat completed JWKS/role setup or assign rights as a workaround. Forge token-copy bypasses cache. Read docs/AUTHORING.md for setup and next persistence check. Public collections use scoped anonymous Neon JWTs, never a second member-login flow. PostgreSQL grants/RLS authorize rows. Never bundle database connection strings, admin keys, or Clerk/Stripe secrets. Privileged operations belong in a separate trusted backend; preserve public static routes. Read docs/backend/BOUNDARIES.md before activating data access.

Jah reaffirmed “Keep Neon for now; compare first” when discussing Convex. Existing extra .env.local variables do not prove integrations; docs/ENVIRONMENT.md records names without values. The effective Vite Data API URL matches development branch br-red-smoke-b55ot7pn, project lingering-pond-34649517 (onlyjah), database neondb. Production/default br-crimson-dew-b5z6k4vc was not changed. Ten development tables have RLS and FORCE RLS; public guest reads and private guest denials are verified. The real Clerk session now succeeds through the Data API; the connector still does not expose the verifier list. Use explicit project/branch IDs; never default to production. Preserve applied migrations and add a new migration for subsequent changes.

Forge drafts, resident artist profiles, OnlyJah publications, Market and the development community board are implemented through the managed Data API. Signup creates no organization or publishing/admin privilege. The older organization qualification proposal is superseded. Only verified adam and Jah Noah IDs may receive organization creation duties; the global Clerk creation restriction still requires Dashboard configuration after claiming the app; Ketema is a separate invitation. Do not grant publishing or captain rights by matching an email. Real member authorization must be verified before any trusted grant, live publication or paid onboarding.

Jah's SO/IL direction combines encrypted human recovery custody, scoped robot/admin credential use and fleet observability through Ark. Read docs/backend/SOIL-CREDENTIALS-FLEET-DESIGN.md. These are proposals, not an implemented vault/broker. Never put credentials or unlock keys in frontend env variables, telemetry or a shared fleet inventory. Preserve the distinction between public environment configuration, protected credential custody and authorized use. Vite .env.local loads in both modes; use mode-specific names when separating targets.

## Safety and evidence

Preserve stashes, branches, source history, the handoff pack, and the separate oj-web work. Do not bootstrap or copy the supplied overlay wholesale. Keep draft, planning, historical, and newly verified facts distinct.

Local changes and the testing branch/development deployment are explicitly authorized by Jah on 2026-10-02. Production migrations, production deployments, paid provisioning and unrelated DNS changes require separate authorization. Never expose secrets.

Run relevant lint, type, build, static-content and direct-link checks. Update the repo-local handoff with actual results, changed files, open questions, and one next step. Do not claim browser interactions or deployment were verified unless they were.

Current active documentation starts at docs/README.md. Preserve originals, quote provenance and historical snapshots; do not restore superseded organization qualification or broad admin rights. Use typed --- in newly authored prose only when helpful; the display layer renders it as a hyphen. Preserve source punctuation. Recovery work must be kept in persistent storage rather than /tmp.
