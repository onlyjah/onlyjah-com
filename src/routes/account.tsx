import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/components/layouts/page-layout'
import { Account } from '@/features/auth/account'

export const Route = createFileRoute('/account')({
  head: () => ({
    meta: [
      { title: 'Account · OnlyJah' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: () => (
    <PageLayout title="Account" eyebrow="OnlyJah">
      <Account />
    </PageLayout>
  ),
})
