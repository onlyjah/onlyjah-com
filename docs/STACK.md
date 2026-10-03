# Frontend stack

Engineering reference for packages and source boundaries. Environment-specific provider architecture and operational records belong in the private handoff.

| Package/tool | Frontend responsibility |
| --- | --- |
| TanStack Start / Router | Routes, build-time prerendering and browser navigation |
| React / React DOM | Typed components and hydration |
| Vite | Client bundling and temporary build compilation |
| shadcn source / Base UI | Accessible UI primitives in components/ui |
| Tailwind CSS | Semantic token utilities and responsive composition |
| Clerk React | Browser authentication UI and session hooks |
| Neon Data API clients | JSON transport through public endpoint configuration |
| React Markdown / remark-gfm | Structured Markdown rendering without raw HTML |
| Lucide | Existing licensed SVG glyphs |
| jose | Optional Node hosting Access-token verification |
| pnpm / TypeScript / Biome | Locked dependencies, type checks and formatting |

The deployable site directory is .output/public. Native prerendering removes temporary server output afterward; Nitro is not required. Generic UI receives props/context, while app routes and provider adapters stay outside the copyable core. Resend is email delivery and does not serve the static site.

[Frontend conventions](FRONTEND.md), [configuration names](ENVIRONMENT.md), [UI export](templates/UI-PACKAGE.md), [dependency audit](DEPENDENCIES.md). This package guide is not evidence of live provider configuration or authenticated acceptance.
