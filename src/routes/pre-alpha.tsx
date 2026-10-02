import { createFileRoute } from '@tanstack/react-router'
import { EditorialPage } from '@/routes/-templates/editorial-page'

export const Route = createFileRoute('/pre-alpha')({
  head: () => ({ meta: [{ title: 'Pre-alpha' + ' · OnlyJah' }] }),
  component: Page,
})

function Page() {
  return (
    <EditorialPage
      title="Pre-alpha"
      eyebrow="Get involved"
      description="Connect and collaborate with others."
      status="Pre-alpha"
      quotes={[
        { id: 'jah-06', title: 'Make cool things' },
        { id: 'jah-11', title: 'Sustainability' },
      ]}
      related={[
        {
          title: 'Create an account',
          href: '/sign-up',
          description: 'Join OnlyJah',
        },
        {
          title: 'Access and sustainability',
          href: '/docs/access',
          description: 'Documentation',
        },
        {
          title: 'Contact OnlyJah',
          href: 'mailto:onlyjah@pm.me?subject=OnlyJah%20pre-alpha%20interest',
          description: 'onlyjah@pm.me',
        },
      ]}
    />
  )
}
