import { createPublicKey, verify } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { loadEnv } from 'vite'

const developmentHost =
  'ep-still-bonus-b5f25qpf.apirest.c-7.us-east-2.aws.neon.tech'

// Return classifications only: provider errors may contain sensitive request data.
export function failureReason(status, body) {
  const message = JSON.stringify(body)
  if (/jwt|jwks|signature|issuer|token|authentication/i.test(message))
    return 'TOKEN_VERIFICATION'
  if (/42501|permission denied|insufficient privilege/i.test(message))
    return 'DATABASE_PERMISSION'
  if (status === 404 || /PGRST202|PGRST205|schema cache/i.test(message))
    return 'SCHEMA_OR_CACHE'
  return 'REQUEST_FAILED'
}

// Fixed labels only; never echo raw database messages or arbitrary token claims.
export function permissionDetail(body) {
  const message = typeof body?.message === 'string' ? body.message : ''
  const code = ['42501', 'PGRST202', 'PGRST205'].includes(body?.code)
    ? body.code
    : 'unclassified'
  const target = /schema ["']?auth["']?(?:\s|$)/i.test(message)
    ? 'managed_auth_schema'
    : ([
        'my_access',
        'current_member_id',
        'publication_grants',
        'member_profiles',
      ].find((name) => new RegExp(`\\b${name}\\b`).test(message)) ??
      'unclassified')
  return { code, target }
}

export async function diagnoseMember({
  token,
  expectedUser,
  apiUrl,
  clerkUrl,
  fetcher = fetch,
}) {
  const report = {}
  const parts = token.split('.')
  let header
  let claims
  try {
    if (parts.length !== 3) throw new Error()
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString())
    claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
  } catch {
    return { result: 'INVALID_TOKEN_FORMAT' }
  }
  report.subjectMatchesExpected = claims.sub === expectedUser
  report.issuerMatchesApplication = claims.iss === clerkUrl
  report.tokenNotExpired =
    typeof claims.exp === 'number' && claims.exp * 1000 > Date.now()
  if (
    !report.subjectMatchesExpected ||
    !report.issuerMatchesApplication ||
    !report.tokenNotExpired
  )
    return { ...report, result: 'TOKEN_ACCOUNT_OR_APPLICATION_MISMATCH' }
  const keysResponse = await fetcher(`${clerkUrl}/.well-known/jwks.json`, {
    signal: AbortSignal.timeout(15000),
  })
  if (!keysResponse.ok) return { ...report, result: 'SIGNING_KEYS_UNAVAILABLE' }
  const keys = await keysResponse.json()
  const key = keys.keys?.find((candidate) => candidate.kid === header.kid)
  report.signingKeyFound = Boolean(key)
  report.signatureValid = Boolean(
    key &&
      header.alg === 'RS256' &&
      verify(
        'RSA-SHA256',
        Buffer.from(`${parts[0]}.${parts[1]}`),
        createPublicKey({ key, format: 'jwk' }),
        Buffer.from(parts[2], 'base64url'),
      ),
  )
  if (!report.signatureValid)
    return { ...report, result: 'TOKEN_SIGNATURE_MISMATCH' }
  report.databaseRoleClaim =
    claims.role === undefined
      ? 'missing'
      : ['authenticated', 'anonymous'].includes(claims.role)
        ? claims.role
        : 'other'
  async function request(path, method = 'GET') {
    const response = await fetcher(`${apiUrl}/${path}`, {
      method,
      ...(method === 'POST' ? { body: '{}' } : {}),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    })
    const body = await response.json().catch(() => null)
    return { status: response.status, ok: response.ok, body }
  }
  // POST invokes a read-only capability function, not a grant or content write.
  const access = await request('rpc/my_access', 'POST')
  report.accessHttpStatus = access.status
  if (!access.ok)
    return {
      ...report,
      accessFailure: permissionDetail(access.body),
      result: failureReason(access.status, access.body),
    }
  report.databaseSubjectMatchesExpected = access.body?.user_id === expectedUser
  if (!report.databaseSubjectMatchesExpected)
    return { ...report, result: 'DATABASE_IDENTITY_MISMATCH' }
  report.capabilities = Object.fromEntries(
    ['drafts', 'personal_publish', 'onlyjah_publish', 'curate', 'ketema'].map(
      (name) => [name, access.body[name] === true],
    ),
  )
  const profile = await request(
    'member_profiles?select=display_name,bio&limit=1',
  )
  const drafts = await request(
    `posts?owner_id=eq.${encodeURIComponent(expectedUser)}&status=eq.draft&select=id&limit=1`,
  )
  report.profileHttpStatus = profile.status
  report.draftsHttpStatus = drafts.status
  report.profileReadValid = profile.ok && Array.isArray(profile.body)
  report.draftReadValid = drafts.ok && Array.isArray(drafts.body)
  // No private names, bodies, record IDs, tokens or raw provider errors are output.
  report.result =
    report.profileReadValid && report.draftReadValid
      ? 'MEMBER_READ_ACCESS_VERIFIED'
      : 'MEMBER_TABLE_READ_FAILED'
  return report
}

