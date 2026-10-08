import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { dictionaryLinks, occurrences } from '../src/lib/dictionary.ts'

const entry = (id, label) => ({
  id,
  label,
  aliases: [label],
  language: 'en',
  curated: true,
})
test('exact forms respect case and Unicode word boundaries', () => {
  assert.equal(occurrences('Ark ark dark arks Arké', ['ark']).length, 2)
  assert.equal(
    occurrences('flowthrough; flow through.', ['flowthrough', 'flow through'])
      .length,
    2,
  )
})
test('context and protected URLs preserve ordinary text', () => {
  const entries = [entry('ark', 'ark'), entry('onlyjah', 'OnlyJah')]
  assert.equal(dictionaryLinks('An ark. OnlyJah.', entries).length, 1)
  assert.equal(
    dictionaryLinks('An ark. OnlyJah.', entries, 'onlyjah').length,
    2,
  )
  assert.equal(
    dictionaryLinks(
      'https://onlyjah.com `OnlyJah` jah@onlyjah.com',
      entries,
      'onlyjah',
    ).length,
    0,
  )
})
test('longest phrase wins without overlapping links', () => {
  const links = dictionaryLinks(
    'digital sovereignty',
    [
      entry('sovereignty', 'sovereignty'),
      entry('digital-sovereignty', 'digital sovereignty'),
    ],
    'onlyjah',
  )
  assert.deepEqual(
    links.map((link) => link.id),
    ['digital-sovereignty'],
  )
})
test('published index exhaustively matches the selected corpus and has no invented citations', async () => {
  const index = JSON.parse(
    await readFile('public/dictionary/index.json', 'utf8'),
  )
  const quotes = JSON.parse(await readFile('src/content/quotes.json', 'utf8'))
  assert.equal(index.quoteCount, quotes.length)
  for (const entry of index.entries)
    assert.deepEqual(
      entry.quoteIds,
      quotes
        .filter((quote) => occurrences(quote.text, entry.aliases).length)
        .map((quote) => quote.id),
    )
  assert.ok(
    index.quotes.every(
      (quote) =>
        quote.source && quote.speakerId && quote.citations.length === 0,
    ),
  )
  assert.deepEqual(
    index.quotes.map(
      ({
        speakerId,
        language,
        sourceKind,
        publicationBasis,
        citations,
        ...quote
      }) => quote,
    ),
    quotes,
  )
})
test('Markdown leaves existing links, code, and HTML untouched', async () => {
  const { remarkDictionaryLinks } = await import(
    '../src/lib/remark-dictionary.ts'
  )
  const tree = {
    type: 'root',
    children: [
      { type: 'paragraph', children: [{ type: 'text', value: 'OnlyJah' }] },
      {
        type: 'link',
        url: 'https://example.org',
        children: [{ type: 'text', value: 'OnlyJah' }],
      },
      { type: 'inlineCode', value: 'OnlyJah' },
      { type: 'html', value: '<b>OnlyJah</b>' },
    ],
  }
  remarkDictionaryLinks({ entries: [entry('onlyjah', 'OnlyJah')] })(tree)
  assert.equal(tree.children[0].children[0].type, 'link')
  assert.equal(tree.children[1].children[0].type, 'text')
  assert.equal(tree.children[2].value, 'OnlyJah')
  assert.equal(tree.children[3].value, '<b>OnlyJah</b>')
})
