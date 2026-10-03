# Dependency verification

Engineering audit, 3 October 2026.

The frontend has exact direct package versions and one authoritative pnpm lockfile. React types match React 19.3. Native TanStack prerendering replaced the Nitro beta dependency after the full static build and HTTP checks passed. Node 24 is the intended LTS/CI target; the available workstation verification runtime was Node 26.10.0.

The final production audit reports no known advisories. The full development audit reports one high-severity advisory in braces 3.0.3, pulled in by shadcn's CLI through fast-glob/micromatch. The reviewed advisory has no patched version. It concerns deeply nested untrusted glob patterns; this package is not shipped as the browser app or run by the static hosting server. Do not present the full dependency tree as vulnerability-free or silently override it to a nonexistent fixed version. Review upstream shadcn/braces updates before changing the pin and avoid feeding untrusted registry/pattern input to the CLI.

[Reviewed advisory and current patch status](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). Re-run pnpm audit after meaningful dependency changes; dates and results here are snapshots, not a permanent guarantee. The private handoff contains the exact audit JSON and build output.
