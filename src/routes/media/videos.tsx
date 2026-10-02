import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/components/layouts/page-layout'
import { PublicFeed } from '@/features/publishing/public-feed'
export const Route = createFileRoute('/media/videos')({
  head: () => ({ meta: [{ title: 'Videos · OnlyJah' }] }),
  component: () => (
    <PageLayout title="Videos" eyebrow="Media / Videos">
      <PublicFeed kind="video" />
    </PageLayout>
  ),
})
