# Frontend structure and theme

Current implementation, 2 October 2026. Earlier UI and scripts are preserved in `handoff/redesign-baseline/2026-10-02-before-shadcn-redesign.tar.gz`.

| Location | Responsibility |
| --- | --- |
| `src/routes` | URL declarations, page composition, metadata |
| `src/routes/-templates` | Shared page templates; the `-` prefix excludes them from route generation |
| `src/components/ui` | Official shadcn Base UI primitives, generated with the pinned CLI and `base-nova` style |
| `src/components/blocks` | Portable page headers, cards, Markdown, navigation and empty states; content arrives through props |
| `src/components/sections` | Portable compositions of blocks and UI components |
| `src/components/layouts` | Page framing and slots |
| `src/features` | Quotation lookup, Clerk integration, private profiles, authoring, public artist collections, Market and community data adapters |
| `src/content` | Typed records, source quotations, and Markdown imports |
| `docs/manual`, `docs/drafts`, `docs/sources` | Public chapter sources, review draft, and attributed words |

Keep app names, provider hooks, data fetching, and route-specific text out of generic blocks/sections. Use features or routes to adapt them. Add a section only when composition needs reuse; do not create another page wrapper for every URL.

Eight chapters share `/docs/$slug`. Unknown chapters throw the router’s not-found result. Templates are ordinary React compositions, not fake navigable routes.

## tweakcn

`src/theme.css` contains the replaceable `:root` and `.dark` token blocks. Paste the corresponding blocks from a tweakcn shadcn CSS export here. `src/styles.css` owns Tailwind/shadcn/Clerk imports and the `@theme inline` utility mappings; preserve that scaffold when changing the palette.

Components use semantic utilities (`bg-card`, `text-primary`, `border-border`), not `oj-*` classes or hard-coded brand colors. The current provisional tokens preserve red, gold, green, and black. The app follows the device theme until the visitor chooses light or dark. A paste changes colors, fonts, and radius across the UI; Clerk uses the official shadcn theme and the same radius/font variables. Exported font names still need an appropriate installed/system font or a separately approved font asset.

The old custom stylesheet is removed. Avoid copying additional global styles into pages. Jah's latest request is implemented with warmer cream/forest/gold tokens, rounder cards and modestly smaller page spacing. `/design-preview` applies separate review-only semantic token overrides from `src/features/design/palette-proposal.ts`; those tokens do not alter other pages. It compares current versus smaller typography/card spacing in light and dark modes. A credited CC BY-SA forest photograph was added; no AI pictures were generated.

The header theme toggle uses the existing shadcn Button. The generic ThemeProvider defaults to device preference, persists explicit light/dark choices, tracks device changes in system mode, and synchronizes preferences across tabs. An early fixed script sets the root class before CSS paints; no user content is inserted into that script. This adaptation handles prerendering and blocked storage rather than copying the browser-only Vite example wholesale. A host enforcing strict CSP will need a hash/nonce for the inline initialization script. Light-mode gold was darkened for readable text contrast.

## Component review

The 13 `components/ui` files are official base-nova shadcn/Base UI output, formatted with Biome, with two documented source adjustments: Label explicitly forwards htmlFor/children; BreadcrumbPage uses aria-current without pretending a span is a link or disabled control. They are not byte-for-byte untouched upstream files. Styling customizations live in theme tokens or composition props/classes. Regeneration must preserve/review these two small adjustments; it should not silently overwrite them.

Generic blocks/sections/layouts contain no Clerk/Neon calls or product content. The reviewed Section now renders a description even without a title/action, ImageCard accepts its license from content rather than assuming public domain, and PageHeader supports h1/h2 so comparison frames maintain heading hierarchy. Brief comments explain non-obvious composition and browser behavior. Native anchor links make these blocks portable, though internal navigation currently performs normal document requests rather than TanStack client transitions; an injected link renderer can be considered when another app needs it.

The reusable MarkdownEditor receives values/callbacks; the Forge feature owns draft import limits, session state, saving and permissions. External media players/gallery images load only after a reader chooses them. Authoring Markdown disables raw HTML and presents inline image references as links rather than automatically fetching them. Provider tokens stay in memory and never enter static HTML or localStorage.

Penpot remains useful for hand-designed boards and linked interaction flows. For fast review of this app, use the browser comparison: it reflects actual type, wrapping, focus behavior, and responsive constraints. Approve a variant before applying its density/palette broadly. Generated pictures can communicate mood if Jah explicitly requests them, but cannot validate responsive layout, component behavior, or legible text. [Penpot prototyping](https://help.penpot.app/user-guide/prototyping-testing/prototyping/), [shadcn dark mode](https://ui.shadcn.com/docs/dark-mode/vite).

## Content

React Markdown and remark-gfm render versioned Markdown with shadcn tables/cards and readable headings. Raw HTML is not enabled. The Python compiler, generated HTML JSON, and `dangerouslySetInnerHTML` wrapper are removed.

Source quotations remain exact. Longer card quotations expand with a button; `/docs/words` shows the selected public excerpts, with mature variants behind an opt-in. Private planning excerpts are excluded. Editorial headings and implementation notes are distinct from Jah’s words.

## Commands

```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm dev
pnpm check
pnpm preview
```

Use Node 22.12+; this change was checked under Node 24.19.0 and pnpm 12.5.1. No dependency install hook is required for the inspected stack. `pnpm preview` serves only built files at localhost:8080. `pnpm dev` uses the development URL printed by Vite (normally localhost:3000).

`pnpm check` builds before typechecking so Start regenerates route types when a new route is added. This prevents stale route declarations from rejecting a valid new URL during the first check.

Nitro is retained as the installed Start build/prerender adapter and moved to development dependencies. It is not needed on the static host. `pnpm start` runs the small static file server used by Railway; it does not execute the application SSR server. Keep static checks: they verify actual rendered pages, links/assets, draft metadata, direct requests, and 404s rather than a shared empty shell.

`pnpm-workspace.yaml` holds single-package install policy, not workspace packages. The unused core-js install hook is explicitly denied. Recent-release exceptions are restricted to the exact verified Clerk versions selected in this change.
