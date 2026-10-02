import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { verifyPublicCopy } from '../scripts/verify-public-copy.mjs'

const fixture = () =>
  JSON.parse(readFileSync('content/public-copy-manifest.json', 'utf8'))
test('public CI can verify the selected subset without exposing private evidence', () => {
  verifyPublicCopy(fixture(), 'testing')
})
test('private roles and raw source originals cannot enter the public subset', () => {
  const privateRole = fixture()
  privateRole.approvals[0].role = 'internal_editorial'
  assert.throws(() => verifyPublicCopy(privateRole, 'testing'), /Private/)
  const rawSource = fixture()
  rawSource.quotes[0].source_text = 'private original'
  assert.throws(() => verifyPublicCopy(rawSource, 'testing'), /Raw editorial/)
})
test('a pending testing subset cannot become a publication release', () => {
  assert.throws(() => verifyPublicCopy(fixture(), 'published'), /approval/)
})
