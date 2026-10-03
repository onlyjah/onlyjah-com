# Forge composition and OJ-Ark direction

Review: 2026-10-02 America/New_York, test branch baseline b379d0f. Editorial engineering notes, not quotations.

## Present workbench

Private Markdown drafts, typed collections, external media/gallery URLs, tags, revision-protected writes and publishing gates exist. RLS is the intended ownership boundary. Current draft discovery loads only the latest 100 posts. This review does not establish real member save/reload or two-account isolation; those remain acceptance gates. Binary upload/storage integration, a local offline vault, article/zine layouts, scoped personal service tokens, paid quota allocation and Stripe onboarding are absent.

The new slice adds loaded-draft search across titles/body/tags, plain-text blurb imports, word/character/reading-time statistics, and versioned JSON draft download/restore including links and tags. Restore creates unsaved new-draft input, strips account/authority/publication fields, validates its editable fields and requires an explicit save. Downloads reflect current unsaved text and attachment fields. Backups are plaintext user downloads; do not describe them as encrypted or already synced. Existing Markdown downloads remain available. No change to publishing grants or schema.

## Review findings

- docs/AUTHORING.md still describes the historical $7k organization proposal; AGENTS.md says it is superseded. Correct the active guide so onboarding does not implement obsolete qualification.
- Private source masters, docs/sources and handoff are ignored; never force-push private transcripts to the public repo. Save them in the durable document archive and later import under a verified personal identity.
- Gallery inputs support external URLs, not picture uploads. An upload flag or provisioned bucket is not a functioning owner-scoped upload service.
- Current publication metadata permits 12 embeds/images and eight tags per post. Archive notes need a separate index rather than cramming every source into public posts.
- Persistent draft search needs pagination or a server-authorized query; the current search intentionally says loaded posts.
- Article publication currently modifies the public record when editing a published work. A stronger suite should separate working revisions from the published snapshot.

## Editor choice

CodeMirror 6 is the recommended Markdown-first candidate for an Obsidian-like writing surface. Preserve Markdown as portable source. Tiptap is a rich-text alternative with MIT open-source components; advanced offerings have separate Pro/Cloud licensing. Do not assume packaged pagination, collaboration or export is free. Compare keyboard/mobile behavior, source fidelity, bundle size and offline operation in a bounded prototype before replacing the working editor. Obsidian itself is a product reference, not the component selected here.

References: https://codemirror.net/ and https://github.com/codemirror/lang-markdown; https://tiptap.dev/docs/editor/getting-started/overview (reviewed 2026-10-02).

## Implementation waypoints

1. Verify real member draft persistence and two-account isolation; then add owner-scoped binary intake with checksum, media metadata, quotas, upload reservations, failure cleanup and explicit publication controls. Preserve raw chat originals and derived blurbs separately.
2. Compose articles and zines from reusable notes/quotes/assets: linked references, backlinks, outline, split preview, autosave with recoverable revisions, and section/page ordering. Add print/PDF layout as a separate renderer with font/image rights and deterministic export; web publication and print pagination differ.
3. OJ-Ark is a proposed Basic Membership add-on: baseline 500 MB from the prior message, selectable requested capacity up to 1 TB here. Define price, units, usage/egress/processing budgets and cancellation/export policy. A slider requests an entitlement; only the backend can allocate it after verified eligibility/payment and capacity checks. Higher quotas never grant admin or unrestricted publishing rights.
4. Separate private personal archive objects from intentionally public static-hosting objects. Template/API access is a scoped capability. Custom-domain setup requires verified control. Domain registration, hosting and storage have separate lifecycle/cost concerns.
5. Trusted personal API broker: opaque revocable bearer secrets identify a credential whose hashed server record maps to owner, scopes, resources, expiration and limits. Do not put keys in URLs. Authenticate identity before resolving resources; endpoint spelling is not settled. Webhook delivery, polling and live streaming need distinct contracts. Signed links expire. Audit and revoke without exposing other users' content.
6. Upstream onlyjah/ark versus OnlyJah deployment: record a versioned deployment/interface contract. This review has not inspected upstream Ark or established that SO/IL is deployed. Maker clients, Raspberry Pi synchronization, cameras, sensor/OSC visualizers and authorized cross-site media are explicit use cases, not currently supported claims.
7. Exchange/payment flows need a separate trusted backend and a concrete offering, price, payout/rights policy and verified user identity. No paid provisioning, production publishing or DNS changes are part of this slice.

Next step: signed-in dev persistence/isolation verification, followed by an owner-scoped upload contract in the separate backend repository.
