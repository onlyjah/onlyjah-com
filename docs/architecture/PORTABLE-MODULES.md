# Portable clients, server, and service addons

Engineering decision record, 2026-10-15. This is implementation documentation, not public editorial copy.

## Approved direction

> Onlyjah.com and jahnoah.com should both use tanstack start with vite+

> Layouts should be part of the OJ ui library and use blocks that use shad that uses baseui typescript.

> I'm considering railway along with moving to self hosted platform later on so the client and server + server addons / services being self complete yet interconnect able is key

## Ownership and dependency direction

| Unit | Owns | Must not own |
| --- | --- | --- |
| Site client repository | TanStack routes, site content, local feature adapters, site-selected themes | Server secrets, privileged authorization, generic component implementations |
| OJ UI source repository | TypeScript layouts, blocks, shadcn/Base UI primitives | Site routes, editorial copy stores, Clerk/Neon hooks, API calls |
| Backend repository | Verified identity/session handling, domain policies, writes, persistence adapters | Requiring a particular site checkout or UI framework to run |
| Optional service/addon | One bounded capability, its config, health, tests and API/event contract | Importing another service's private implementation or silently broadening authority |
| Hosting adapter | Static HTTP delivery, health, runtime binding and container entrypoint | Domain authorization, payment logic, or provider-specific assumptions in components |

Layouts compose blocks; blocks compose shadcn components; interactive primitives use Base UI. Existing local import paths can re-export the shared implementation during migration. Provider-aware controls are passed through layout slots. Dictionary rendering remains site-specific because its editorial links depend on site content.

## Current implementation

Both clients build with TanStack Start and Vite+ 1.2.0. Vite+ supplies the Vite core through the supported pnpm catalog alias so framework plugins resolve one Vite instance. Node native tests and OnlyJah's existing Biome rules remain authoritative; adopting Vite+ does not require rewriting those tests or dropping existing checks.

TanStack/Nitro perform build-time prerendering. Only the resulting public assets are deployed by these Dockerfiles. The production static runtime uses Node built-ins and has no application dependency install. No server-function API is deployed implicitly with the client. Do not put private state into prerender loaders or generated public files.

`onlyjah/oj-ui` is the canonical private UI source repository. Consumers use a source snapshot installed as `@onlyjah/ui` via `file:vendor/oj-ui`; `vendor/oj-ui.lock.json` records revision and every file hash. CI checks drift. This intentionally supports a fresh build without private GitHub credentials. Private source-repository visibility does not make browser-delivered UI code secret. Never include secrets in UI packages. A registry can replace snapshot transport later without changing imports.

## Standalone client operation

1. Install the Node version from `engines` (CI uses Node 24).
2. Install the package manager pinned in `packageManager` and run `pnpm install --frozen-lockfile --ignore-scripts`.
3. Run the repository's `pnpm check` command.
4. Serve the static output through `pnpm start` or any static server with directory-index and 404 support.

Docker: `docker build -t oj-client .`, then `docker run --rm -p 8080:8080 oj-client`. `HOST`, `PORT`, and `PUBLIC_DIR` configure the included static server. `/healthz` checks that an index artifact exists. A missing route returns HTTP 404, not an HTML success response or an application shell fallback.

`railway.json` selects that Dockerfile and health path. A self-hosted OCI runtime can run the identical image. TLS and public routing belong to the deployment's reverse proxy. The Docker recipe is supplied for review; it is not evidence that an image was built or deployed in this session. OnlyJah's Docker build selects testing copy and keeps noindex metadata until an explicit promotion workflow is approved.

## Server and service boundary

The existing `onlyjah/ark` repository contains a Go backend under `backend/` and optional service entrypoints under `services/`. This pivot does not replace it or claim its integration is complete. Existing Clerk/Neon access on OnlyJah stays in its feature adapters and retains managed authorization. No new identity provider, database migration, upload entitlement, payment flow, or secret distribution is activated here.

Server modules must start from their own checkout with documented environment configuration and migrations. They can run together behind one host gateway or independently as separate services. A client calls a versioned public API through an adapter; shared layout code never imports server internals. Each additional process must earn its operational cost: an internal package is sufficient when independent scaling or isolation is unnecessary.

`contracts/addon.schema.json` defines the proposed descriptor for adding a service. It records module ID/version, OpenAPI location, health path, required scopes and configuration names. It holds no secret values or live endpoint selection. This is a design contract, not an implemented addon installer or auto-trusted discovery mechanism. Event-driven addons may also advertise an AsyncAPI definition.

## Connection lifecycle

1. Operator configures an allowlisted service origin and obtains its versioned contract.
2. Client adapter validates the supported contract and requests the needed session authority.
3. Trusted server verifies issuer, audience, expiry, resource scope and domain permissions on every protected operation.
4. Health and readiness are observed independently; a missing optional addon disables only its capability.
5. Disconnect revokes/ends future use according to the grant model; it does not imply remote plaintext recall.

Fetching OpenAPI does not authorize calling it, installing code, changing routes, or handing over credentials. Runtime public config is distinct from secrets held by server adapters. VITE_* values are browser-visible build inputs and can require rebuilding to change them. Do not put database URLs, private keys or administrative credentials there.

## Adding a module

Begin with its own README, input/output contract, explicit scopes, resource limits, tests, health endpoint, local run command and optional container. Keep domain logic independent from transport and storage. Supply a fake adapter for unit tests and verify a real adapter separately. Version incompatible changes. Payment, indexing, notifications, synchronization and storage addons must state their failure and retry behavior, including idempotency on writes and paid events. Do not declare an integration functioning just because configuration is present.

## Review and archival workflow

Working tracker: https://github.com/onlyjah/onlyjah-com/issues/3 and GitHub project https://github.com/users/onlyjah/projects/2. Link consumer PRs to the source UI PR; review them as one release set. Commit source provenance and actual check results under docs/handoff. Keep old PRs and branches intact, and use new migration branches. JahNoah's original Astro sources are preserved under docs/history/astro-1401924 and in Git history. They are historical records, excluded from active builds/checks.

Merge order: UI source review, then consumer reviews. Consumer snapshots permit independent builds before the UI branch merges. Production promotion is a separate owner-reviewed operation. Roll back by reverting the consumer PR or deploying the previous immutable build. Do not delete cloud data, prior branches, working-drive files, or legacy migration sources as part of this code pivot.

## Primary implementation references

- https://viteplus.dev/guide/migrate
- https://viteplus.dev/guide/local-cli
- https://tanstack.com/start/latest/docs/framework/react/guide/hosting
- https://ui.shadcn.com/docs/monorepo (package-boundary guidance; this does not combine the independent repositories into an app/server monorepo)
