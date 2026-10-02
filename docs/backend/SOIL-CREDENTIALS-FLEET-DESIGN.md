# SO/IL: credentials, identity, and fleet observability

User direction and a proposed architecture, 2 October 2026. Local design only: no vault, broker, federation, telemetry service, robot identity or recovery backup is implemented/provisioned by this document. It is not imported into public website content.

## Jah's direction · verbatim

> prod values may live in .env.prod? alongside an encrypted credentials store for all onlyjah admin accounts from github to whatever else is applicable (usually i just signin with onlyjah github account so it's nbd, however email, cloudflare, etc. must have credentials backed up somehow for admin, and robot credentials such as API keys and whatnot should be in a robot accessible (or admin accessible, admin copy-pastable / admin privilaged process may access and reference similar to how a database has a helper function to prevent direct accesses) i think this concept will be crucial to the so/il sovereign interoperability layer which will be embedded within the project ``ark`` and the onlyjah applications which impliment so/il all talking to one another as one of the same fleet rather than disjointed operations may want to have some single pane of observability much like my project with fifty trillion different concepts and features trace to one original intent to generate collective life fulfillment

## Interpretation · review proposal

SO/IL connects the fleet through shared identity, capability contracts, service discovery and observability. OnlyJah supplies its organizational intent and user experience; Ark implements the reusable trusted mechanisms in a separate backend repository. Federation should preserve deployment ownership and permit narrow, revocable delegation between deployments. A fleet identity is not universal authority over every member's secrets.

Keep three concerns explicit:

1. **Environment configuration:** development/production public endpoints and publishable keys, provider configuration and opaque credential references. Env files are plaintext delivery/configuration, not the authoritative encrypted store. Frontend build settings remain public. Use the standard Vite mode file names documented in ../ENVIRONMENT.md.
2. **Credential custody and recovery:** an established encrypted secrets/password system with access control, backup/export capability, key management and a tested recovery procedure. Choose the tooling after defining custody needs; do not invent application-level encryption or assume an encrypted blob is recoverable without its unlock material.
3. **Authorized use:** a trusted credential broker or operation executor checks the authenticated human/workload, environment, deployment, resource, duty and action before using a selected credential. The static frontend requests operations or, where explicitly permitted, an audited reveal; it never downloads the entire store or receives the vault's master unlock key.

## Human accounts and robot access

Human custody includes provider ownership/admin membership, account identifiers, login method, recovery email, recovery codes, security-key/passkey recovery or additional authenticators as supported, and any unavoidable passwords. A GitHub sign-in can connect applications, but it does not remove each provider's recovery/ownership requirements. Passkeys may be non-exportable; plan additional supported authenticators/recovery rather than promising that every authenticator can be backed up as text. Keep emergency recovery access independent of a circular dependency on the account it must recover.

Robots have their own workload/service identities, separate from the captain's interactive account. Prefer short-lived identity exchange where supported; otherwise issue narrowly scoped provider/API credentials with owner, environment, resource restrictions, expiration when supported, rotation and revocation. GitHub Actions documents OIDC for trusted provider token exchange. Cloudflare documents scoped tokens with resource restrictions and optional expiry. These are verified examples, not configured integrations.

Distinguish two storage cases: Ark can hash credentials it issues and only needs to verify, but outbound provider credentials it must replay need protected, recoverable storage or short-lived exchange. A one-way hash cannot supply a provider API key to an outbound call.

The database-helper analogy applies to a capability boundary: callers ask for an authorized operation using a credential reference, and the trusted executor uses the secret internally. Prefer returning a sanitized result over returning the underlying provider credential. Processes needing the credential itself can receive a bounded lease/injected process environment or another suitable private channel, with logs/errors prevented from including its contents.

An admin copy/reveal workflow is a distinct high-privilege action: require current authentication and the assigned duty, make the reveal deliberate, scope it to one credential/environment, and audit access without logging the value. Clipboard/browser exposure is inherent in copying; avoid persistent frontend storage and bulk secret exports. Ordinary customer login does not imply this privilege.

## Fleet view and intent traceability

Maintain an inventory of deployments/services, capabilities, ownership, environment, credential-reference metadata and health. Credential values and unlock keys stay outside the inventory and telemetry. A shared pane aggregates authorized metadata; member deployments can retain their own stores and enforce delegation locally.

Correlate user intent → project/workflow → operation/job → service/deployment → outcome with stable IDs and distributed trace context. Store useful cost/resource, availability, job, permission, audit and credential-expiry/rotation status, with subject/tenant redaction and bounded retention. Explain failures in terms of the requested operation rather than dumping upstream request headers or secrets.

Jah's stated intent is “to generate collective life fulfillment”. Technical health/cost/activity are observable signals, not proof that this human outcome was achieved. Qualitative outcomes and their measures need Jah's definition; do not substitute a generated dashboard metric for the intent.

## First concrete backend waypoint · proposed

Define an opaque CredentialRef and a broker contract for **one** provider operation in a development environment. Identify a verified captain and one robot identity, choose existing protected custody tooling, and specify allowed/rejected actions, rotation/revocation, audit redaction and recovery tests. A stub metadata-only inventory can be reviewed before connecting any real credentials. Keep customer UI, trusted API and custody/operations responsibilities distinct.

No production values were moved, no accounts connected, and no credentials copied into a new store. Provider choice and first permitted operation remain open decisions. The existing [Ark access proposal](ARK-ACCESS-DESIGN.md) supplies the captain/duty/entitlement boundary; it is not enforcement code yet.

Sources checked:

- [Vite env/mode selection](https://vite.dev/guide/env-and-mode)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/concepts/security/openid-connect)
- [Cloudflare scoped API tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
