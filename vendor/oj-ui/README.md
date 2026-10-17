# OJ UI

Shared TypeScript layouts → blocks → shadcn components → Base UI.

Canonical source: onlyjah/oj-ui. Application content, routes, identity provider hooks, data clients, and secrets stay in consuming applications. No UI module imports a site alias or provider SDK. React and ReactDOM are peers so clients use one React runtime.

This initial package exports TypeScript source for Vite compilation. It is not an independently executable server. Consumers install a reviewed, hash-verified source snapshot under vendor/oj-ui until a private package registry is configured. The repository remains private; shipped UI is necessarily delivered to browser clients. Never put secrets or proprietary server code in this package.

## Development

`pnpm install --frozen-lockfile`, then `pnpm check`. Run consumers' typechecks, production builds, and static checks for every release. `node scripts/export.mjs /absolute/client/path` updates a consumer snapshot with per-file SHA-256 hashes; commit that update through its own PR and refresh its lockfile. Do not edit vendor/oj-ui in consumers. CSS tokens remain consumer-selected; Tailwind consumers must scan the installed package source. Editorial layouts preserve the consumer's existing CSS class contract.

## Source provenance

Initial primitives and generic blocks are extracted from onlyjah/onlyjah-com test commit 80283b5, with portable relative imports. Existing source accessibility adjustments are retained. Theme and dictionary-aware controls remain site adapters. shadcn primitives are adapted from shadcn-ui/ui; see THIRD-PARTY-NOTICES.md. New layouts accept slots/props, never provider hooks.
