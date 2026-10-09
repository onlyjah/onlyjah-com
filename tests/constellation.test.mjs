import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { apiBase, publicSnapshot } from '../src/features/constellation/model.ts'

const input = JSON.parse(
  readFileSync(
    new URL(
      '../src/features/constellation/public-snapshot.json',
      import.meta.url,
    ),
    'utf8',
  ),
)
test('public constellation payload excludes private extensions and preserves exact quote', () => {
  const raw = structuredClone(input)
  raw.projects[0].privateInvoice = 'must-not-appear'
  const parsed = publicSnapshot(raw)
  assert.equal(JSON.stringify(parsed).includes('must-not-appear'), false)
  assert.equal(
    parsed.projects.find((p) => p.id === 'nebula').quote,
    'the nebula generates stars.',
  )
})
test('public index rejects changed scope, injected links and hidden endpoints', () => {
  const wrongOrg = structuredClone(input)
  wrongOrg.orgId = 'other'
  assert.throws(() => publicSnapshot(wrongOrg))
  const badLink = structuredClone(input)
  badLink.projects[0].url = 'javascript:alert(1)'
  assert.throws(() => publicSnapshot(badLink))
  const hidden = structuredClone(input)
  hidden.relationships[0].target = 'private-project'
  assert.throws(() => publicSnapshot(hidden))
})
test('API configuration accepts only credential-free HTTPS origins', () => {
  assert.equal(apiBase('https://public.example'), 'https://public.example')
  for (const value of [
    'http://example.com',
    'https://user:secret@example.com',
    'https://example.com/private',
    'https://example.com/?token=secret',
  ])
    assert.equal(apiBase(value), null)
})
