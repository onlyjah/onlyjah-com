import assert from 'node:assert/strict'
import { test } from 'node:test'
import { publicManifestSnapshot } from '../scripts/public-manifest-snapshot.mjs'

const previous = {
  master_sha256: 'original-private-snapshot',
  quotes: [{ text: 'Exact words', revision: 1 }],
  approvals: ['pending'],
}
test('private-only master edits preserve the existing public payload', () => {
  assert.equal(
    publicManifestSnapshot(
      { ...previous, master_sha256: 'new-private-snapshot' },
      previous,
    ),
    previous,
  )
})
test('wording, revision and approval changes require a fresh public snapshot', () => {
  for (const change of [
    { quotes: [{ text: 'New exact words', revision: 1 }] },
    { quotes: [{ text: 'Exact words', revision: 2 }] },
    { approvals: ['approved'] },
  ]) {
    const candidate = {
      ...previous,
      ...change,
      master_sha256: 'new-private-snapshot',
    }
    assert.equal(publicManifestSnapshot(candidate, previous), candidate)
  }
  assert.equal(publicManifestSnapshot(previous, undefined), previous)
})
