# Frontend configuration

Use blank names from .env.example with ignored mode-specific files or build-provider settings. Public VITE variables enter the static client; credentials and database passwords must remain in a separate trusted backend. Vite loads .env.local in both modes.

| Public setting | Code purpose |
| --- | --- |
| VITE_CLERK_PUBLISHABLE_KEY | Browser identity provider |
| VITE_CLERK_PRIMARY_URL | Optional satellite primary origin |
| VITE_CLERK_SATELLITE_DOMAIN | Optional satellite hostname |
| VITE_CLERK_ALLOWED_REDIRECT_ORIGINS | Exact permitted return origins |
| VITE_NEON_DATA_API_URL | Public HTTPS endpoint ending in /rest/v1 |
| VITE_NEON_PUBLIC_AUTH_URL | Anonymous public collection token endpoint |
| VITE_RELEASE_STAGE | Testing review/noindex marker |

Public data transport requires verified member JWTs and database authorization. A URL or key does not prove permissions, persistence or SSO. COPY_STAGE selects copy approval rules at build time. Resend, payment credentials and storage signing are backend configuration.

The optional Node staging host uses runtime-only CF_ACCESS_TEAM_DOMAIN, CF_ACCESS_AUD, STAGING_ALLOWED_EMAILS and STAGING_ACCESS_REQUIRED. They have no VITE prefix. Hosted testing requires Access validation; health uses /healthz. Actual provider identifiers, deployment configuration and acceptance evidence belong in the private handoff, not this public guide. [Hosting contract](hosting/STATIC-HOSTING.md), [shared identity](templates/SHARED-IDENTITY-CATALOG.md).
