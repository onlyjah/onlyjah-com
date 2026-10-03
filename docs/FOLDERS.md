# Folder integrity and reuse

Engineering audit, 3 October 2026. Read [development workflow](DEVELOPMENT.md) before copying this checkout.

| Location | Purpose | Reuse |
| --- | --- | --- |
| src/components, src/lib, src/styles.css, src/theme.css | Provider-free React UI and browser preferences | Copy/reference through the UI export |
| src/features/design | Optional user-supplied branding | Separate preset export entry |
| Other src/features, src/routes, src/content | OnlyJah routes, copy and Clerk/Neon adapters | Select deliberately with auth/source contracts |
| public/images | Credited camera photographs | Retain source/license records and attribution |
| scripts, tests | Build, copy, static, hosting and behavior checks | Adapt to the consuming app's output contract |
| content | Public excerpt manifest and redirects | OnlyJah-specific |
| docs/manual, selected docs/drafts | Public Markdown content | Requires wording/placement approval |
| docs/backend/migrations | Ordered database changes | Review target branch; never replay blindly |
| docs/content-review, docs/sources, docs/handoff, OnlyJah-Codex-Handoff | Private master, transcripts, provenance and recovery | Preserve locally; excluded from public Git/exports |
| exports | UI exports and recovery snapshots | Select one export; never upload the whole directory |
| node_modules, .tanstack, .output, tsbuildinfo files | Reproducible caches | Recreate; deploy only .output/public |
| .agents, .codex, .aws | Empty environment-managed directories here | Leave managed directories intact |
| .git | Linked worktree metadata shared with original repo | Never copy/delete as app cleanup |

Root configuration has one role per file: pnpm lock plus pnpm-workspace.yaml install policy for one package; Biome; shadcn components.json; app/tooling TypeScript configs; Vite; Node 24 .nvmrc; blank .env.example; CI/publication workflows; optional asset-only Wrangler configuration. Direct dependencies are pinned. No tracked npm/yarn lockfile competes with pnpm.

The obsolete generated dist/server tree was moved to ignored exports/obsolete-dist-2026-10-03 for recovery. Native prerendering removes the Nitro beta dependency; the finalizer removes temporary server output and hashes static files. Historical sources, stashes, handoff and the separate Clerk starter were preserved.

Use pnpm check:boundaries and pnpm export:ui. Exports have relative imports, dependency/peer ranges and hashes, without env files, provider integration or private editorial records.
