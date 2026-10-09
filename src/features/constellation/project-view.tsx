import { LinkCard } from '@/components/blocks/link-card'
import { PageLayout } from '@/components/layouts/page-layout'
import { Badge } from '@/components/ui/badge'
import { publicApi, usePublicIndex } from './use-public-index'
export function ConstellationProject({ id }: { id: string }) {
  const { snapshot, status } = usePublicIndex()
  const project = snapshot.projects.find((p) => p.id === id)
  if (!project)
    return (
      <PageLayout title="Project unavailable">
        <a href="/realm/constellation">Constellation</a>
      </PageLayout>
    )
  const related = snapshot.relationships.filter(
    (e) => e.source === id || e.target === id,
  )
  const origin = snapshot.projects.find((p) => p.id === project.originId)
  return (
    <PageLayout
      title={project.name}
      eyebrow="Constellation"
      description={project.quote ?? undefined}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary">{project.stage}</Badge>
          <Badge variant="outline">{snapshot.authorityId}</Badge>
        </div>
        <p role="status" className="text-sm text-muted-foreground">
          {status}
        </p>
        <dl className="grid gap-3 rounded-xl border p-5 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-muted-foreground">Reference</dt>
          <dd className="break-all">
            {snapshot.authorityId}/{snapshot.orgId}/{project.id}
          </dd>
          <dt className="text-muted-foreground">Source</dt>
          <dd className="break-all">{project.source}</dd>
          <dt className="text-muted-foreground">Snapshot</dt>
          <dd>{snapshot.updatedAt}</dd>
          {origin && (
            <>
              <dt className="text-muted-foreground">Origin</dt>
              <dd>
                <a
                  href={`/realm/constellation/${origin.id}`}
                  className="underline"
                >
                  {origin.name}
                </a>
              </dd>
            </>
          )}
        </dl>
        <div className="grid gap-4 md:grid-cols-2">
          {related.map((edge) => {
            const other = snapshot.projects.find(
              (p) => p.id === (edge.source === id ? edge.target : edge.source),
            )
            if (!other) return null
            return (
              <LinkCard
                key={`${edge.source}:${edge.target}:${edge.type}`}
                title={other.name}
                href={`/realm/constellation/${other.id}`}
                eyebrow={edge.type}
                tags={[other.stage]}
              />
            )
          })}
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <a href="/realm/constellation" className="underline">
            Constellation
          </a>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Project destination ↗
            </a>
          )}
          {publicApi && (
            <a
              href={`${publicApi}/api/v1/public/projects/${project.id}`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              API reference ↗
            </a>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
