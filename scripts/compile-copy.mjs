// Only selected, sourced passages enter the frontend. The editorial archive stays private.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { verifyPublicCopy } from './verify-public-copy.mjs'

const root = 'docs/content-review/'
const read = async (path) => JSON.parse(await readFile(path, 'utf8'))
let master = null
try {
  if (!process.argv.includes('--manifest'))
    master = await read(`${root}content/master-quotes.json`)
} catch (cause) {
  if (cause.code !== 'ENOENT') throw cause
}
const manifestPath = 'content/public-copy-manifest.json'
const stage = process.env.COPY_STAGE ?? 'published'
if (!master) {
  if (!process.argv.includes('--check'))
    throw new Error(
      'Refreshing copy requires the local private master and evidence.',
    )
  const manifest = await read(manifestPath)
  verifyPublicCopy(manifest, stage)
  for (const [path, value] of [
    ['src/content/quotes.json', manifest.quotes],
    ['src/content/terms.json', manifest.terms],
    ['src/content/copy-slots.json', manifest.placements],
  ])
    assert.deepEqual(
      await read(path),
      value,
      `${path}: differs from verified public manifest`,
    )
  console.log(
    `PASS: ${manifest.quotes.length} public excerpts; ${manifest.terms.length} terms; ${manifest.placements.length} slots (${stage}; locally verified source manifest)`,
  )
} else {
  const placements = await read(`${root}site-copy/runtime-placements.json`)
  const vocabulary = await read(`${root}site-copy/vocabulary.json`)
  const byId = new Map(master.quotes.map((quote) => [quote.id, quote]))
  assert.equal(byId.size, master.quotes.length, 'Duplicate quote IDs')
  assert.ok(
    ['testing', 'published'].includes(stage),
    'Choose testing or published copy',
  )
  const selected = new Set(placements.map((slot) => slot.quote_id))
  for (const quote of master.quotes)
    if (
      quote.legacy_id &&
      ['public_direction', 'term_label_only'].includes(quote.role)
    )
      selected.add(quote.id)
  for (const term of vocabulary.terms) {
    for (const id of [
      ...term.definition_quote_ids,
      ...term.example_quote_ids,
    ]) {
      const quote = byId.get(id)
      if (
        quote &&
        ['public_direction', 'term_label_only'].includes(quote.role) &&
        !quote.content_warnings.length
      )
        selected.add(id)
    }
  }
  const output = []
  for (const id of selected) {
    const quote = byId.get(id)
    assert.ok(quote, `Unknown quote ${id}`)
    assert.ok(
      ['public_direction', 'term_label_only'].includes(quote.role),
      `Private planning quotation cannot ship: ${id}`,
    )
    if (stage === 'published') {
      assert.ok(
        !quote.content_warnings.length,
        `Sensitive quotation delivery still awaits Jah's approval: ${id}`,
      )
      assert.equal(
        quote.approval.state,
        'approved',
        `Awaiting Jah's wording approval: ${id}`,
      )
      assert.equal(
        quote.approval.approved_revision,
        quote.revision,
        `Approval is stale: ${id}`,
      )
      for (const slot of placements.filter((item) => item.quote_id === id))
        assert.equal(
          slot.author_approval,
          'approved',
          `Awaiting placement approval: ${slot.id}`,
        )
    }
    const snapshot = `${root}${quote.source.snapshot}`
    const bytes = await readFile(snapshot)
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      quote.source.sha256,
      `${id}: changed source`,
    )
    let source = bytes.toString('utf8')
    if (quote.source.message_id)
      source = JSON.parse(source).messages.find(
        (item) => item.id === quote.source.message_id,
      )?.text
    assert.equal(
      Array.from(source).slice(quote.source.start, quote.source.end).join(''),
      quote.source_text,
      `${id}: not an exact source span`,
    )
    const masked = quote.variants.find((variant) => variant.id === 'masked')
    assert.ok(
      !quote.content_warnings.includes('profanity') || masked,
      `${id}: needs a masked display variant`,
    )
    output.push({
      id,
      text: masked?.text ?? quote.working_text,
      author: quote.author,
      date: quote.date,
      conversation: quote.conversation,
      source: snapshot,
      revision: quote.revision,
      content_warnings: quote.content_warnings,
      display_variant: masked ? 'masked' : 'original',
    })
  }
  const included = new Set(output.map((quote) => quote.id))
  const terms = vocabulary.terms.map((term) => ({
    id: term.id,
    label: term.label_editorial,
    quoteIds: term.definition_quote_ids.filter((id) => included.has(id)),
    exampleIds: term.example_quote_ids.filter((id) => included.has(id)),
    related: term.related_term_ids,
  }))
  const manifest = {
    schema_version: 1,
    edition: master.edition,
    master_sha256: createHash('sha256')
      .update(await readFile(`${root}content/master-quotes.json`))
      .digest('hex'),
    verification:
      'Selected source hashes and exact Unicode spans verified locally; private evidence is not published.',
    quotes: output,
    terms,
    placements,
    approvals: output.map((item) => {
      const quote = byId.get(item.id)
      return {
        id: quote.id,
        revision: quote.revision,
        role: quote.role,
        state: quote.approval.state,
        approved_revision: quote.approval.approved_revision,
      }
    }),
  }
  verifyPublicCopy(manifest, stage)
  for (const [path, value] of [
    ['src/content/quotes.json', output],
    ['src/content/terms.json', terms],
    ['src/content/copy-slots.json', placements],
    [manifestPath, manifest],
  ]) {
    const expected = `${JSON.stringify(value, null, 2)}\n`
    if (process.argv.includes('--check'))
      assert.deepEqual(
        await read(path),
        value,
        `${path}: refresh with pnpm copy:refresh`,
      )
    else await writeFile(path, expected)
  }
  console.log(
    `PASS: ${output.length} sourced quotation excerpts; ${terms.length} linked terms; ${placements.length} reusable slots (${stage})`,
  )
}
