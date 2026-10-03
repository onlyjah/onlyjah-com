# Current roadmap

Engineering implementation status, 3 October 2026. Provider-specific acceptance evidence stays in the private handoff.

| Feature | Code present | Remaining work |
| --- | --- | --- |
| Static frontend | Native prerendering, meaningful route HTML, portable fallback redirects and release hashes | Browser/mobile acceptance and approved publication |
| Shared UI | shadcn/Base UI, semantic Tailwind, hashed source export | Review each consuming app's design/content and peer versions |
| Design selection | Four browser-local presets, independent light/dark preference, preserved token sources | Visual and keyboard acceptance |
| Media | Credited photographs and optional reduced-motion-aware Lucide SVGs | Replace placeholders with reviewed human media |
| Editorial workflow | Exact sourced excerpts, private master, stable public snapshots | Human wording/placement approval |
| Forge | Private drafts/backups, source intake, shared documents and revision checks | Real multi-account persistence/conflict acceptance |
| Catalog | Own drafts, seven product categories and entitlement-gated publication | Provider product/price mapping and seller payment contract |
| Shared identity | Opt-in Clerk satellite host settings and URL-builder sync flow | Dashboard domains and live sign-in/sign-out acceptance |
| Restricted staging | Tested origin Access JWT/allowlist guard | Actual provider configuration and allowed/denied origin acceptance |
| Billing / files / email | Separate trusted backend boundary | Verified webhooks, fulfillment, authorized upload service and notifications |
| Community | Member board and scoped moderation contracts | Later federation, Matrix rooms, notifications and meetings |

No catalog label implements paid billing or grants privileged rights. Signup is distinct from publishing, moderation, organization duties and paid features. Public deployments require approved content and matching provider configuration. A configured resource is not acceptance evidence.
