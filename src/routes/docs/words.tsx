import { createFileRoute } from '@tanstack/react-router'
import { QuoteDictionary } from '../../components/quote-dictionary'

export const Route = createFileRoute('/docs/words')({
  validateSearch: (search: Record<string, unknown>): { word?: string } => ({ word: typeof search.word === 'string' ? search.word : '' }),
  component: Words,
  head: () => ({ meta: [{ title: 'In Jah’s words · OnlyJah' }] }),
})

function Words() {
  const { word } = Route.useSearch()
  return <QuoteDictionary selected={word} />
}
