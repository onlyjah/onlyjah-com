import assert from 'node:assert/strict'
import test from 'node:test'
import { createReferenceClient } from '../src/features/dictionary/reference-client.ts'

const url = 'https://example.org/rest/v1'
const access = {
  user_id: 'user_owner',
  drafts: true,
  personal_publish: false,
  onlyjah_publish: false,
  curate: false,
  ketema: false,
}
test('private search requires a session before any network request', async () => {
  let called = false
  const client = createReferenceClient({
    url,
    getToken: async () => null,
    fetcher: async () => {
      called = true
      throw new Error('unexpected')
    },
  })
  await assert.rejects(client.search('Ark', 'user_owner'), /Sign in/)
  assert.equal(called, false)
})
test('identity mismatch stops private search before reference retrieval', async () => {
  let calls = 0
  const client = createReferenceClient({
    url,
    getToken: async () => 'test-token',
    fetcher: async () => {
      calls++
      return Response.json(access)
    },
  })
  await assert.rejects(
    client.search('Ark', 'user_other'),
    /unexpected account identity/,
  )
  assert.equal(calls, 1)
})
test('verified requests use the existing bearer identity and parameterized search', async () => {
  const calls = []
  const client = createReferenceClient({
    url,
    getToken: async () => 'test-token',
    fetcher: async (path, init) => {
      calls.push({ path, init })
      return Response.json(calls.length === 1 ? access : [])
    },
  })
  assert.deepEqual(await client.search('Ark', 'user_owner'), [])
  assert.equal(calls[1].init.headers.get('Authorization'), 'Bearer test-token')
  assert.deepEqual(JSON.parse(calls[1].init.body), { search_text: 'Ark' })
  assert.ok(calls[1].path.endsWith('/rpc/dictionary_references'))
})
