import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/components/layouts/page-layout'
import { Community } from '@/features/community/community'
export const Route = createFileRoute('/realm_/community')({
  head: () => ({
    meta: [
      { title: 'Community · OnlyJah' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: () => (
    <PageLayout title="Community" eyebrow="Realm / Conversations">
      <Community />
    </PageLayout>
  ),
})
