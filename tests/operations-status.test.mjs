import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  deploymentLabel,
  snapshotAge,
} from '../src/features/operations/status.ts'

test('snapshots become stale and invalid or future observations are unknown', () => {
  const now = Date.parse('2026-10-11T18:00:00Z')
  assert.equal(snapshotAge('2026-10-11T17:59:00Z', now), 'recent')
  assert.equal(snapshotAge('2026-10-11T17:44:00Z', now), 'stale')
  assert.equal(snapshotAge('invalid', now), 'unknown')
  assert.equal(snapshotAge('2026-10-12T18:00:00Z', now), 'unknown')
})
test('provider success never asserts application verification', () => {
  assert.match(deploymentLabel('SUCCESS'), /verification required/)
  assert.equal(deploymentLabel('NEW_PROVIDER_STATE'), 'Unknown provider state')
})
test('release observation contains only explicitly public operational fields', () => {
  const text = readFileSync(
    new URL('../src/features/operations/release.json', import.meta.url),
    'utf8',
  )
  const snapshot = JSON.parse(text)
  assert.deepEqual(
    Object.keys(snapshot).sort(),
    [
      'version',
      'observedAt',
      'source',
      'environment',
      'patch',
      'deployments',
      'services',
      'work',
    ].sort(),
  )
  for (const row of snapshot.deployments)
    assert.deepEqual(
      Object.keys(row).sort(),
      ['label', 'status', 'createdAt'].sort(),
    )
  assert.equal(
    /jahnoah@|postgres(?:ql)?:\/\/|sk_(?:live|test)_|whsec_/.test(text),
    false,
  )
  assert.equal(
    /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i.test(text),
    false,
  )
  assert.equal(
    snapshot.work.find((row) => row.id === 'live').state,
    'unverified',
  )
})
