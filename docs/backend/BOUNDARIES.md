# Runtime boundaries

This file points to the current [stack](../STACK.md) and [access contract](ARK-ACCESS-DESIGN.md). The previous narrative, including the resolved development authentication failures, is preserved in docs/history and dated handoff logs.

The portable public frontend receives only public configuration. React components, blocks and sections receive props; provider-aware features use narrow HTTP clients. Clerk verifies member identity; Neon verifies tokens and grants/RLS enforce ownership and collaboration. Private records are fetched after sign-in and are never prerendered.

Migrations 001, 002, 003 and 005 are effective on the explicitly selected Neon development branch. Migration 004 records an attempted managed-schema grant that did not take effect. Its invoker-only repair is 005. Add subsequent changes with a new migration; never replace Neon's managed identity function. Publishing, paid features and stewardship duties remain separate.

Storage objects, payment credentials and organization actions need a separate trusted backend. The private development bucket is a provisioned resource, not proof of a functioning upload flow. An empty entitlement table is not a paid subscription implementation.

No production schema, credentials, domains or deployment are part of the authorized testing scope. Historical Convex and Railway PostgreSQL services were not deleted; they are not required by this frontend and should be assessed separately before retirement.
