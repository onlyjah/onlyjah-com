import { createFileRoute } from '@tanstack/react-router'
import { LinkCard } from '@/components/blocks/link-card'
import { PageLayout } from '@/components/layouts/page-layout'
import terms from '@/content/terms.json'

export const Route = createFileRoute('/docs/terms/')({
  head: () => ({ meta: [{ title: 'Vocabulary · OnlyJah' }] }),
  component: () => (
    <PageLayout title="Vocabulary" eyebrow="Ark / Documentation">
      <div className="grid gap-4 md:grid-cols-2">
        {terms.map((term) => (
          <LinkCard
            key={term.id}
            title={term.label}
            href={`/docs/terms/${term.id}`}
          />
        ))}
      </div>
    </PageLayout>
  ),
})
