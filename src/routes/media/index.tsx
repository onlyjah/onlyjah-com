import { createFileRoute } from '@tanstack/react-router'
import { ImageCard } from '@/components/blocks/image-card'
import { Section } from '@/components/sections/section'
import { photos } from '@/content/photos'
import { products } from '@/content/products'
import { PublicFeed } from '@/features/publishing/public-feed'
import { EditorialPage } from '@/routes/-templates/editorial-page'

export const Route = createFileRoute('/media/')({
  head: () => ({ meta: [{ title: 'Media' + ' · OnlyJah' }] }),
  component: Page,
})

function Page() {
  return (
    <EditorialPage
      title="Media"
      eyebrow="Publish"
      description={products.media.description}
      status="Working direction"
      quotes={[
        { id: products.media.quoteId, title: 'Media distribution' },
        { id: 'jah-04', title: 'Flow between projects' },
      ]}
      related={[
        {
          title: 'Resident art',
          href: '/media/art',
          description: 'Music, galleries, moving images and words.',
        },
        {
          title: 'Music',
          href: '/media/music',
          description: 'Livity sounds',
        },
        { title: 'News', href: '/media/news', description: 'The logbook' },
        {
          title: 'Videos',
          href: '/media/videos',
          description: 'The video collection',
        },
      ]}
    >
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_18rem]">
        <Section title="Featured by OnlyJah">
          <PublicFeed target="onlyjah" featured />
        </Section>
        <ImageCard {...photos.canopy} imageClassName="aspect-[4/3]" />
      </div>
      <Section title="OnlyJah publications">
        <PublicFeed target="onlyjah" />
      </Section>
    </EditorialPage>
  )
}
