import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/components/layouts/page-layout'
import { PublicArtist } from '@/features/artists/artist-profile'
export const Route = createFileRoute('/artist')({
  validateSearch: (search: Record<string, unknown>) => ({
    name: typeof search.name === 'string' ? search.name : '',
  }),
  head: () => ({ meta: [{ title: 'Resident artist · OnlyJah' }] }),
  component: Page,
})
function Page() {
  const { name } = Route.useSearch()
  return (
    <PageLayout title="Resident artist" eyebrow="Media / Artists">
      <PublicArtist slug={name} />
    </PageLayout>
  )
}
