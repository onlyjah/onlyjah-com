import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createSourceClient,
  validateSource,
} from '../src/features/archive/source-client.ts'

const url = 'https://ep-example.apirest.us-east-1.aws.neon.tech/neondb/rest/v1'
const input = {
  title: 'Nebula',
  original_text: 'My exact words.\n',
  source_kind: 'chat',
  tags: ['ark'],
}
test('archive writes preserve original text and exclude supplied ownership and authority', async () => {
  const client = createSourceClient({
    url,
    getToken: async () => 'session',
    fetcher: async (_target, options) => {
      assert.equal(options.headers.get('Authorization'), 'Bearer session')
      assert.deepEqual(JSON.parse(options.body), {
        source_title: input.title,
        source_text: input.original_text,
        kind: 'chat',
        source_tags: ['ark'],
      })
      return Response.json({ id: 'source' })
    },
  })
  await client.save({ ...input, owner_id: 'someone-else', published: true })
})
test('source size is measured in UTF-8 bytes before making a request', () => {
  assert.throws(
    () => validateSource({ ...input, original_text: '🌞'.repeat(250001) }),
    /1 MB/,
  )
  validateSource({ ...input, original_text: '🌞'.repeat(250000) })
})
test('missing source session cannot contact private storage', async () => {
  const client = createSourceClient({
    url,
    getToken: async () => null,
    fetcher: () => {
      throw Error('must not fetch')
    },
  })
  await assert.rejects(client.list(), /Sign in/)
})
test('source lists load metadata rather than all original texts', async () => {
  const client = createSourceClient({
    url,
    getToken: async () => 'session',
    fetcher: async (target) => {
      assert.ok(!target.includes('select=*'))
      assert.ok(!target.includes('original_text'))
      return Response.json([])
    },
  })
  await client.list()
})
test('archive meter rejects a different server account', async () => {
  const client = createSourceClient({
    url,
    getToken: async () => 'session',
    fetcher: async () => Response.json({ user_id: 'other' }),
  })
  await assert.rejects(client.usage('me'), /unexpected account/)
})
