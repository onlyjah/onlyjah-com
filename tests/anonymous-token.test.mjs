import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createAnonymousToken } from '../src/features/publishing/anonymous-token.ts'

const url = 'https://example.neonauth.test/neondb/auth'
const token = (role = 'anonymous', seconds = 120) =>
  `header.${Buffer.from(JSON.stringify({ role, exp: Math.floor(Date.now() / 1000) + seconds })).toString('base64url')}.signature`

test('concurrent public feeds share a short-lived guest token without cookies', async () => {
  let calls = 0
  const get = createAnonymousToken(url, async (target, options) => {
    calls++
    assert.equal(target, `${url}/token/anonymous`)
    assert.equal(options.credentials, 'omit')
    return Response.json({ token: token() })
  })
  const [one, two] = await Promise.all([get(), get()])
  assert.equal(one, two)
  await get()
  assert.equal(calls, 1)
})
test('guest token caching renews near expiry', async () => {
  let calls = 0
  const get = createAnonymousToken(url, async () => {
    calls++
    return Response.json({ token: token('anonymous', 10) })
  })
  await get()
  await get()
  assert.equal(calls, 2)
})
test('a member token, expired token or malformed token cannot become anonymous access', async () => {
  for (const value of [
    token('authenticated'),
    token('anonymous', -10),
    'invalid',
  ]) {
    const get = createAnonymousToken(url, async () =>
      Response.json({ token: value }),
    )
    await assert.rejects(get(), /guest/)
  }
})
test('a failed anonymous request is retried and never cached as success', async () => {
  let calls = 0
  const get = createAnonymousToken(url, async () => {
    calls++
    return calls === 1
      ? new Response('', { status: 500 })
      : Response.json({ token: token() })
  })
  await assert.rejects(get())
  await get()
  assert.equal(calls, 2)
})
