import { createFileRoute } from '@tanstack/react-router'
import { ImageCard } from '@/components/blocks/image-card'
import { photos } from '@/content/photos'
import { products } from '@/content/products'
import { EditorialPage } from '@/routes/-templates/editorial-page'

export const Route = createFileRoute('/p/ark')({
  head: () => ({ meta: [{ title: 'Ark' + ' · OnlyJah' }] }),
  component: Page,
})

function Page() {
  return (
    <EditorialPage
      title="Ark"
      eyebrow="Project"
      description={products.ark.description}
      status="Working direction"
      quotes={[
        { id: products.ark.quoteId, title: 'Account patterns · planned' },
        { id: 'jah-01', title: 'A universe in the sky' },
        { id: 'jah-03', title: 'Twin stars' },
        { id: 'testing-incubation', title: 'OnlyJah / jahnoah.lol' },
      ]}
      related={[
        {
          title: 'Ark and interoperability',
          href: '/docs/ark',
          description: 'Documentation',
        },
        {
          title: 'Ark Notes 001',
          href: '/media/news/ark-notes-001',
          description: 'Draft for review',
        },
      ]}
    >
      <ImageCard
        {...photos.earthrise}
        imageClassName="aspect-[2/1] object-contain bg-black"
      />
    </EditorialPage>
  )
}
