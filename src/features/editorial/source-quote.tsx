import { QuoteCard } from '@/components/blocks/quote-card'
import { useContentPreferences } from '@/components/providers/content-preferences'
import { Card, CardContent } from '@/components/ui/card'
import quotes from '@/content/quotes.json'
import { displayText } from '@/lib/display-text'

export function SourceQuote({
  id,
  title,
  collapsible = true,
}: {
  id: string
  title?: string
  collapsible?: boolean
}) {
  const { mature } = useContentPreferences()
  const quote = quotes.find((item) => item.id === id)
  if (!quote) throw new Error(`Unknown source quotation: ${id}`)
  if (quote.content_warnings.length && !mature)
    return (
      <Card>
        <CardContent>
          <p>
            Mature or suggestive content. Use the mature content toggle to opt
            in.
          </p>
        </CardContent>
      </Card>
    )
  return (
    <QuoteCard
      text={displayText(quote.text)}
      author={quote.author}
      title={title}
      collapsible={collapsible}
      citation={{
        href: `/docs/words#${id}`,
        label: `${quote.conversation} · ${quote.date}`,
      }}
    />
  )
}
