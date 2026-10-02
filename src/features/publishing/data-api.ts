export type DataApiOptions = {
  url: string
  getToken?: () => Promise<string | null>
  getAnonymousToken?: () => Promise<string>
  fetcher?: typeof fetch
}

export class DataApiError extends Error {
  readonly reason:
    | 'setup'
    | 'session'
    | 'denied'
    | 'conflict'
    | 'network'
    | 'invalid'
  constructor(reason: DataApiError['reason'], message: string) {
    super(message)
    this.name = 'DataApiError'
    this.reason = reason
  }
}

// One transport for the browser and alternate clients. Authority stays in PostgreSQL.
export function createDataApi({
  url,
  getToken,
  getAnonymousToken,
  fetcher = fetch,
}: DataApiOptions) {
  const base = new URL(url)
  if (
    base.protocol !== 'https:' ||
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    !base.pathname.endsWith('/rest/v1')
  )
    throw new Error(
      'Use the public HTTPS Data API endpoint ending in /rest/v1.',
    )
  return async (
    path: string,
    init: RequestInit = {},
    privateRequest = true,
  ): Promise<Response> => {
    const headers = new Headers(init.headers)
    headers.set('Content-Type', 'application/json')
    if (privateRequest) {
      let token: string | null | undefined
      try {
        token = await getToken?.()
      } catch {
        throw new DataApiError(
          'session',
          'Your sign-in token is unavailable. Try again.',
        )
      }
      if (!token)
        throw new DataApiError('session', 'Sign in to access your workspace.')
      headers.set('Authorization', `Bearer ${token}`)
    }
    if (!privateRequest && getAnonymousToken) {
      try {
        headers.set('Authorization', `Bearer ${await getAnonymousToken()}`)
      } catch {
        throw new DataApiError(
          'setup',
          'Public collection access is unavailable. Try again.',
        )
      }
    }
    let response: Response
    try {
      response = await fetcher(`${base.href}/${path}`, {
        ...init,
        headers,
        signal: init.signal ?? AbortSignal.timeout(20000),
      })
    } catch {
      throw new DataApiError(
        'network',
        'The data service could not be reached. Your unsaved work is still here.',
      )
    }
    if (!response.ok) {
      if (response.status === 404)
        throw new DataApiError(
          'setup',
          'This workspace’s storage is not ready yet. Your sign-in worked.',
        )
      if (response.status === 401)
        throw new DataApiError(
          'session',
          'Storage could not verify this sign-in. Your account is still signed in.',
        )
      if (response.status === 403)
        throw new DataApiError(
          'denied',
          'Your account does not have permission for this action.',
        )
      if (response.status === 409)
        throw new DataApiError(
          'conflict',
          'This name is already in use, or the saved draft changed. Reload the saved version before trying again.',
        )
      if (response.status === 400) {
        const failure: { message?: string } = await response
          .json()
          .catch(() => ({}))
        if (
          typeof failure.message === 'string' &&
          /authentication|bearer|jwt|jwks/i.test(failure.message)
        )
          throw new DataApiError(
            privateRequest ? 'session' : 'setup',
            privateRequest
              ? 'Storage could not verify this sign-in. Your account is still signed in.'
              : 'Public collection access is unavailable. Try again.',
          )
        throw new DataApiError(
          'invalid',
          'Check the title, links and content limits before saving.',
        )
      }
      throw new DataApiError(
        'network',
        'Storage is unavailable. Your unsaved work is still here.',
      )
    }
    return response
  }
}
export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Try again.'
}
