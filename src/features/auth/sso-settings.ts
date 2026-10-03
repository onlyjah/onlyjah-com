/** Explicit public host configuration; a shared key alone does not establish SSO. */
export function clerkHostSettings(input: {
  primaryUrl?: string
  satelliteDomain?: string
  allowedOrigins?: string
}) {
  function origin(value: string) {
    const url = new URL(value)
    const local = ['localhost', '127.0.0.1'].includes(url.hostname)
    if (
      (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    )
      throw new Error(
        'Clerk host settings require HTTPS origins (HTTP localhost is allowed).',
      )
    return url.origin
  }
  const allowedRedirectOrigins =
    input.allowedOrigins
      ?.split(',')
      .filter(Boolean)
      .map((value) => origin(value.trim())) ?? []
  if (!input.satelliteDomain) {
    return {
      isSatellite: false as const,
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
      allowedRedirectOrigins,
    }
  }
  if (!input.primaryUrl)
    throw new Error('A Clerk satellite requires its primary app origin.')
  const primary = origin(input.primaryUrl)
  const domain = input.satelliteDomain.trim()
  if (!/^[a-zA-Z0-9.-]+(?::[0-9]+)?$/.test(domain))
    throw new Error(
      'Use a Clerk satellite hostname, without a URL path or credentials.',
    )
  return {
    isSatellite: true as const,
    domain,
    satelliteAutoSync: false,
    signInUrl: `${primary}/sign-in`,
    signUpUrl: `${primary}/sign-up`,
    allowedRedirectOrigins,
  }
}
