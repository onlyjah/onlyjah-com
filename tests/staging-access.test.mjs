import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { test } from 'node:test'
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose'
import {
  createStagingAccess,
  hostedTestingAccessRequired,
} from '../scripts/staging-access.mjs'

const issuer = 'https://onlyjah-test.cloudflareaccess.com'
const audience = 'staging-app'
const config = {
  required: true,
  teamDomain: issuer,
  audience,
  allowedEmails: 'jah@example.com, tester@example.com',
}
const { privateKey, publicKey } = await generateKeyPair('RS256')
const jwk = { ...(await exportJWK(publicKey)), kid: 'test-key', alg: 'RS256' }
const keySet = createLocalJWKSet({ keys: [jwk] })
const guard = createStagingAccess(config, { keySet })
async function token({
  email = 'jah@example.com',
  aud = audience,
  iss = issuer,
  exp = '5m',
  type = 'app',
} = {}) {
  return new SignJWT({ email, type })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
    .setSubject('verified-test-subject')
    .setIssuer(iss)
    .setAudience(aud)
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(privateKey)
}
const headers = (jwt) => ({ 'cf-access-jwt-assertion': jwt })

test('hosting gate permits a signed application token only for an invited identity', async () => {
  assert.equal(await guard(headers(await token())), 200)
  assert.equal(
    await guard(headers(await token({ email: 'TESTER@example.com' }))),
    200,
  )
  assert.equal(
    await guard(headers(await token({ email: 'stranger@example.com' }))),
    403,
  )
})
test('spoofed identity headers, unsigned tokens and tampered signatures cannot enter staging', async () => {
  assert.equal(
    await guard({ 'cf-access-authenticated-user-email': 'jah@example.com' }),
    403,
  )
  assert.equal(await guard(headers('eyJhbGciOiJub25lIn0.e30.')), 403)
  const jwt = await token()
  const parts = jwt.split('.')
  parts[1] = Buffer.from(
    JSON.stringify({ email: 'jah@example.com', aud: audience }),
  ).toString('base64url')
  assert.equal(await guard(headers(parts.join('.'))), 403)
})
test('wrong application, issuer, expired tokens and service identities are denied', async () => {
  for (const options of [
    { aud: 'other-app' },
    { iss: 'https://other.cloudflareaccess.com' },
    { exp: Math.floor(Date.now() / 1000) - 60 },
    { type: 'service' },
  ])
    assert.equal(await guard(headers(await token(options))), 403)
})
test('a token without an expiry is denied even with a valid signature', async () => {
  const jwt = await new SignJWT({ email: 'jah@example.com', type: 'app' })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
    .setSubject('test')
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .sign(privateKey)
  assert.equal(await guard(headers(jwt)), 403)
})
test('missing configuration and unsafe key endpoints fail closed', async () => {
  for (const override of [
    { teamDomain: undefined },
    { audience: '' },
    { allowedEmails: '' },
    { teamDomain: 'https://attacker.example' },
    { teamDomain: `${issuer}/other` },
    { teamDomain: `${issuer}?url=other` },
  ])
    assert.equal(await createStagingAccess({ ...config, ...override })({}), 503)
})
test('hosted testing cannot disable the gate with a false flag; local and public serving stay portable', async () => {
  assert.equal(
    hostedTestingAccessRequired({
      RAILWAY_ENVIRONMENT_ID: 'dev',
      VITE_RELEASE_STAGE: 'testing',
      STAGING_ACCESS_REQUIRED: 'false',
    }),
    true,
  )
  assert.equal(
    hostedTestingAccessRequired({ STAGING_ACCESS_REQUIRED: 'true' }),
    true,
  )
  assert.equal(hostedTestingAccessRequired({}), false)
  assert.equal(
    hostedTestingAccessRequired({
      RAILWAY_ENVIRONMENT_ID: 'prod',
      VITE_RELEASE_STAGE: 'production',
    }),
    false,
  )
  assert.equal(await createStagingAccess({ required: false })({}), 200)
})
test('direct origin denies page, asset, redirect and HEAD requests before serving bytes', async (t) => {
  const child = spawn(process.execPath, ['scripts/preview-static.mjs'], {
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      PORT: '4188',
      STAGING_ACCESS_REQUIRED: 'true',
      CF_ACCESS_TEAM_DOMAIN: issuer,
      CF_ACCESS_AUD: audience,
      STAGING_ALLOWED_EMAILS: 'jah@example.com',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  t.after(() => child.kill())
  await Promise.race([
    once(child.stdout, 'data'),
    once(child, 'exit').then(([code]) => {
      throw new Error(`Origin exited ${code}`)
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Origin start timeout')), 5000).unref(),
    ),
  ])
  const base = 'http://127.0.0.1:4188'
  for (const path of [
    '/',
    '/forge',
    '/assets/example.js',
    '/login',
    '/missing',
  ]) {
    const response = await fetch(base + path, {
      redirect: 'manual',
      headers: { 'cf-access-authenticated-user-email': 'jah@example.com' },
    })
    assert.equal(response.status, 403, path)
    assert.equal(response.headers.get('cache-control'), 'private, no-store')
    assert.equal(response.headers.get('location'), null)
    assert.equal(await response.text(), 'Staging access is restricted.')
  }
  const head = await fetch(`${base}/forge`, { method: 'HEAD' })
  assert.equal(head.status, 403)
  assert.equal(await head.text(), '')
  assert.equal((await fetch(`${base}/healthz`)).status, 204)
  assert.equal((await fetch(`${base}/healthz`, { method: 'POST' })).status, 405)
})
