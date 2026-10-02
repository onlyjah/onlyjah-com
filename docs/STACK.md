# Stack and boundaries

Engineering notes are distinguished from Jah quotations. A stated preference is quoted exactly; a component rationale without an explicit quotation is labeled as an engineering rationale.

> Do all the work you need to get this running on the testing branch and in the development servers of railway, clerk, and neon, that is my stack rn. And ofc, cloudflare which is handling dev and prod rn.

Jah, 2026-10-02. Source: [master quotes](content-review/content/master-quotes.md).

> m using tanstack start atm, really want a completely static frontend with its own repo, and the backend software and whatnot be in another repo, that way certain aspects can be spread across platforms and resources in case one provider is deemed optimal for auth, for ex, whereas another handles data better.

Jah, 2026-10-01. Source: [master quotes](content-review/content/master-quotes.md).

| Layer | Component | Present responsibility | Rationale and evidence |
| --- | --- | --- | --- |
| Public edge | Cloudflare | DNS/proxy in front of both public and test hosts; HTTP responses from both hosts identify Cloudflare | Jah explicitly names Cloudflare in the stack quote above. No DNS mutation is needed for the existing test host. |
| Development hosting | Railway | Serves the static frontend from the `test` Git branch at `test.onlyjah.com` | Jah explicitly requests Railway development hosting. Engineering rationale: deploy a portable artifact and keep privileged backend software separate. |
| Public app | TanStack Start, React, Vite and Nitro | Routes and static prerendering into `.output/public`; client hydration for signed-in features | Jah's static frontend and separate backend direction is quoted above. Engineering rationale: direct URLs and portable hosting while keeping private data out of generated HTML. |
| Shared UI | shadcn/Base UI, Tailwind and theme tokens | Reusable accessible primitives, blocks, sections and roots palette | Jah requested shadcn and prioritizes reuse. Engineering rationale: consistent components receive props; account/provider logic stays in features. |
| Identity | Clerk React SDK and development instance | Sign-in, signup and verified member session JWTs | Jah's stack choice is explicit. Private permissions remain enforced by the database or a trusted service, not by hidden buttons. |
| Membership billing | Clerk Billing | Planned individual Contributor subscriptions and individual paid feature flags | Jah requests contributor access via Clerk Billing. Activation requires a claimed app and confirmed prices. Billing does not pay marketplace sellers. |
| Data transport | Neon Data API | Standard HTTP with verified Clerk member tokens and restricted anonymous guest tokens | Engineering rationale: static clients use narrow JSON contracts without database passwords; database grants and row policies authorize each operation. |
| Relational data | Neon PostgreSQL 18 | Profiles, posts, marketplace rows, private shared items, entitlements and scoped duties | Jah selected Neon. Engineering rationale: ownership, collaboration and feature expiry are enforced transactionally in PostgreSQL. |
| File objects | Neon Object Storage | One private development bucket, `onlyjah-private`; file upload service not activated | Project region `aws-us-east-2` supports storage. Engineering rationale: branchable S3-compatible objects accompany branchable records. Binary credentials and presigning stay in a separate trusted backend. |
| Public collection tokens | Existing Neon Auth guest endpoint | Short-lived anonymous JWTs for public Data API reads only | Compatibility detail: this is not a second member sign-in system. Clerk remains member identity. |
| Seller payments | Stripe Connect, pending decisions | Future seller onboarding, checkout, platform fee and payouts | Engineering rationale: this money flow is separate from the subscription that purchases contributor access. Country, fee, refund/dispute responsibility and onboarding must be confirmed. |
| Community | Development board now; Matrix later | Present manually refreshed member messages with scoped moderation; future federation, room notifications and meetings | Jah explicitly describes Matrix as a later consideration. No Matrix server or federated notification service is currently running in this implementation. |
| Delivery tools | pnpm, TypeScript, Biome and Git | Locked packages, type checking, formatting, source provenance and testing CI | Engineering rationale: one package manager and an ordered release record reduce contradictory build paths. |

> finer grained access to individual components (not every admin can log in as any user and delete blogs, sometimes it's just admin level rights to delete offensive comments, etc.

Jah, 2026-10-02. Source: [master quotes](content-review/content/master-quotes.md).

The frontend does not hold provider secrets. Trusted billing sync, storage presigning, organization creation, sales fulfillment, email/Matrix notifications and payment webhooks belong in a separate backend repository. An adapter boundary is justified by a real integration; there is no generalized service fleet or new monorepo in this release.

Provider references: [Neon Storage](https://neon.com/docs/storage/overview), [storage authentication](https://neon.com/docs/storage/authentication), [Clerk Billing](https://clerk.com/docs/guides/billing/overview), [Stripe marketplace fees](https://docs.stripe.com/connect/marketplace/tasks/app-fees). Storage credentials are branch-scoped; credential expiry is currently not enforced, so revoke credentials explicitly rather than relying on a date. Never distribute credentials to browsers.
