import { lazy, Suspense, useState } from 'react'
import { LinkCard } from '@/components/blocks/link-card'
import { PageLayout } from '@/components/layouts/page-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Stage } from './model'
import { publicApi, usePublicIndex } from './use-public-index'

const GraphView = lazy(() => import('./graph-view'))
const stages: Stage[] = ['research', 'development', 'production', 'unverified']
export function ConstellationIndex() {
  const { snapshot, status } = usePublicIndex()
  const [query, setQuery] = useState('')
  const [stage, setStage] = useState<Stage | null>(null)
  const [graph, setGraph] = useState(false)
  const visible = snapshot.projects.filter(
    (p) =>
      (!stage || p.stage === stage) &&
      `${p.name} ${p.id} ${p.quote ?? ''}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  )
  const ids = new Set(visible.map((p) => p.id))
  const filtered = {
    ...snapshot,
    projects: visible,
    relationships: snapshot.relationships.filter(
      (e) => ids.has(e.source) && ids.has(e.target),
    ),
  }
  return (
    <PageLayout
      title="Constellation"
      eyebrow="Realm"
      description="the nebula generates stars."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-48 max-w-sm flex-1 space-y-2">
            <Label htmlFor="constellation-search">Search projects</Label>
            <Input
              id="constellation-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Button
            variant={graph ? 'default' : 'outline'}
            aria-pressed={graph}
            onClick={() => setGraph(!graph)}
          >
            Graph
          </Button>
        </div>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Project stage</legend>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={stage === null ? 'default' : 'outline'}
              aria-pressed={stage === null}
              onClick={() => setStage(null)}
            >
              All
            </Button>
            {stages.map((value) => (
              <Button
                key={value}
                size="sm"
                variant={stage === value ? 'default' : 'outline'}
                aria-pressed={stage === value}
                onClick={() => setStage(value)}
              >
                {value}
              </Button>
            ))}
          </div>
        </fieldset>
        <p role="status" className="text-sm text-muted-foreground">
          {visible.length} projects · {status}
        </p>
        {graph ? (
          <Suspense fallback={<p role="status">Loading graph…</p>}>
            <GraphView snapshot={filtered} />
          </Suspense>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((p) => (
              <LinkCard
                key={p.id}
                title={p.name}
                href={`/realm/constellation/${p.id}`}
                eyebrow={p.stage}
                description={
                  p.quote ? <blockquote>{p.quote}</blockquote> : undefined
                }
                footer={p.originId ? `Origin: ${p.originId}` : undefined}
              />
            ))}
          </div>
        )}
        {!visible.length && (
          <p className="rounded-xl border border-dashed p-6">
            No published projects match.
          </p>
        )}
        <div className="flex flex-wrap gap-4 text-sm">
          <a href="/realm" className="underline underline-offset-4">
            Realm
          </a>
          {publicApi && (
            <a
              href={`${publicApi}/openapi.json`}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              API contract ↗
            </a>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Public index pilot · private commands and financial automation
          inactive. Project stage does not verify revenue.
        </p>
      </div>
    </PageLayout>
  )
}
