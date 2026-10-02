import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/components/layouts/page-layout'
import { Publication } from '@/features/publishing/publication'
export const Route = createFileRoute('/media/post')({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === 'string' ? search.id : '',
  }),
  head: () => ({ meta: [{ title: 'Publication · OnlyJah' }] }),
  component: Page,
})
function Page() {
  const { id } = Route.useSearch()
  return (
    <PageLayout title="Publication" eyebrow="Media">
      <Publication id={id} />
    </PageLayout>
  )
}
