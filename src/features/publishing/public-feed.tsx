import { ClientOnly } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { LinkCard } from '@/components/blocks/link-card'
import { Button } from '@/components/ui/button'
import { browserPublicApi } from '@/features/publishing/browser-public-api'
import { errorMessage } from './data-api'
import { createPostClient, type Post } from './post-client'

const url = import.meta.env.VITE_NEON_DATA_API_URL
export type FeedFilters = {
  target?: 'personal' | 'onlyjah'
  kind?: Post['kind']
  artist?: string
  featured?: boolean
}
function LoadedFeed({ target, kind, artist, featured }: FeedFilters) {
  const client = useMemo(
    () => (url ? createPostClient(browserPublicApi) : null),
    [],
  )
  const [rows, setRows] = useState<Post[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  // biome-ignore lint/correctness/useExhaustiveDependencies: retry intentionally repeats a failed load.
  useEffect(() => {
    if (!client) return
    const controller = new AbortController()
    setState('loading')
    client
      .publicFeed({ target, kind, artist, featured }, controller.signal)
      .then((posts) => {
        if (!controller.signal.aborted) {
          setRows(posts)
          setState('ready')
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause))
          setState('error')
        }
      })
    return () => controller.abort()
  }, [client, target, kind, artist, featured, retry])
  if (!client)
    return (
      <p className="text-sm text-muted-foreground">
        The live collection is not connected yet.
      </p>
    )
  if (state === 'loading')
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Loading the collection…
      </p>
    )
  if (state === 'error')
    return (
      <div className="space-y-3">
        <p role="status" className="text-sm text-muted-foreground">
          {error}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRetry((value) => value + 1)}
        >
          Try again
        </Button>
      </div>
    )
  if (!rows.length)
    return (
      <p className="text-sm text-muted-foreground">
        No works published in this collection yet.
      </p>
    )
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rows.map((post) => (
        <LinkCard
          key={post.id}
          title={post.title}
          href={`/media/post?id=${post.id}`}
          eyebrow={
            post.target === 'onlyjah'
              ? post.featured
                ? 'OnlyJah · featured'
                : 'OnlyJah'
              : post.author_name
          }
          description={
            post.body.slice(0, 160) + (post.body.length > 160 ? '…' : '')
          }
          tags={[post.kind, ...post.tags]}
        />
      ))}
    </div>
  )
}
export function PublicFeed(props: FeedFilters) {
  return (
    <ClientOnly
      fallback={
        <p className="text-sm text-muted-foreground">Live collection</p>
      }
    >
      <LoadedFeed {...props} />
    </ClientOnly>
  )
}
