import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { occurrences, dictionaryLinks } from '../src/lib/dictionary.ts'
const entry = (id, label) => ({ id, label, aliases: [label], language: 'en', curated: true })
test('exact forms respect case and Unicode word boundaries', () => {
  assert.equal(occurrences('Ark ark dark arks Arké', ['ark']).length, 2)
  assert.equal(occurrences('flowthrough; flow through.', ['flowthrough', 'flow through']).length, 2)
})
test('context and protected URLs preserve ordinary text', () => {
  const entries = [entry('ark', 'ark'), entry('onlyjah', 'OnlyJah')]
  assert.equal(dictionaryLinks('An ark. OnlyJah.', entries).length, 1)
  assert.equal(dictionaryLinks('An ark. OnlyJah.', entries, 'onlyjah').length, 2)
  assert.equal(dictionaryLinks('https://onlyjah.com `OnlyJah` jah@onlyjah.com', entries, 'onlyjah').length, 0)
})
test('longest phrase wins without overlapping links', () => {
  const links = dictionaryLinks('digital sovereignty', [entry('sovereignty', 'sovereignty'), entry('digital-sovereignty', 'digital sovereignty')], 'onlyjah')
  assert.deepEqual(links.map(link => link.id), ['digital-sovereignty'])
})
test('published index exhaustively matches the selected corpus and has no invented citations', async () => {
  const index = JSON.parse(await readFile('public/dictionary/index.json', 'utf8'))
  const quotes = JSON.parse(await readFile('src/content/quotes.json', 'utf8'))
  assert.equal(index.quoteCount, quotes.length)
  for (const entry of index.entries) assert.deepEqual(entry.quoteIds, quotes.filter(quote => occurrences(quote.text, entry.aliases).length).map(quote => quote.id))
  assert.ok(index.quotes.every(quote => quote.source && quote.speakerId && quote.citations.length === 0))
  assert.deepEqual(index.quotes.map(({ speakerId, language, sourceKind, publicationBasis, citations, ...quote }) => quote), quotes)
})

test('primary word labels win over a competing grouped alias', () => {
  const grouped = { ...entry('alignment', 'purpose / support alignment'), aliases: ['purpose / support alignment', 'purpose', 'support alignment'] }
  assert.equal(dictionaryLinks('Purpose', [grouped, entry('purpose', 'purpose')], 'onlyjah')[0].id, 'purpose')
})
