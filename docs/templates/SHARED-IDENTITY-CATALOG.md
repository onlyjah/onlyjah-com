# Shared identity and catalog

Engineering implementation notes, 3 October 2026. Configuration is not proof of live SSO or payments.

OnlyJah and JahNoah can share one Clerk app and one authorized Neon Data API while retaining separate static frontend repositories. Payment, email and upload operations belong in a separate trusted backend. Resend sends email; it does not serve TanStack or replace static hosting.

## Clerk satellites

Client-only @clerk/react retains primary /sign-in and /sign-up defaults. On primary, set VITE_CLERK_ALLOWED_REDIRECT_ORIGINS to exact approved satellite origins. On satellite, use the same publishable key, VITE_CLERK_PRIMARY_URL with primary HTTPS origin, and VITE_CLERK_SATELLITE_DOMAIN with the satellite hostname. Localhost HTTP works for development. Unsafe/incomplete configuration fails initialization/build.

The satellite auth route uses Clerk URL builders for synchronization and returns to its own /account. satelliteAutoSync stays false so ordinary public visits do not initiate a session redirect. Register/verify domains, production DNS and redirects in the matching Dashboard. A shared publishable key is insufficient.

Acceptance: sign in on primary, visit satellite, follow its sign-in flow back, test sign-out and a second account, then verify private Neon ownership on both. Settings tests/static checks do not perform this journey. [Clerk satellite documentation](https://clerk.com/docs/guides/dashboard/dns-domains/satellite-domains).

## Catalog classification

Migration 008 adds product_type to market listings, defaulting existing rows to other. Types: physical, digital, service, subscription, donation, ticket, other. Offering/request/swap remains a separate exchange classification. The editor and public cards share records; saves whitelist fields and retain revision guards, RLS, ownership and publication entitlements.

The additive schema change preserves existing ownership and publication rules. Category validation, save whitelisting and ownership fixtures cover the catalog contract. Apply ordered migrations to the intended environment after isolated verification; actual branch IDs and installation evidence stay in the private handoff.

Subscription classification is a listing, not a Stripe subscription. Browser price descriptions are display text. Stripe product/price mapping, seller onboarding, Checkout creation, verified webhooks, idempotent fulfillment, refunds and entitlement sync remain trusted backend work. No Stripe resource, price, charge, grant or payout was created. Use isolated Stripe sandboxes and validate provider prices/ownership server-side. [Fulfillment](https://docs.stripe.com/checkout/fulfillment), [sandboxes](https://docs.stripe.com/sandboxes).

TutemRa's public website was reviewed as spiritual/community context; its copy, beliefs and branding were not transplanted. The named private federated community platform chat was inaccessible; no imported-chat claim is made. [User reference](https://www.tutemra.com/).
