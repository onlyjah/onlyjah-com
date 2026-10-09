import { createFileRoute } from '@tanstack/react-router'
import { ImageCard } from '@/components/blocks/image-card'
import { photos } from '@/content/photos'
import { products } from '@/content/products'
import { EditorialPage } from '@/routes/-templates/editorial-page'

export const Route = createFileRoute('/realm')({
  head: () => ({ meta: [{ title: 'Realm' + ' · OnlyJah' }] }),
  component: Page,
})

function Page() {
  return (
    <EditorialPage
      title="Realm"
      eyebrow="Connect"
      description={products.realm.description}
      status="Preview"
      quotes={[
        { id: products.realm.quoteId, title: 'Communications' },
        { id: 'jah-02', title: 'Connect and collaborate' },
        { id: 'jah-06', title: 'Anyone can collaborate' },
      ]}
      related={[
        { title: 'Constellation', href: '/realm/constellation' },
        {
          title: 'Community',
          href: '/realm/community',
          description: 'Conversations and Ketema invitations.',
        },
        { title: 'Market', href: '/market', description: 'OnlyJah listings.' },
        {
          title: 'Join OnlyJah',
          href: '/sign-up',
          description: 'Create an account',
        },
        {
          title: 'The ecosystem',
          href: '/docs/ecosystem',
          description: 'Documentation',
        },
      ]}
    >
      <div className="max-w-xl">
        <ImageCard {...photos.clouds} imageClassName="aspect-[4/3]" />
      </div>
    </EditorialPage>
  )
}
