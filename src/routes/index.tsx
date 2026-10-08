import { createFileRoute } from '@tanstack/react-router'
import quotes from '../content/quotes.json'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <main className="quote-page">
    <h1>{quotes.find((quote) => quote.id === 'jah-14')?.text}</h1>
    <p>{quotes.find((quote) => quote.id === 'snippet-purpose')?.text}</p>
    <p><a href="/docs/words">In Jah’s words</a></p>
    <a href="mailto:jahnoah@onlyjah.com">Email JahNoah for inquiries.</a>
    </main>
}
