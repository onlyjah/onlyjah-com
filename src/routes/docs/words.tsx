import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/components/layouts/page-layout'
import quotes from '@/content/quotes.json'
import { SourceQuote } from '@/features/editorial/source-quote'

export const Route = createFileRoute('/docs/words')({
  head: () => ({ meta: [{ title: 'In Jah’s words · OnlyJah' }] }),
  component: Words,
})

function Words() {
  return (
    <PageLayout
      title="In Jah’s words"
      eyebrow="Source archive"
      status="Source quotations"
      description="Messages supplied by Jah. Original wording and source references are preserved."
    >
      <div className="max-w-3xl space-y-6">
        {quotes.map((quote) => (
          <section
            key={quote.id}
            id={quote.id}
            className="scroll-mt-24 space-y-2"
          >
            <SourceQuote
              id={quote.id}
              title={quote.conversation}
              collapsible={false}
            />
            <p className="break-words px-1 font-mono text-xs text-muted-foreground">
              Source: {quote.source}
            </p>
          </section>
        ))}
      </div>
    </PageLayout>
  )
}
