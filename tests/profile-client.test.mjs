import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createProfileClient } from '../src/features/membership/profile-client.ts'

const url = 'https://ep-example.apirest.us-east-1.aws.neon.tech/neondb/rest/v1'

test('a missing session never makes a database request', async () => {
  let called = false
  const client = createProfileClient({
    url,
    getToken: async () => null,
    fetcher: async () => {
      called = true
      return new Response()
    },
  })
  await assert.rejects(client.load(), /Sign in again/)
  assert.equal(called, false)
})

test('rejects credential-bearing and non-HTTPS endpoint configuration', () => {
  for (const invalid of [
    'postgres://user:password@example.test/db',
    'https://user:password@example.test/rest/v1',
    'http://example.test/rest/v1',
    'https://example.test',
  ]) {
    assert.throws(() =>
      createProfileClient({ url: invalid, getToken: async () => 'session' }),
    )
  }
})

test('reads the private profile using a fresh token and forwards cancellation', async () => {
  const signal = new AbortController().signal
  const client = createProfileClient({
    url,
    getToken: async () => 'current-session',
    fetcher: async (target, options) => {
      assert.equal(
        target,
        `${url}/member_profiles?select=display_name,bio&limit=1`,
      )
      assert.equal(options.headers.Authorization, 'Bearer current-session')
      assert.equal(options.signal, signal)
      return Response.json([{ display_name: 'Jah', bio: 'In my words.' }])
    },
  })
  assert.deepEqual(await client.load(signal), {
    display_name: 'Jah',
    bio: 'In my words.',
  })
})

test('an account without a profile returns null', async () => {
  const client = createProfileClient({
    url,
    getToken: async () => 'session',
    fetcher: async () => Response.json([]),
  })
  assert.equal(await client.load(), null)
})

test('save contains only editable fields; owner identity comes from the verified JWT', async () => {
  const client = createProfileClient({
    url,
    getToken: async () => 'session',
    fetcher: async (target, options) => {
      assert.equal(target, `${url}/member_profiles?on_conflict=clerk_user_id`)
      assert.equal(options.method, 'POST')
      assert.equal(
        options.headers.Prefer,
        'resolution=merge-duplicates,return=minimal',
      )
      assert.deepEqual(JSON.parse(options.body), {
        display_name: 'Jah',
        bio: '<script>These are my literal words.</script>',
      })
      return new Response(null, { status: 204 })
    },
  })
  await client.save({
    display_name: ' Jah ',
    bio: '<script>These are my literal words.</script>',
  })
})

test('invalid profile lengths never send a write', async () => {
  let called = false
  const client = createProfileClient({
    url,
    getToken: async () => 'session',
    fetcher: async () => {
      called = true
      return new Response()
    },
  })
  for (const profile of [
    { display_name: ' ', bio: '' },
    { display_name: 'x'.repeat(81), bio: '' },
    { display_name: 'Jah', bio: 'x'.repeat(601) },
  ])
    await assert.rejects(client.save(profile), /1–80/)
  assert.equal(called, false)
})

test('denied requests do not expose backend details or tokens', async () => {
  const client = createProfileClient({
    url,
    getToken: async () => 'private-session',
    fetcher: async () =>
      new Response('sensitive database detail', { status: 403 }),
  })
  await assert.rejects(
    client.load(),
    (error) =>
      error.message ===
      'Storage could not verify your profile access. Your account is still signed in.',
  )
})

test('malformed profile responses fail instead of populating the form', async () => {
  for (const body of [
    { display_name: 'Jah' },
    [{ display_name: 42, bio: '' }],
    [null],
  ]) {
    const client = createProfileClient({
      url,
      getToken: async () => 'session',
      fetcher: async () => Response.json(body),
    })
    await assert.rejects(client.load(), /invalid/)
  }
})
