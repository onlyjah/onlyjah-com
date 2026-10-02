// Neon requires a JWT for public reads too. This is a scoped, short-lived guest
// token, never a member session, permanent key, or alternate signup flow.
export function createAnonymousToken(
  authUrl: string,
  fetcher: typeof fetch = fetch,
) {
  const url = new URL(authUrl)
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error('Use the verified public HTTPS anonymous-auth endpoint.')
  let cached: { token: string; expires: number } | null = null
  let pending: Promise<string> | null = null
  async function acquire() {
    const response = await fetcher(
      `${url.href.replace(/\/$/, '')}/token/anonymous`,
      { credentials: 'omit', signal: AbortSignal.timeout(15000) },
    )
    if (!response.ok)
      throw new Error(
        'The public collection could not be connected. Try again.',
      )
    const data: { token?: string; jwt?: string } = await response.json()
    const token = data.token ?? data.jwt
    if (!token)
      throw new Error('The public collection returned no guest token.')
    let claims: { role?: string; exp?: number }
    try {
      claims = JSON.parse(
        atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
      )
    } catch {
      throw new Error('The public collection returned an invalid guest token.')
    }
    if (
      claims.role !== 'anonymous' ||
      typeof claims.exp !== 'number' ||
      claims.exp * 1000 <= Date.now()
    )
      throw new Error(
        'The public collection returned an unexpected guest identity.',
      )
    cached = { token, expires: claims.exp * 1000 }
    return token
  }
  return async () => {
    if (cached && cached.expires > Date.now() + 30000) return cached.token
    if (!pending)
      pending = acquire().finally(() => {
        pending = null
      })
    return pending
  }
}
