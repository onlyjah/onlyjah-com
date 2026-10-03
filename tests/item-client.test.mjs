import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createItemClient } from '../src/features/workspace/item-client.ts'

const url = 'https://ep-example.apirest.us-east-2.aws.neon.tech/neondb/rest/v1'
const id = '12345678-1234-1234-1234-123456789abc'
const input = {
  kind: 'document',
  title: 'Shared notes',
  body: 'Words',
  status: 'draft',
  editor_ids: [],
  links: [],
  price_label: '',
}
test('workspace writes whitelist ownership, permissions and revision fields', async () => {
  const client = createItemClient(
    {
      url,
      getToken: async () => 'session',
      fetcher: async (_target, options) => {
        const body = JSON.parse(options.body)
        assert.deepEqual(Object.keys(body).sort(), [
          'body',
          'editor_ids',
          'kind',
          'links',
          'status',
          'title',
        ])
        return Response.json([{ ...body, id, revision: 1 }])
      },
    },
    'forge',
  )
  await client.save({
    ...input,
    owner_id: 'forged',
    marketplace_post: true,
    revision: 999,
  })
})
test('marketplace retries cannot overwrite a newer revision', async () => {
  const client = createItemClient(
    {
      url,
      getToken: async () => 'session',
      fetcher: async (target) => {
        assert.ok(target.includes('revision=eq.2'))
        return Response.json([])
      },
    },
    'market',
  )
  await assert.rejects(
    client.save({ ...input, kind: 'offering' }, { id, revision: 2 }),
    /changed/,
  )
})
test('unsafe links and invalid account IDs fail before contacting storage', async () => {
  const client = createItemClient(
    {
      url,
      getToken: async () => 'session',
      fetcher: async () => {
        throw new Error('unexpected network call')
      },
    },
    'forge',
  )
  await assert.rejects(
    client.save({ ...input, links: ['javascript:alert(1)'] }),
    /HTTPS/,
  )
  await assert.rejects(
    client.save({ ...input, editor_ids: ['user_a&role=admin'] }),
    /verified account IDs/,
  )
})

test('market product categories are editable, while caller billing fields are excluded', async () => {
  let calls = 0
  const client = createItemClient(
    {
      url,
      getToken: async () => 'session',
      fetcher: async (_target, options) => {
        calls++
        const body = JSON.parse(options.body)
        assert.equal(body.product_type, 'subscription')
        assert.ok(!('stripe_price_id' in body))
        assert.ok(!('paid' in body))
        return Response.json([{ ...body, id, revision: 1 }])
      },
    },
    'market',
  )
  await client.save({
    ...input,
    kind: 'offering',
    product_type: 'subscription',
    stripe_price_id: 'forged',
    paid: true,
  })
  await assert.rejects(
    client.save({ ...input, kind: 'offering', product_type: 'admin' }),
    /product type/,
  )
  assert.equal(calls, 1)
})
