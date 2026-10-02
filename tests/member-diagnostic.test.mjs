import assert from 'node:assert/strict'
import { generateKeyPairSync, sign } from 'node:crypto'
import test from 'node:test'
import { diagnoseMember, permissionDetail } from '../scripts/check-member.mjs'

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
})
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'fixture-key' }
const clerkUrl = 'https://fixture.clerk.accounts.dev'
const expectedUser = 'user_fixture'
function token(extra = {}) {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString('base64url')
  const input = `${encode({ alg: 'RS256', kid: jwk.kid })}.${encode({
    sub: expectedUser,
    iss: clerkUrl,
    exp: Math.floor(Date.now() / 1000) + 120,
    ...extra,
  })}`
  return `${input}.${sign('RSA-SHA256', Buffer.from(input), privateKey).toString('base64url')}`
}
const options = {
  expectedUser,
  clerkUrl,
  apiUrl: 'https://development.example/rest/v1',
}

test('expired and mismatched sessions never reach the data service', async () => {
  for (const extra of [
    { exp: 1 },
    { sub: 'user_someoneelse' },
    { iss: 'https://other.example' },
  ]) {
    const report = await diagnoseMember({
      ...options,
      token: token(extra),
      fetcher: () => {
        throw new Error('Unexpected request')
      },
    })
    assert.equal(report.result, 'TOKEN_ACCOUNT_OR_APPLICATION_MISMATCH')
    assert.equal(JSON.stringify(report).includes('user_someoneelse'), false)
  }
})

test('invalid signatures never reach private endpoints', async () => {
  let calls = 0
  const parts = token().split('.')
  parts[2] = Buffer.from('invalid-signature').toString('base64url')
  const report = await diagnoseMember({
    ...options,
    token: parts.join('.'),
    fetcher: async () => {
      calls++
      return Response.json({ keys: [jwk] })
    },
  })
  assert.equal(calls, 1)
  assert.equal(report.result, 'TOKEN_SIGNATURE_MISMATCH')
})

test('provider failures output classifications without credentials or raw response text', async () => {
  const credential = token()
  const report = await diagnoseMember({
    ...options,
    token: credential,
    fetcher: async (url) =>
      url.endsWith('jwks.json')
        ? Response.json({ keys: [jwk] })
        : Response.json(
            { message: `JWT rejected: ${credential}; private fixture name` },
            { status: 400 },
          ),
  })
  assert.equal(report.signatureValid, true)
  assert.equal(report.databaseRoleClaim, 'missing')
  assert.equal(report.result, 'TOKEN_VERIFICATION')
  assert.equal(JSON.stringify(report).includes(credential), false)
  assert.equal(JSON.stringify(report).includes('private fixture name'), false)
})

test('permission details use fixed names and codes without arbitrary server text', () => {
  assert.deepEqual(
    permissionDetail({
      code: '42501',
      message: 'permission denied for function my_access; sensitive response',
    }),
    { code: '42501', target: 'my_access' },
  )
  assert.deepEqual(
    permissionDetail({
      code: '42501',
      message: 'permission denied for schema auth',
    }),
    { code: '42501', target: 'managed_auth_schema' },
  )
  assert.deepEqual(
    permissionDetail({ code: 'private-secret', message: 'private-secret' }),
    { code: 'unclassified', target: 'unclassified' },
  )
})

test('signed database role classification exposes no arbitrary role names', async () => {
  for (const [role, classification] of [
    ['authenticated', 'authenticated'],
    ['anonymous', 'anonymous'],
    ['private-role-name', 'other'],
  ]) {
    const report = await diagnoseMember({
      ...options,
      token: token({ role }),
      fetcher: async (url) =>
        url.endsWith('jwks.json')
          ? Response.json({ keys: [jwk] })
          : Response.json(
              {
                code: '42501',
                message: 'permission denied for function my_access',
              },
              { status: 403 },
            ),
    })
    assert.equal(report.databaseRoleClaim, classification)
    assert.equal(JSON.stringify(report).includes('private-role-name'), false)
    assert.deepEqual(report.accessFailure, {
      code: '42501',
      target: 'my_access',
    })
  }
})

test('verified read checks return capabilities without profile or draft contents and perform no writes', async () => {
  const calls = []
  const report = await diagnoseMember({
    ...options,
    token: token(),
    fetcher: async (url, init) => {
      calls.push({ url, method: init.method ?? 'GET' })
      if (url.endsWith('jwks.json')) return Response.json({ keys: [jwk] })
      if (url.endsWith('rpc/my_access'))
        return Response.json({
          user_id: expectedUser,
          drafts: true,
          personal_publish: false,
        })
      if (url.includes('member_profiles'))
        return Response.json([
          { display_name: 'Private fixture name', bio: 'Private fixture bio' },
        ])
      return Response.json([{ id: 'private-draft-id' }])
    },
  })
  assert.equal(report.result, 'MEMBER_READ_ACCESS_VERIFIED')
  assert.deepEqual(report.capabilities, {
    drafts: true,
    personal_publish: false,
    onlyjah_publish: false,
    curate: false,
    ketema: false,
  })
  assert.equal(calls.filter((call) => call.method === 'POST').length, 1)
  assert.ok(
    calls.find((call) => call.method === 'POST').url.endsWith('rpc/my_access'),
  )
  const output = JSON.stringify(report)
  for (const value of [
    'Private fixture name',
    'Private fixture bio',
    'private-draft-id',
  ])
    assert.equal(output.includes(value), false)
})
