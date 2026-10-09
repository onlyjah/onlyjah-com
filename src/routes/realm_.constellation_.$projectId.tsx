import { createFileRoute } from '@tanstack/react-router'
import { ConstellationProject } from '@/features/constellation/project-view'
export const Route = createFileRoute('/realm_/constellation_/$projectId')({
  head: () => ({ meta: [{ title: 'Project · Constellation · OnlyJah' }] }),
  component: Project,
})
function Project() {
  const { projectId } = Route.useParams()
  return <ConstellationProject id={projectId} />
}
