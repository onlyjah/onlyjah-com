import { Link } from '@tanstack/react-router'
import { useState, type ReactNode } from 'react'
import index from '../content/dictionary.json'
import { DictionaryText } from './dictionary-text'

type Quote = (typeof index.quotes)[number]
export function DictionaryBrowser({ selected = '', renderQuote, privateReferences }: {
  selected?: string
  renderQuote?: (quote: Quote) => ReactNode
  privateReferences?: (word: string) => ReactNode
}) {
  const [query, setQuery] = useState('')
  const word = index.entries.find(entry => entry.id === selected)
  const search = query.trim().toLocaleLowerCase('en')
  const visible = index.quotes.filter(quote => (!word || word.quoteIds.includes(quote.id)) && `${quote.text} ${quote.author} ${quote.conversation}`.toLocaleLowerCase('en').includes(search))
  const words = index.entries.filter(entry => entry.label.toLocaleLowerCase('en').includes(search))
  return <div className="dictionary-browser space-y-6">
    <nav aria-label="Dictionary"><a href="/docs/words">All quotes and words</a> · <a href="/dictionary/index.json">JSON index</a></nav>
    <label htmlFor="dictionary-search">Search words and quotes</label>
    <input id="dictionary-search" type="search" value={query} onChange={event => setQuery(event.target.value)} className="w-full rounded-md border bg-background p-3" />
    {word && <section aria-labelledby="dictionary-entry"><h2 id="dictionary-entry">{word.label}</h2><p>English · {word.quoteIds.length} matching quotes</p><p><a href={word.wikipedia} target="_blank" rel="noopener noreferrer">Wikipedia lookup</a> · <a href={word.etymonline} target="_blank" rel="noopener noreferrer">Etymonline lookup</a></p><p>Lookup links. Verified Wikipedia citations pending.</p>{privateReferences?.(word.label)}</section>}
    <details open={Boolean(search)}><summary>{index.entries.length} indexed words and phrases</summary><div className="flex flex-wrap gap-3">{words.map(entry => <Link key={entry.id} to="/docs/words" search={{ word: entry.id }}>{entry.label}</Link>)}</div></details>
    <p role="status">{visible.length} matching quotes · {index.quoteCount} in this public edition</p>
    <p>English first. Other languages pending.</p>
    <div className="space-y-6">{visible.map(quote => <article key={quote.id} id={quote.id} className="scroll-mt-24">{renderQuote ? renderQuote(quote) : <><blockquote><DictionaryText text={quote.text} context="onlyjah" /></blockquote><p>{quote.author} · {quote.date} · {quote.conversation}</p><a href={`/docs/words#${quote.id}`}>{quote.id}</a></>}</article>)}</div>
  </div>
}
