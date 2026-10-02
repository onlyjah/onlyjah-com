import { createFileRoute } from '@tanstack/react-router'
import { PublicFeed } from '@/features/publishing/public-feed'
import { EditorialPage } from '@/routes/-templates/editorial-page'

export const Route = createFileRoute('/media/music')({
  head: () => ({ meta: [{ title: 'Music' + ' · OnlyJah' }] }),
  component: Page,
})

function Page() {
  return (
    <EditorialPage
      title="Music"
      eyebrow="Media / Music"
      description="Livity sounds."
      status="Resident artists"
      quotes={[]}
      related={[
        {
          title: 'Resident art',
          href: '/media/art',
          description: 'Explore the collection',
        },
        {
          title: 'In Jah’s words',
          href: '/docs/words',
          description: 'The source archive',
        },
      ]}
    >
      <PublicFeed kind="music" />
    </EditorialPage>
  )
}
