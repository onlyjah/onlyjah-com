import { createFileRoute } from '@tanstack/react-router'
import { Markdown } from '@/components/blocks/markdown'
import { PageLayout } from '@/components/layouts/page-layout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { arkNotes } from '@/content/manual'

export const Route = createFileRoute('/media/news_/ark-notes-001')({
  head: () => ({
    meta: [
      { title: `${arkNotes.title} · OnlyJah` },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: Draft,
})

function Draft() {
  return (
    <PageLayout
      title={arkNotes.title}
      eyebrow="Captain’s log"
      status="Draft for review"
    >
      <Alert>
        <AlertTitle>Draft for review</AlertTitle>
        <AlertDescription>
          Not published. Quotations are sourced; implementation notes and
          interview gaps are labeled.
        </AlertDescription>
      </Alert>
      <Markdown>{arkNotes.body}</Markdown>
    </PageLayout>
  )
}
