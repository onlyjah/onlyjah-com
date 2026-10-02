import { ClientOnly } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Markdown } from '@/components/blocks/markdown'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { browserPublicApi } from '@/features/publishing/browser-public-api'
import { errorMessage } from './data-api'
import { downloadPost } from './download'
import { MediaAttachments } from './media-attachments'
import { createPostClient, type Post } from './post-client'

function Loaded({ id }: { id: string }) {
  const [post, setPost] = useState<Post | null>(null)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    setReady(false)
    setPost(null)
    setError('')
    if (!import.meta.env.VITE_NEON_DATA_API_URL) {
      setError('The live collection is not connected yet.')
      setReady(true)
      return
    }
    const client = createPostClient(browserPublicApi)
    client
      .publication(id, controller.signal)
      .then((row) => {
        if (!controller.signal.aborted) {
          setPost(row)
          setReady(true)
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause))
          setReady(true)
        }
      })
    return () => controller.abort()
  }, [id])
  if (error) return <p role="status">{error}</p>
  if (!ready) return <p role="status">Loading the publication…</p>
  if (!post) return <p>This work is not published or is no longer available.</p>
  return (
    <article className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge>{post.kind}</Badge>
          {post.tags.map((tag) => (
            <Badge variant="outline" key={tag}>
              {tag}
            </Badge>
          ))}
        </div>
        <h2 className="text-3xl font-semibold">{post.title}</h2>
        <p className="text-sm text-muted-foreground">
          {post.author_name} ·{' '}
          {post.target === 'onlyjah' ? (
            'OnlyJah'
          ) : (
            <a
              className="text-primary underline"
              href={`/artist?name=${encodeURIComponent(post.artist_slug)}`}
            >
              Artist profile
            </a>
          )}
        </p>
      </header>
      <Markdown>{post.body}</Markdown>
      <MediaAttachments links={post.embed_urls} images={post.gallery_urls} />
      <Button variant="outline" onClick={() => downloadPost(post)}>
        Download Markdown
      </Button>
    </article>
  )
}
export function Publication({ id }: { id: string }) {
  return (
    <ClientOnly fallback={<p>Live publication</p>}>
      <Loaded id={id} />
    </ClientOnly>
  )
}
