import assert from 'node:assert/strict'

// The public manifest attests to local source checking; it is not a replacement for the private editable master.
export function verifyPublicCopy(manifest, stage) {
  assert.ok(['testing', 'published'].includes(stage))
  assert.equal(manifest.schema_version, 1)
  assert.match(manifest.master_sha256, /^[a-f0-9]{64}$/)
  const ids = new Set()
  for (const quote of manifest.quotes) {
    assert.ok(!ids.has(quote.id), `Duplicate quote: ${quote.id}`)
    ids.add(quote.id)
    assert.ok(
      quote.author === 'Jah' && quote.text && quote.date && quote.conversation,
    )
    assert.ok(
      !('source_text' in quote),
      'Raw editorial source must not enter the public manifest',
    )
    assert.ok(
      !quote.content_warnings.includes('profanity') ||
        quote.display_variant === 'masked',
      'Profanity requires a masked variant',
    )
    const approval = manifest.approvals.find((item) => item.id === quote.id)
    assert.ok(
      approval &&
        ['public_direction', 'term_label_only'].includes(approval.role),
      `Private or unknown quote role: ${quote.id}`,
    )
    assert.equal(approval.revision, quote.revision)
    if (stage === 'published') {
      assert.ok(
        !quote.content_warnings.length,
        'Sensitive delivery awaits author approval',
      )
      assert.equal(
        approval.state,
        'approved',
        `Awaiting wording approval: ${quote.id}`,
      )
      assert.equal(
        approval.approved_revision,
        quote.revision,
        `Stale approval: ${quote.id}`,
      )
    }
  }
  const termIds = new Set(manifest.terms.map((term) => term.id))
  assert.equal(termIds.size, manifest.terms.length)
  for (const term of manifest.terms) {
    for (const id of [...term.quoteIds, ...term.exampleIds])
      assert.ok(ids.has(id), `Unknown definition excerpt: ${id}`)
    for (const id of term.related)
      assert.ok(termIds.has(id), `Unknown related term: ${id}`)
  }
  const slotIds = new Set()
  for (const slot of manifest.placements) {
    assert.ok(!slotIds.has(slot.id), `Duplicate slot: ${slot.id}`)
    slotIds.add(slot.id)
    assert.ok(ids.has(slot.quote_id), `Unknown slot excerpt: ${slot.id}`)
    if (stage === 'published')
      assert.equal(
        slot.author_approval,
        'approved',
        `Awaiting placement approval: ${slot.id}`,
      )
  }
}
