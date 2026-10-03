# Static hosting

Engineering deployment guide for the public artifact. Environment-specific staging security and activation instructions remain in the private handoff.

pnpm build creates .output/public with meaningful route HTML, browser assets and a SHA-256 release manifest. Native TanStack prerendering uses temporary build-time compilation; the finalizer removes server output. Upload only .output/public. Resend delivers email and does not serve the frontend.

| Host | Static deployment |
| --- | --- |
| Cloudflare Pages | Build the chosen repo branch using pinned pnpm and Node 24; output .output/public |
| GitHub Pages | Use pages.yml workflow_dispatch and upload-pages-artifact; configure the Pages environment separately |
| Cloudflare Workers assets | wrangler.jsonc points at .output/public without a worker application script |

Public builds require copy approvals and matching public provider settings from .env.example. Required GitHub environment reviewers are an external setting, not enabled by naming the environment in YAML. Root-relative routes require a root-served domain; repository subpaths are not supported by the current route/content contract.

pnpm preview is a local file server, not a required application runtime. Static hosts use generated HTML fallbacks for eight legacy URLs, with canonical links and meta refresh; a fixed browser redirect preserves query/fragment when allowed by CSP. HTTP redirect status codes require host rules. Strict CSP hosts need hashes/nonces for preference initialization scripts.

Protected staging must use the privately documented activation process and hosted acceptance checks. A public artifact workflow is not a substitute for that configuration. [Configuration names](../ENVIRONMENT.md), [code verification](../testing/STAGING-READINESS.md), [TanStack hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting).
