# Constellation testing deployment
Technical handoff, 9 October 2026. Assistant-authored status text is distinct from exact source excerpts. This branch adds a public index under Realm; it does not change production login, Neon schema, payment flows or the existing Ark phone storage.

## Implementation
- `/realm/constellation`: prerendered public index, search and maturity filters.
- `/realm/constellation/{projectId}`: stable pages and typed relationships.
- Existing TanStack, shadcn/Base UI components and theme tokens reused.
- The graph is a lazy chunk; the initial public index is already in static HTML.
- `VITE_ARK_PUBLIC_API_URL` is a credential-free public HTTPS origin.
- Public API responses are validated and stored in a separate IndexedDB public cache.
- Hidden tabs stop streams. Reconnect refreshes the current public snapshot.
- Backend lives separately in `onlyjah/ark`, branch `deploy/constellation-0.1`.

The prototype's known published pages are generated at build time. A new public project needs a corresponding client build for its static permalink. Existing IDs remain stable. Publication through Git is the current update workflow; runtime private editing and a durable private replay log are not implemented.

## Source and editorial boundaries
`src/features/constellation/public-snapshot.json` is the central data/copy source for these views. It contains only approved-for-this-preview public concepts and exact supplied excerpts. The new Nebula excerpt is exactly “the nebula generates stars.” The seed/root excerpt is exactly “A tree still has its roots.” The Ark excerpt is the existing Ark README text. The engineering index does not insert synthesized definitions into the canonical editorial quote master.

Stage/source/control strings are brief technical metadata. No price, testimonial, business revenue, project ownership, legal status or financial entitlement is invented. OnlyJah's commercial maturity is shown as unverified. The seven-record concept index is not a complete inventory of every project or contributor.

## Deployment profile
Configure the dedicated Railway service with `Dockerfile`, healthcheck `/realm/constellation`, explicit `PORT=8080`, and domain target port 8080. The provider now rejects a custom Config as Code path as deprecated; the deployment uses service configuration and the portable Dockerfile instead. The multi-stage Dockerfile copies only `.output/public` into Caddy. The runtime image contains no Node runtime or `.output/server`. The Node preview script is only a local verification file server. Private credentials and member data remain outside static HTML.

Keep main/test and existing services independent. Git branch publication and successful build are insufficient to claim live. Verify the exact service's terminal SUCCESS, commit, HTTPS route, assets, public API, private denial, browser interactions and offline public cache.

## Checks performed before provider deployment
- Frontend static build and type check passed.
- 56 frontend tests passed, including payload scope, hidden endpoints, unsafe links and API-origin checks.
- Full lint passed.
- Static checks passed for 93 known pages, including the new index and seven permalinks.
- Backend has seven passing boundary tests and a locally verified HTTP host.
- Browser and provider evidence are recorded after deployment below.

## Weeds and one next step
Private session/principal/action-grant integration is inactive. Financial commands, automatic compensation, new databases and Nebula hardware enrollment are inactive. No hyperscale capacity is claimed. Browser caches can be evicted; publicly copied content cannot be recalled.

Next: connect the current verified Clerk principal and an explicit resource/action grant to one private read operation, then prove two-account and cross-organization denial before enabling private commands.

## Browser transport and phone review
The session's standalone Chromium cannot directly reach the external API through its sandbox TLS proxy. Browser interaction checks therefore forward real deployed HTTPS API responses through the session's working transport. This verifies rendering, interaction and the public cache, with that transport limitation explicitly retained. The API's HTTP and SSE responses are also checked directly, independently of browser interception. Native end-user network behavior still requires a direct browser check outside this session.

Phone review found the existing shared header wider than a 390px screen. Its control row now wraps on narrow screens without dropping controls or changing their wording. This is a responsive frame fix, not an authentication change.
