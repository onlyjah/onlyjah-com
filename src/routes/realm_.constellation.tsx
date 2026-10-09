import { createFileRoute } from '@tanstack/react-router'
import { ConstellationIndex } from '@/features/constellation/index-view'
export const Route = createFileRoute('/realm_/constellation')({
  head: () => ({ meta: [{ title: 'Constellation · Realm · OnlyJah' }] }),
  component: ConstellationIndex,
})
