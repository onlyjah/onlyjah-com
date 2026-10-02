import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/components/layouts/page-layout'
import { CardGrid } from '@/components/sections/card-grid'
import { PublicFeed } from '@/features/publishing/public-feed'
export const Route = createFileRoute('/media/art')({
  head: () => ({ meta: [{ title: 'Resident art · OnlyJah' }] }),
  component: () => (
    <PageLayout title="Resident art" eyebrow="Media / Art">
      <CardGrid
        title="Explore the collection"
        items={[
          {
            title: 'Music',
            href: '/media/music',
            description: 'Livity sounds.',
          },
          { title: 'Videos', href: '/media/videos' },
          { title: 'Create a draft', href: '/forge' },
        ]}
      />
      <PublicFeed target="personal" />
    </PageLayout>
  ),
})
