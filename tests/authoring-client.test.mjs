import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createDataApi } from '../src/features/publishing/data-api.ts'
import { galleryUrl, mediaEmbed } from '../src/features/publishing/embed.ts'
import { createPostClient } from '../src/features/publishing/post-client.ts'

const url = 'https://ep-example.apirest.us-east-2.aws.neon.tech/neondb/rest/v1'
const id = '12345678-1234-1234-1234-123456789abc'
const input = {
  title: 'In my words',
  body: 'Draft',
  kind: 'writing',
  target: 'personal',
  embed_urls: [],
  gallery_urls: [],
  tags: [],
}

test('private authoring without a token never makes a request', async () => {
  let calls = 0
  const api = createDataApi({
    url,
    getToken: async () => null,
    fetcher: async () => {
      calls++
      return Response.json([])
    },
  })
  await assert.rejects(api('posts'), /Sign in/)
  assert.equal(calls, 0)
})
test('token/provider failures are sanitized', async () => {
  const api = createDataApi({
    url,
    getToken: async () => {
      throw new Error('secret provider detail')
    },
  })
  await assert.rejects(
    api('posts'),
    (error) => !error.message.includes('secret') && error.reason === 'session',
  )
})
test('access refuses a mismatched server subject even if permissions are true', async () => {
  const client = createPostClient({
    url,
    getToken: async () => 'session',
    fetcher: async () =>
      Response.json({
        user_id: 'other',
        drafts: true,
        personal_publish: true,
        onlyjah_publish: true,
        curate: true,
        ketema: true,
      }),
  })
  await assert.rejects(client.access('me'), /unexpected account identity/)
})
test('private index filters the current user as well as relying on RLS', async () => {
  const client = createPostClient({
    url,
    getToken: async () => 'session',
    fetcher: async (target, options) => {
      assert.ok(target.includes('owner_id=eq.user_me'))
      assert.equal(options.headers.get('Authorization'), 'Bearer session')
      return Response.json([])
    },
  })
  assert.deepEqual(await client.mine('user_me'), [])
})
test('draft creation whitelists fields and cannot supply identity, grants or publication status', async () => {
  const client = createPostClient({
    url,
    getToken: async () => 'session',
    fetcher: async (target, options) => {
      assert.equal(target, `${url}/posts`)
      const body = JSON.parse(options.body)
      assert.deepEqual(body, input)
      return Response.json([{ ...body, id, revision: 1, status: 'draft' }])
    },
  })
  await client.save({
    ...input,
    owner_id: 'someone_else',
    status: 'published',
    featured: true,
    onlyjah_publish: true,
  })
})
test('a stale draft update is an error, not a successful save', async () => {
  const client = createPostClient({
    url,
    getToken: async () => 'session',
    fetcher: async (target) => {
      assert.ok(target.includes('revision=eq.3'))
      return Response.json([])
    },
  })
  await assert.rejects(
    client.save(input, { id, revision: 3 }),
    /changed or is no longer accessible/,
  )
})
test('public publication requests send no token and explicitly filter published rows', async () => {
  const client = createPostClient({
    url,
    getToken: async () => {
      throw new Error('must not ask for a token')
    },
    fetcher: async (target, options) => {
      assert.ok(target.includes('status=eq.published'))
      assert.equal(options.headers.get('Authorization'), null)
      return Response.json([])
    },
  })
  assert.equal(await client.publication(id), null)
})
test('bad IDs and oversized posts fail before writes', async () => {
  let calls = 0
  const client = createPostClient({
    url,
    getToken: async () => 'session',
    fetcher: async () => {
      calls++
      return Response.json([])
    },
  })
  await assert.rejects(
    client.status({ id: 'a&owner_id=eq.other', revision: 1 }, 'published'),
    /Invalid publication/,
  )
  await assert.rejects(
    client.save({ ...input, body: 'x'.repeat(100001) }),
    /100,000/,
  )
  assert.equal(calls, 0)
})
test('API failures never expose backend text', async () => {
  const api = createDataApi({
    url,
    getToken: async () => 'session',
    fetcher: async () => new Response('secret backend detail', { status: 403 }),
  })
  await assert.rejects(
    api('posts'),
    (error) => error.reason === 'denied' && !error.message.includes('secret'),
  )
})
test('media links allow selected providers but reject HTML, credentials and lookalike domains', () => {
  assert.equal(
    mediaEmbed('https://youtu.be/abcdefghijk')?.src,
    'https://www.youtube-nocookie.com/embed/abcdefghijk',
  )
  assert.equal(
    mediaEmbed('https://open.spotify.com/track/abc123')?.provider,
    'Spotify',
  )
  assert.equal(
    mediaEmbed('https://soundcloud.com/artist/track')?.provider,
    'SoundCloud',
  )
  for (const value of [
    '<iframe src="https://youtube.com"></iframe>',
    'javascript:alert(1)',
    'https://youtube.com.evil.test/watch?v=abcdefghijk',
    'https://user:pass@youtube.com/watch?v=abcdefghijk',
    'https://youtube.com:444/watch?v=abcdefghijk',
    'https://youtube.com/watch?v=bad',
  ])
    assert.equal(mediaEmbed(value), null)
  assert.equal(galleryUrl('https://example.test/image.png'), true)
  for (const value of [
    'data:image/png;base64,abc',
    'https://example.test/image.svg',
    'https://u:p@example.test/image.png',
  ])
    assert.equal(galleryUrl(value), false)
})

test('public reads use only the guest token, never a member session', async () => {
  const request = createDataApi({
    url,
    getToken: async () => {
      throw new Error('member token requested')
    },
    getAnonymousToken: async () => 'guest',
    fetcher: async (_target, options) => {
      assert.equal(options.headers.get('Authorization'), 'Bearer guest')
      return Response.json([])
    },
  })
  await request('posts', {}, false)
})
