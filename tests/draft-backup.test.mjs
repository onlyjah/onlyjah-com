import assert from 'node:assert/strict'
import test from 'node:test'
import {
  draftBackup,
  readDraftBackup,
} from '../src/features/publishing/draft-backup.ts'

const input = {
  title: 'Zine',
  body: 'Original ✨',
  kind: 'writing',
  target: 'personal',
  embed_urls: ['https://youtu.be/example'],
  gallery_urls: ['https://example.org/art.png'],
  tags: ['art'],
}
test('backup preserves all editable draft fields and drops authority fields', () => {
  const backup = JSON.parse(draftBackup(input))
  backup.input.owner_id = 'other'
  backup.input.status = 'published'
  backup.input.featured = true
  const restored = readDraftBackup(JSON.stringify(backup))
  assert.deepEqual(restored, input)
  assert.equal('owner_id' in restored, false)
})
test('reject incompatible backups and non-string attachments', () => {
  assert.throws(() => readDraftBackup('{"version":2}'))
  const backup = JSON.parse(draftBackup(input))
  backup.input.tags = [false]
  assert.throws(() => readDraftBackup(JSON.stringify(backup)))
})
