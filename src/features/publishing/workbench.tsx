import { useAuth } from '@clerk/react'
import { useEffect, useMemo, useState } from 'react'
import { Markdown } from '@/components/blocks/markdown'
import { MarkdownEditor } from '@/components/blocks/markdown-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MemberGate } from '@/features/auth/member-gate'
import { AuthoringAccess } from './authoring-access'
import { errorMessage } from './data-api'
import { downloadPost } from './download'
import { galleryUrl, mediaEmbed } from './embed'
import { MediaAttachments } from './media-attachments'
import {
  type Access,
  createPostClient,
  type Post,
  type PostInput,
} from './post-client'

const url = import.meta.env.VITE_NEON_DATA_API_URL
const blank = (): PostInput => ({
  title: '',
  body: '',
  kind: 'writing',
  target: 'personal',
  embed_urls: [],
  gallery_urls: [],
  tags: [],
})
const lines = (text: string) =>
  text
    .split('\n')
    .map((value) => value.trim())
    .filter(Boolean)

function Editor() {
  const { getToken, userId } = useAuth()
  const client = useMemo(
    () => (url ? createPostClient({ url, getToken }) : null),
    [getToken],
  )
  const [access, setAccess] = useState<Access | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [saved, setSaved] = useState<Post | undefined>()
  const [input, setInput] = useState<PostInput>(blank)
  const [embeds, setEmbeds] = useState('')
  const [gallery, setGallery] = useState('')
  const [tags, setTags] = useState('')
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [retry, setRetry] = useState(0)
  const [preview, setPreview] = useState(false)
  // biome-ignore lint/correctness/useExhaustiveDependencies: retry intentionally repeats the access/storage request.
  useEffect(() => {
    if (!client || !userId) return
    const controller = new AbortController()
    setAccess(null)
    setPosts([])
    setError('')
    Promise.all([client.access(userId), client.mine(userId, controller.signal)])
      .then(([permissions, rows]) => {
        if (controller.signal.aborted) return
        setAccess(permissions)
        setPosts(rows)
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(errorMessage(cause))
      })
    return () => controller.abort()
  }, [client, userId, retry])
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  function choose(post?: Post) {
    if (
      dirty &&
      !window.confirm('Discard unsaved changes and open another draft?')
    )
      return
    setSaved(post)
    setInput(post ?? blank())
    setEmbeds(post?.embed_urls.join('\n') ?? '')
    setGallery(post?.gallery_urls.join('\n') ?? '')
    setTags(post?.tags.join(', ') ?? '')
    setDirty(false)
    setError('')
    setNotice('')
    setPreview(false)
  }
  function update<K extends keyof PostInput>(key: K, value: PostInput[K]) {
    setInput((previous) => ({ ...previous, [key]: value }))
    setDirty(true)
  }
  function remember(post: Post) {
    setSaved(post)
    setInput(post)
    setDirty(false)
    setPosts((previous) => [
      post,
      ...previous.filter((row) => row.id !== post.id),
    ])
  }
  async function save() {
    if (!client) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const embed_urls = lines(embeds).map(
        (link) => mediaEmbed(link)?.href ?? link,
      )
      const gallery_urls = lines(gallery)
      if (embed_urls.some((link) => !mediaEmbed(link)))
        throw new Error(
          'Use a YouTube video, SoundCloud track or Spotify track, album, playlist or episode URL.',
        )
      if (gallery_urls.some((link) => !galleryUrl(link)))
        throw new Error(
          'Gallery images need public HTTPS .jpg, .png or .webp URLs.',
        )
      const post = await client.save(
        {
          ...input,
          embed_urls,
          gallery_urls,
          tags: tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        },
        saved,
      )
      remember(post)
      setNotice('Saved to your account.')
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusy(false)
    }
  }
  async function changeStatus() {
    if (!client || !saved) return
    if (
      saved.status === 'draft' &&
      !window.confirm(
        `Publish “${saved.title}” publicly ${saved.target === 'onlyjah' ? 'as OnlyJah' : 'on your artist profile'}?`,
      )
    )
      return
    setBusy(true)
    setError('')
    try {
      const post = await client.status(
        saved,
        saved.status === 'draft' ? 'published' : 'draft',
      )
      remember(post)
      setNotice(
        post.status === 'published'
          ? 'Published.'
          : 'Returned to a private draft.',
      )
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusy(false)
    }
  }
  if (!client)
    return (
      <p>
        Draft storage isn’t connected yet. Your sign-in is available in Account.
      </p>
    )
  const canPublish =
    input.target === 'onlyjah'
      ? access?.onlyjah_publish
      : access?.personal_publish
  return (
    <div className="space-y-6">
      <AuthoringAccess
        access={access}
        busy={busy}
        dirty={dirty}
        onRetry={() => setRetry((value) => value + 1)}
        setNotice={setNotice}
        setError={setError}
      />
      <div className="grid items-start gap-6 lg:grid-cols-[16rem_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Drafts & publications</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => choose()}
              disabled={busy}
            >
              New draft
            </Button>
            {access && posts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No saved posts yet.
              </p>
            )}
            {posts.map((post) => (
              <Button
                key={post.id}
                variant={saved?.id === post.id ? 'secondary' : 'ghost'}
                className="h-auto w-full justify-start whitespace-normal py-3 text-left"
                onClick={() => choose(post)}
                disabled={busy}
              >
                <span>
                  {post.title}
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    {post.status} · {post.target}
                  </span>
                </span>
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>{saved ? 'Edit your post' : 'Create a draft'}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault()
                void save()
              }}
            >
              <fieldset disabled={!access || busy} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="post-kind">Collection</Label>
                    <select
                      id="post-kind"
                      value={input.kind}
                      onChange={(event) =>
                        update('kind', event.target.value as PostInput['kind'])
                      }
                      className="h-10 w-full rounded-md border bg-background px-3"
                    >
                      {['writing', 'music', 'gallery', 'video'].map((kind) => (
                        <option key={kind} value={kind}>
                          {kind}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="post-target">Publish as</Label>
                    <select
                      id="post-target"
                      value={input.target}
                      onChange={(event) =>
                        update(
                          'target',
                          event.target.value as PostInput['target'],
                        )
                      }
                      className="h-10 w-full rounded-md border bg-background px-3"
                      disabled={saved?.status === 'published'}
                    >
                      <option value="personal">My artist profile</option>
                      <option
                        value="onlyjah"
                        disabled={!access?.onlyjah_publish}
                      >
                        OnlyJah organization
                      </option>
                    </select>
                  </div>
                </div>
                <MarkdownEditor
                  id="post"
                  title={input.title}
                  body={input.body}
                  onTitleChange={(value) => update('title', value)}
                  onBodyChange={(value) => update('body', value)}
                  onImport={async (file) => {
                    if (
                      !/\.(md|markdown)$/i.test(file.name) ||
                      file.size > 150000
                    ) {
                      setError('Use a Markdown file under 150 KB.')
                      return
                    }
                    if (
                      dirty &&
                      !window.confirm(
                        'Replace the unsaved body with this file?',
                      )
                    )
                      return
                    try {
                      const text = await file.text()
                      if (text.length > 100000) {
                        setError('The body is limited to 100,000 characters.')
                        return
                      }
                      update('body', text)
                      if (!input.title)
                        update(
                          'title',
                          file.name.replace(/\.(md|markdown)$/i, ''),
                        )
                    } catch {
                      setError('The Markdown file could not be read.')
                    }
                  }}
                />
                <div className="space-y-2">
                  <Label htmlFor="post-embeds">
                    Music & video links · one per line
                  </Label>
                  <Textarea
                    id="post-embeds"
                    rows={3}
                    value={embeds}
                    onChange={(event) => {
                      setEmbeds(event.target.value)
                      setDirty(true)
                    }}
                    placeholder="YouTube, SoundCloud or Spotify links"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="post-gallery">
                    Gallery image URLs · one per line
                  </Label>
                  <Textarea
                    id="post-gallery"
                    rows={3}
                    value={gallery}
                    onChange={(event) => {
                      setGallery(event.target.value)
                      setDirty(true)
                    }}
                    placeholder="Public HTTPS image URLs. Upload storage comes later."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="post-tags">Tags · comma separated</Label>
                  <Input
                    id="post-tags"
                    value={tags}
                    onChange={(event) => {
                      setTags(event.target.value)
                      setDirty(true)
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="submit">
                    {busy
                      ? 'Saving…'
                      : saved?.status === 'published'
                        ? 'Save published changes'
                        : 'Save private draft'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPreview((value) => !value)}
                  >
                    {preview ? 'Close preview' : 'Preview'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => downloadPost(input)}
                  >
                    Download Markdown
                  </Button>
                  {saved && (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={
                        dirty || (!canPublish && saved.status === 'draft')
                      }
                      onClick={() => void changeStatus()}
                    >
                      {saved.status === 'published'
                        ? 'Return to draft'
                        : 'Publish'}
                    </Button>
                  )}
                  {saved?.target === 'onlyjah' &&
                    saved.status === 'published' &&
                    access?.curate && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={dirty}
                        onClick={async () => {
                          setBusy(true)
                          try {
                            remember(
                              await client.featured(saved, !saved.featured),
                            )
                          } catch (cause) {
                            setError(errorMessage(cause))
                          } finally {
                            setBusy(false)
                          }
                        }}
                      >
                        {saved.featured
                          ? 'Remove from featured'
                          : 'Feature on Media'}
                      </Button>
                    )}
                </div>
              </fieldset>
              {saved?.status === 'published' && (
                <a
                  href={`/media/post?id=${saved.id}`}
                  className="block text-sm text-primary underline"
                >
                  View publication
                </a>
              )}
              {!canPublish && access && (
                <p className="text-sm text-muted-foreground">
                  You can save private drafts. Publishing requires an authorship
                  grant; personal publishing also needs a public artist profile
                  in Account.
                </p>
              )}
              {dirty && (
                <p className="text-xs text-muted-foreground">
                  Unsaved changes. Save before leaving this page.
                </p>
              )}
              {notice && (
                <p role="status" className="text-sm text-primary">
                  {notice}
                </p>
              )}
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </form>
            {preview && (
              <section
                className="mt-8 space-y-4 border-t pt-6"
                aria-label="Draft preview"
              >
                <h2 className="text-2xl font-semibold">
                  {input.title || 'Untitled draft'}
                </h2>
                <Markdown>{input.body}</Markdown>
                <MediaAttachments
                  links={lines(embeds)}
                  images={lines(gallery)}
                />
              </section>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
function SessionEditor() {
  const { userId } = useAuth()
  return <Editor key={userId} />
}
export function Workbench() {
  return (
    <MemberGate>
      <SessionEditor />
    </MemberGate>
  )
}
