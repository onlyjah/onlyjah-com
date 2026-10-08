import { createFileRoute } from '@tanstack/react-router'
import { DictionaryBrowser } from '@/components/dictionary-browser'
import { PageLayout } from '@/components/layouts/page-layout'
import { PrivateReferences } from '@/features/dictionary/private-references'
import { SourceQuote } from '@/features/editorial/source-quote'

export const Route = createFileRoute('/docs/words')({
  validateSearch: (search: Record<string, unknown>): { word?: string } => ({
    word: typeof search.word === 'string' ? search.word : '',
  }),
  head: () => ({ meta: [{ title: 'In Jah’s words · OnlyJah' }] }),
  component: Words,
})

function Words() {
  const { word } = Route.useSearch()
  return (
    <PageLayout title="OnlyJah dictionary" eyebrow="Words and sources">
      <DictionaryBrowser
        selected={word}
        renderQuote={(quote) => (
          <SourceQuote
            id={quote.id}
            title={quote.conversation}
            collapsible={false}
          />
        )}
        privateReferences={(label) => <PrivateReferences word={label} />}
      />
    </PageLayout>
  )
}
