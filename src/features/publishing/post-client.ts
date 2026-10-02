import { createDataApi, DataApiError, type DataApiOptions } from './data-api.ts'

export type Access = {
  user_id: string
  drafts: boolean
  personal_publish: boolean
  onlyjah_publish: boolean
  curate: boolean
  ketema: boolean
  marketplace_post?: boolean
  file_upload?: boolean
  organization_create?: boolean
  comment_moderate?: boolean
}
export type PostInput = {
  title: string
  body: string
  kind: 'writing' | 'music' | 'gallery' | 'video'
  target: 'personal' | 'onlyjah'
  embed_urls: string[]
  gallery_urls: string[]
  tags: string[]
}
export type Post = PostInput & {
  id: string
  owner_id?: string
  status: 'draft' | 'published'
  revision: number
  author_name: string
  artist_slug: string
  featured: boolean
  published_at: string | null
}
export const publicPostFields =
  'id,target,status,kind,title,body,embed_urls,gallery_urls,tags,artist_slug,author_name,featured,revision,published_at'
export function assertUuid(id: string) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    throw new Error('Invalid publication identifier.')
}
export function validatePost(post: PostInput) {
  if (
    !post.title.trim() ||
    post.title.length > 160 ||
    post.body.length > 100000
  )
    throw new Error(
      'Use a title of 1–160 characters and a body of at most 100,000 characters.',
    )
  if (
    !['writing', 'music', 'gallery', 'video'].includes(post.kind) ||
    !['personal', 'onlyjah'].includes(post.target)
  )
    throw new Error('Choose a valid collection and publication identity.')
  if (
    post.embed_urls.length > 12 ||
    post.gallery_urls.length > 12 ||
    post.tags.length > 8 ||
    post.tags.join(',').length > 240
  )
    throw new Error('Use at most 12 media links, 12 gallery images and 8 tags.')
}
export function createPostClient(options: DataApiOptions) {
  const request = createDataApi(options)
  async function changed(
    path: string,
    body: unknown,
    method: string,
  ): Promise<Post> {
    const response = await request(path, {
      method,
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(body),
    })
    const rows: Post[] = await response.json()
    if (rows.length !== 1)
      throw new DataApiError(
        'conflict',
        'The saved draft changed or is no longer accessible. Reload it before saving.',
      )
    return rows[0]
  }
  return {
    async access(expectedUser: string): Promise<Access> {
      const response = await request('rpc/my_access', {
        method: 'POST',
        body: '{}',
      })
      const access: Access = await response.json()
      if (
        access.user_id !== expectedUser ||
        !access.drafts ||
        ['personal_publish', 'onlyjah_publish', 'curate', 'ketema'].some(
          (key) => typeof access[key as keyof Access] !== 'boolean',
        )
      )
        throw new Error(
          'Storage returned an unexpected account identity. Workspace access is paused.',
        )
      return access
    },
    async mine(userId: string, signal?: AbortSignal): Promise<Post[]> {
      return (
        await request(
          `posts?owner_id=eq.${encodeURIComponent(userId)}&select=*&order=updated_at.desc&limit=100`,
          { signal },
        )
      ).json()
    },
    async save(input: PostInput, saved?: Pick<Post, 'id' | 'revision'>) {
      validatePost(input)
      // Explicit whitelist: callers cannot submit owner, permissions or featured status.
      const body = {
        title: input.title.trim(),
        body: input.body,
        kind: input.kind,
        target: input.target,
        embed_urls: input.embed_urls,
        gallery_urls: input.gallery_urls,
        tags: input.tags,
      }
      if (!saved) return changed('posts', body, 'POST')
      assertUuid(saved.id)
      if (!Number.isInteger(saved.revision) || saved.revision < 1)
        throw new Error('Invalid draft revision.')
      return changed(
        `posts?id=eq.${saved.id}&revision=eq.${saved.revision}`,
        body,
        'PATCH',
      )
    },
    async status(post: Pick<Post, 'id' | 'revision'>, status: Post['status']) {
      assertUuid(post.id)
      if (!['draft', 'published'].includes(status))
        throw new Error('Invalid publication status.')
      return changed(
        `posts?id=eq.${post.id}&revision=eq.${post.revision}`,
        { status },
        'PATCH',
      )
    },
    async featured(post: Pick<Post, 'id' | 'revision'>, featured: boolean) {
      assertUuid(post.id)
      return changed(
        `posts?id=eq.${post.id}&revision=eq.${post.revision}`,
        { featured },
        'PATCH',
      )
    },
    async publicFeed(
      filters: {
        target?: 'personal' | 'onlyjah'
        kind?: Post['kind']
        artist?: string
        featured?: boolean
      } = {},
      signal?: AbortSignal,
    ): Promise<Post[]> {
      const query = new URLSearchParams({
        select: publicPostFields,
        status: 'eq.published',
        order: 'published_at.desc',
        limit: '40',
      })
      if (filters.target) query.set('target', `eq.${filters.target}`)
      if (filters.kind) query.set('kind', `eq.${filters.kind}`)
      if (filters.artist) query.set('artist_slug', `eq.${filters.artist}`)
      if (filters.featured) query.set('featured', 'eq.true')
      return (await request(`posts?${query}`, { signal }, false)).json()
    },
    async publication(id: string, signal?: AbortSignal): Promise<Post | null> {
      assertUuid(id)
      const rows: Post[] = await (
        await request(
          `posts?id=eq.${id}&status=eq.published&select=${publicPostFields}&limit=1`,
          { signal },
          false,
        )
      ).json()
      return rows[0] ?? null
    },
  }
}
