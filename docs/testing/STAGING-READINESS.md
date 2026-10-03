# Testing readiness

Engineering code verification, 3 October 2026. Local checks are distinct from hosted or authenticated acceptance.

The reconciliation builds native static output without Nitro. pnpm check passes formatting, source boundaries, quote/copy checks, TypeScript, 62 behavioral tests, 85 meaningful pages, 1527 asset references, 70 assets, eight static legacy fallbacks, release hashes and HTTP direct/slash/HEAD/404/method handling. The artifact contains 166 hashed files plus static-release.json; temporary server output is removed.

The UI export also passes an isolated Astro 7.3.5 / React 19.3 static build and installed-package typecheck. Browser visual, keyboard and mobile acceptance remain open. Settings tests do not prove Clerk cross-domain SSO; data-client/role fixtures do not prove two real browser accounts can save/reload records.

Product classification and private-only editorial snapshot behavior are implemented. A subscription label is not paid billing. Stripe checkout, webhooks and fulfillment remain separate backend work. [Dependency audit](../DEPENDENCIES.md) distinguishes runtime dependencies from the unpatched development CLI advisory.

The origin Access guard is tested locally. A functioning restricted deployment requires actual provider configuration and an explicit tester list, then allowed/uninvited/direct-origin acceptance. Do not equate an edge proxy, noindex tag or configured workflow with private staging or protected Git merges. [Hosting contract](../hosting/STATIC-HOSTING.md).

Environment-specific migration, deployment and account acceptance records remain in the private handoff. This public file contains no provider identifiers or detailed live verification history. Original source archives and private requirements are preserved locally; the existing public excerpt set remains unchanged.
