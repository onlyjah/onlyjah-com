# Neon and Convex · comparison before switching

Checked 2 October 2026. Jah chose “Keep Neon for now; compare first.” No provider switch, deployment, billing change, account creation, or performance measurement occurred. The Stripe Directory CLI is unavailable here; the directory website could not be read by the web tool. Comparison therefore uses current official provider documentation directly.

| Concern | Neon | Convex |
| --- | --- | --- |
| Data model | Postgres, SQL, grants/RLS; fits the prepared profile proposal | Reactive database with queries/mutations/actions authored in TypeScript; a different data/authorization model |
| Static frontend | Public Data API endpoint + verified Clerk JWTs; trusted services for privileged workflows | Browser client + Clerk integration; functions enforce identity/permissions on the backend |
| Realtime collaboration | Requires a selected delivery mechanism/service; the current connector is ordinary HTTP | Reactive subscriptions are a central feature; a candidate for Realm/project collaboration |
| Current app work | HTTP profile connector and SQL tested locally; live branch still unverified | Env names exist, but no SDK/provider/backend code is integrated |
| Portability | SQL schema/data can move to another Postgres provider; managed-service APIs still need adapters | Open-source/self-hosting is available, but Convex's function/database/client contracts need an explicit migration plan |

Both let TanStack Start keep producing a portable static frontend with a separate managed backend. Neither makes account rendering, captain approval, machine credentials, cache isolation, or rate limits automatic. Convex functions must explicitly require identity and authorize each action; the documented Clerk provider handles the token exchange, not your business permissions.

## Cost evidence, not a quote for this workload

Current Neon pricing documentation reports Free with 100 CU-hours and 1 GB Postgres storage per project; Launch compute is $0.106/CU-hour and storage $0.35/GB-month, with no monthly minimum. Compute, storage, egress, extra branches, history, functions, and Clerk are distinct cost concerns. Older indexed pages still show 0.5 GB; the directly fetched current pricing page is the source for this note. [Neon pricing](https://neon.com/pricing.md).

Convex offers Free/Starter (Starter permits metered overage) and Professional at $25/developer/month plus applicable usage. The published resource dimensions include function calls, action compute, database/file/search storage, I/O and egress; subscription updates also count toward calls. Included resources and region pricing need checking against the selected plan. [Convex pricing](https://www.convex.dev/pricing), [resource limits](https://docs.convex.dev/production/state/limits).

No defensible total-cost or speed winner exists yet for this app. Neon documents cold starts of a few hundred milliseconds, excluding network/other services. Comparing that number with a warm Convex subscription would be misleading. Test warm/cold profile reads, project/task mutations, concurrent edits, communication subscriptions, permission revocation, fan-out, and monthly egress in the same region; record p50/p95 and projected usage. [Neon latency](https://neon.com/docs/connect/connection-latency).

## Recommendation · provisional

Keep the prepared Neon profile path while defining the first collaboration workflows and control-plane permission contract. Consider an isolated Convex prototype only if its reactive model materially simplifies those workflows and the measured cost/latency is acceptable. Keep provider adapters in a separate backend repo and UI content/components here.

Sources: [Convex + Clerk](https://docs.convex.dev/auth/clerk), [function authorization](https://docs.convex.dev/auth/functions-auth), [self-hosting](https://docs.convex.dev/self-hosting), and the [existing Neon boundary proposal](BOUNDARIES.md).
