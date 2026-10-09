import { createFileRoute } from '@tanstack/react-router'
import { products } from '@/content/products'
import { SourceArchive } from '@/features/archive/source-archive'
import { Workbench } from '@/features/publishing/workbench'
import { Workspace } from '@/features/workspace/workspace'
import { EditorialPage } from '@/routes/-templates/editorial-page'

export const Route = createFileRoute('/forge')({
  head: () => ({ meta: [{ title: 'Forge' + ' · OnlyJah' }] }),
  component: Page,
})

function Page() {
  return (
    <EditorialPage
      title="Forge"
      eyebrow="Create"
      description={products.forge.description}
      status="Private drafts"
      quotes={[
        { id: products.forge.quoteId, title: 'Project management' },
        { id: 'jah-02', title: 'Create and publish' },
      ]}
      related={[
        { title: 'Ark', href: '/ark', description: 'Project' },
        {
          title: 'The ecosystem',
          href: '/docs/ecosystem',
          description: 'Documentation',
        },
      ]}
    >
      <Workbench />
      <SourceArchive />
      <Workspace scope="forge" />
    </EditorialPage>
  )
}
