export type MemberProfile = { display_name: string; bio: string }
type ProfileClientOptions = {
  url: string
  getToken: () => Promise<string | null>
  fetcher?: typeof fetch
}

// Neon Data API verifies the Clerk JWT. PostgreSQL RLS is the authorization boundary.
// No Postgres connection string, service key, or token persistence belongs here.
export function createProfileClient({
  url,
  getToken,
  fetcher = fetch,
}: ProfileClientOptions) {
  const endpoint = new URL(url)
  if (
    endpoint.protocol !== 'https:' ||
    endpoint.username ||
    endpoint.password ||
    endpoint.search ||
    endpoint.hash ||
    !endpoint.pathname.endsWith('/rest/v1')
  ) {
    throw new Error(
      'Profile storage requires a public HTTPS Data API endpoint ending in /rest/v1.',
    )
  }

  async function request(query: string, init?: RequestInit) {
    const token = await getToken()
    if (!token) throw new Error('Sign in again to access your profile.')
    const response = await fetcher(
      `${endpoint.href.replace(/\/$/, '')}/member_profiles${query}`,
      {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
          Authorization: `Bearer ${token}`,
        },
      },
    )
    if (!response.ok)
      throw new Error(
        response.status === 404
          ? 'Profile storage isn’t ready yet. Your sign-in worked.'
          : response.status === 401 || response.status === 403
            ? 'Storage could not verify your profile access. Your account is still signed in.'
            : 'Profile storage is unavailable. Please try again.',
      )
    return response
  }

  return {
    async load(signal?: AbortSignal): Promise<MemberProfile | null> {
      const response = await request('?select=display_name,bio&limit=1', {
        signal,
      })
      const rows: unknown = await response.json()
      if (!Array.isArray(rows))
        throw new Error('Profile storage returned an invalid response.')
      const row: unknown = rows[0]
      if (row === undefined) return null
      if (
        !row ||
        typeof row !== 'object' ||
        !('display_name' in row) ||
        typeof row.display_name !== 'string' ||
        !('bio' in row) ||
        typeof row.bio !== 'string'
      )
        throw new Error('Profile storage returned an invalid profile.')
      return { display_name: row.display_name, bio: row.bio }
    },
    async save(profile: MemberProfile): Promise<void> {
      if (
        !profile.display_name.trim() ||
        profile.display_name.length > 80 ||
        profile.bio.length > 600
      )
        throw new Error(
          'Use a name of 1–80 characters and an introduction of up to 600 characters.',
        )
      await request('?on_conflict=clerk_user_id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        // The owner ID defaults to the verified JWT subject inside PostgreSQL.
        body: JSON.stringify({
          display_name: profile.display_name.trim(),
          bio: profile.bio,
        }),
      })
    },
  }
}