async function hiddenToken() {
  if (!process.stdin.isTTY || !process.stdout.isTTY)
    throw new Error('Run this command in your interactive terminal.')
  process.stdout.write('Paste fresh Clerk API token (hidden), then Enter: ')
  const previouslyRaw = Boolean(process.stdin.isRaw)
  process.stdin.setRawMode(true)
  process.stdin.resume()
  return new Promise((resolve, reject) => {
    let value = ''
    function finish(error) {
      process.stdin.removeListener('data', accept)
      process.stdin.setRawMode(previouslyRaw)
      process.stdin.pause()
      process.stdout.write('\n')
      if (error) reject(error)
      else resolve(value)
    }
    function accept(chunk) {
      const text = chunk
        .toString()
        .replaceAll('\u001b[200~', '')
        .replaceAll('\u001b[201~', '')
      for (const character of text) {
        if (character === '\u0003') return finish(new Error('Cancelled.'))
        if (character === '\r' || character === '\n') return finish()
        if (character === '\u007f' || character === '\b')
          value = value.slice(0, -1)
        else if (/[A-Za-z0-9_.-]/.test(character)) value += character
        if (value.length > 16384)
          return finish(new Error('Token input is too long.'))
      }
    }
    process.stdin.on('data', accept)
  })
}

async function main() {
  const expectedUser = process.argv[2]
  if (!/^user_[A-Za-z0-9]+$/.test(expectedUser ?? ''))
    throw new Error('Usage: pnpm check:member user_YOUR_SIGNED_IN_ACCOUNT_ID')
  const env = loadEnv('development', process.cwd(), 'VITE_')
  const api = new URL(env.VITE_NEON_DATA_API_URL)
  if (
    api.hostname !== developmentHost ||
    api.protocol !== 'https:' ||
    api.pathname !== '/neondb/rest/v1' ||
    api.username ||
    api.password ||
    api.search ||
    api.hash
  )
    throw new Error(
      'The API must match this checkout’s verified development target.',
    )
  const key = env.VITE_CLERK_PUBLISHABLE_KEY
  if (!key?.startsWith('pk_test_'))
    throw new Error('Use this checkout’s development Clerk publishable key.')
  const host = Buffer.from(key.slice(8), 'base64').toString().replace(/\$$/, '')
  if (!/^[a-z0-9-]+\.clerk\.accounts\.dev$/.test(host))
    throw new Error('The development Clerk domain is not recognized.')
  const token = await hiddenToken()
  const report = await diagnoseMember({
    token,
    expectedUser,
    apiUrl: api.href,
    clerkUrl: `https://${host}`,
  })
  console.log(JSON.stringify(report, null, 2))
  if (report.result !== 'MEMBER_READ_ACCESS_VERIFIED') process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch(() => {
    // Network/provider exceptions must not print a token or private response.
    console.error(
      'Diagnostic could not complete. Check configuration, connectivity and a fresh token.',
    )
    process.exitCode = 1
  })
