import index from '../content/dictionary.json'
import { DictionaryBrowser } from './dictionary-browser'

export function QuoteDictionary({ selected = '' }: { selected?: string }) {
  return <main className="quote-page"><nav aria-label="Site"><a href="/">OnlyJah</a></nav><h1>OnlyJah dictionary</h1><DictionaryBrowser selected={selected} privateReferences={word => <a href={`https://test.onlyjah.com/docs/words?word=${encodeURIComponent(index.entries.find(entry => entry.label === word)?.id ?? '')}`}>Sign in to Forge on the test site for private references</a>} /></main>
}
