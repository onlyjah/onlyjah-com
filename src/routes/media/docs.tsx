import { createFileRoute, Link } from '@tanstack/react-router'
import { PageLayout } from '@/components/layouts/page-layout'
import { Button } from '@/components/ui/button'
// Keep old inbound links usable without putting documentation back in Media navigation.
export const Route = createFileRoute('/media/docs')({
  head: () => ({
    meta: [
      { title: 'Documentation · OnlyJah' },
      { name: 'robots', content: 'noindex, follow' },
    ],
    links: [{ rel: 'canonical', href: '/docs' }],
  }),
  component: () => (
    <PageLayout
      title="Documentation"
      description="The living manual is at /docs."
    >
      <Button
        render={<Link to="/docs">Browse the manual</Link>}
        nativeButton={false}
      />
    </PageLayout>
  ),
})
