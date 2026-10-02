import { createFileRoute } from '@tanstack/react-router'
import { Newspaper } from 'lucide-react'
import { EmptyState } from '@/components/blocks/empty-state'
import { LinkCard } from '@/components/blocks/link-card'
import { PageLayout } from '@/components/layouts/page-layout'
import { Section } from '@/components/sections/section'

export const Route = createFileRoute('/media/news')({
  head: () => ({ meta: [{ title: 'News · OnlyJah' }] }),
  component: News,
})

function News() {
  return (
    <PageLayout title="News" eyebrow="Media / News">
      <EmptyState
        title="The logbook is open"
        description="No articles published yet."
        icon={<Newspaper />}
      />
      <Section title="Drafts">
        <div className="max-w-xl">
          <LinkCard
            title="Ark Notes 001: The First Bearing"
            href="/media/news/ark-notes-001"
            eyebrow="Captain’s log"
            tags={['Draft for review']}
          />
        </div>
      </Section>
    </PageLayout>
  )
}
