# OnlyJah / Ark frontend

Portable public frontend and member workspaces. Current stack: TanStack Start, React, shadcn/Base UI, Tailwind, Clerk and Neon, with Railway testing hosting behind Cloudflare. Backend software belongs in a separate repository.

```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm dev
pnpm copy:refresh
pnpm check
pnpm preview
```

Use Node 22.12+ and pinned pnpm 12.5.1. `.output/public` is the deployable static artifact. `pnpm start` serves it on the host/port required by Railway. Development uses only public frontend settings from `.env.example`; provider secrets never enter browser configuration.

[Current documentation](docs/README.md) is the active index. [Stack](docs/STACK.md) explains each component using Jah's exact quoted preferences and separately labeled engineering rationale. [Content review](docs/content-review/REVIEW-REPORT.md) maps wording to its source and placement. [Testing readiness](docs/testing/STAGING-READINESS.md) records what is actually verified.

The canonical quote master is `docs/content-review/content/master-quotes.json`. `src/content/quotes.json`, `terms.json` and `copy-slots.json` are generated projections. `docs/sources` preserves original references. Historical plans and snapshots remain indexed outside active public imports.

`pnpm build:testing` permits excerpts awaiting Jah's review and visibly labels the testing site. A normal `pnpm build` requires current wording and placement approvals. Clerk billing, uploads, privileged organization actions and seller payouts have separate activation requirements; signup grants none of them.
