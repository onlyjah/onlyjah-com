# Ark access contract

Current direction, 2 October 2026. This replaces the earlier qualification and broad admin proposal; its original remains in docs/history.

| Capability | Authority | Scope |
| --- | --- | --- |
| Private profile and drafts | Verified Clerk subject | Own records only |
| Public profile | Member opt-in | Public name, bio and stable handle; private account data stays private |
| Personal publication | Explicit reviewed grant or unexpired `personal_publish` feature | Own posts under own public profile |
| Marketplace publication | Unexpired `marketplace_post` feature, or existing explicit curator grant | Own offering, request or swap rows; no checkout is implied |
| OnlyJah publication / curation | Explicit publication grant | Separate from paid Contributor features |
| Shared Forge item | Owner or named editor | Project, document, task, request, offering or swap; only owner changes collaborators |
| Community comment moderation | `comment_moderate` duty for `community` | Remove community messages, not blogs, accounts or private Ketema messages |
| Organization creation | `organization_create` duty for `onlyjah`, plus trusted provider action | Only verified adam / Jah Noah IDs may receive the duty |
| File uploads | `file_upload` feature plus scoped trusted storage authorization | Private namespaced objects; credentials never enter the frontend |

Migration 006 adds entitlement and duty records but grants no existing person a feature or duty. Entitlements have mandatory expiry and source references. Signed-in members can read their own records and cannot assign, renew or forge them. Trusted billing sync is not implemented by this migration; paid access stays inactive until the separate service and provider configuration exist.

Existing curator grants remain explicit compatibility permissions. They do not grant organization creation or account impersonation. No role is inferred from email, payment, display name or aliases. Confirm exact Clerk subject IDs before privileged grants. Signup must not require creating an organization. Personal subscriptions must remain available independently of organization membership.

Class E realm walker candidate is Jah's requested concept. Draft benefits for his approval: participation in request practice, progress notes, partner curriculum links and a mentor review queue. No invented monetary amount, paid boost, automatic rank promotion or admin right is active. Candidate progression needs Jah's criteria and an approval record.

Ketema is separately invited. Matrix federation, recovery custody, fleet access and robot credentials remain future contracts. They do not inherit broad member or moderator rights.
