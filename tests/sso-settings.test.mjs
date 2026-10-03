import assert from 'node:assert/strict'
import { test } from 'node:test'
import { clerkHostSettings } from '../src/features/auth/sso-settings.ts'

test('a default build retains the primary app sign-in paths', () => {
  assert.equal(clerkHostSettings({}).isSatellite, false)
  assert.equal(clerkHostSettings({}).signInUrl, '/sign-in')
})
test('satellites use explicit primary URLs and narrowly listed return origins', () => {
  const settings = clerkHostSettings({
    primaryUrl: 'https://onlyjah.com',
    satelliteDomain: 'jahnoah.com',
    allowedOrigins: 'https://jahnoah.com',
  })
  assert.equal(settings.domain, 'jahnoah.com')
  assert.equal(settings.signInUrl, 'https://onlyjah.com/sign-in')
  assert.equal(settings.satelliteAutoSync, false)
  assert.deepEqual(settings.allowedRedirectOrigins, ['https://jahnoah.com'])
  assert.equal(
    clerkHostSettings({
      primaryUrl: 'http://localhost:3000',
      satelliteDomain: 'localhost:3001',
    }).isSatellite,
    true,
  )
})
test('unsafe origins and incomplete satellite configuration stop the build', () => {
  for (const primaryUrl of [
    'http://onlyjah.com',
    'https://u:p@onlyjah.com',
    'https://onlyjah.com/path',
    'javascript:alert(1)',
  ]) {
    assert.throws(() =>
      clerkHostSettings({ primaryUrl, satelliteDomain: 'jahnoah.com' }),
    )
  }
  assert.throws(() => clerkHostSettings({ satelliteDomain: 'jahnoah.com' }))
  assert.throws(() =>
    clerkHostSettings({
      primaryUrl: 'https://onlyjah.com',
      satelliteDomain: 'jahnoah.com/path',
    }),
  )
  assert.throws(() => clerkHostSettings({ allowedOrigins: '*' }))
})
