import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { occurrences } from '../src/lib/dictionary.ts'

const read = async (path) => JSON.parse(await readFile(path, 'utf8'))
const quotes = await read('src/content/quotes.json')
const terms = await read('src/content/terms.json')
const speakers = await read('content/dictionary-speakers.json')
const byLabel = new Map()
for (const term of terms)
  byLabel.set(term.label.toLocaleLowerCase('en'), { ...term, curated: true })
for (const quote of quotes)
  for (const match of quote.text.matchAll(
    /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu,
  )) {
    const label = match[0].toLocaleLowerCase('en')
    if (!byLabel.has(label))
      byLabel.set(label, {
        id: `en-${encodeURIComponent(label)}`,
        label,
        curated: false,
        related: [],
      })
  }
const entries = [...byLabel.values()]
  .map((term) => {
    const aliases = [...new Set([term.label, ...term.label.split(/\s+\/\s+/u)])]
    if (term.id === 'flowthrough') aliases.push('flow through')
    return {
      id: term.id,
      label: term.label,
      language: 'en',
      aliases,
      curated: term.curated,
      quoteIds: quotes
        .filter((quote) => occurrences(quote.text, aliases).length)
        .map((quote) => quote.id),
      related: term.related,
      wikipedia: `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(term.label)}`,
      etymonline: `https://www.etymonline.com/search?q=${encodeURIComponent(term.label)}`,
    }
  })
  .sort((a, b) => a.label.localeCompare(b.label, 'en'))
function speakerId(quote) {
  const speaker = speakers.find((item) =>
    item.authorLabels.includes(quote.author),
  )
  assert.ok(speaker, `Unregistered speaker: ${quote.author}`)
  return speaker.id
}
const index = {
  schemaVersion: 1,
  speakers,
  edition: '2026-10-08',
  languages: ['en'],
  otherLanguages: 'pending',
  coverage:
    'Selected public corpus only; private master reconciliation pending.',
  quoteCount: quotes.length,
  corpusSha256: createHash('sha256')
    .update(JSON.stringify(quotes))
    .digest('hex'),
  citationSupport: {
    wikipedia: 'lookup-links-only',
    verifiedCitations: 'pending',
  },
  entries,
  // A publication manifest is the allowlist. No contributor is automatically trusted.
  quotes: quotes.map((quote) => ({
    ...quote,
    speakerId: speakerId(quote),
    language: 'en',
    sourceKind: 'author-supplied',
    publicationBasis: 'public-copy-manifest',
    citations: [],
  })),
}
const encoded = `${JSON.stringify(index, null, 2)}\n`
await mkdir('public/dictionary', { recursive: true })
for (const path of [
  'src/content/dictionary.json',
  'public/dictionary/index.json',
]) {
  if (process.argv.includes('--check'))
    assert.equal(
      await readFile(path, 'utf8'),
      encoded,
      `${path}: stale dictionary index`,
    )
  else await writeFile(path, encoded)
}
console.log(
  `${entries.length} English entries; ${quotes.length} selected quotes; every exact-form occurrence indexed.`,
)
