import { createRemoteJWKSet, jwtVerify } from 'jose'

/** Hosting access only. Clerk and PostgreSQL still authorize member actions. */
export function createStagingAccess(
  { required, teamDomain, audience, allowedEmails },
  { keySet } = {},
) {
  if (!required) return async () => 200

  let issuer
  let emails
  try {
    const url = new URL(teamDomain)
    if (
      url.protocol !== 'https:' ||
      !/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(url.hostname) ||
      url.port ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== '/' ||
      !audience?.trim()
    )
      throw new Error('Invalid Access configuration')
    issuer = url.origin
    emails = new Set(
      (allowedEmails || '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    )
    if (
      !emails.size ||
      [...emails].some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    )
      throw new Error('An explicit tester allowlist is required')
    keySet ??= createRemoteJWKSet(new URL('/cdn-cgi/access/certs', issuer), {
      timeoutDuration: 5000,
      cooldownDuration: 30000,
    })
  } catch {
    // Missing configuration must never turn a private deployment public.
    return async () => 503
  }

  return async (headers) => {
    const token = headers['cf-access-jwt-assertion']
    if (typeof token !== 'string' || token.length > 16384) return 403
    try {
      const { payload } = await jwtVerify(token, keySet, {
        algorithms: ['RS256'],
        issuer,
        audience,
        requiredClaims: ['iss', 'aud', 'exp', 'iat', 'sub', 'email'],
        clockTolerance: 5,
      })
      if (
        payload.type !== 'app' ||
        typeof payload.email !== 'string' ||
        !emails.has(payload.email.toLowerCase()) ||
        typeof payload.iat !== 'number' ||
        payload.iat > Date.now() / 1000 + 5
      )
        return 403
      return 200
    } catch {
      return 403
    }
  }
}

export function hostedTestingAccessRequired(env) {
  return (
    env.STAGING_ACCESS_REQUIRED === 'true' ||
    (Boolean(env.RAILWAY_ENVIRONMENT_ID) &&
      env.VITE_RELEASE_STAGE === 'testing')
  )
}
