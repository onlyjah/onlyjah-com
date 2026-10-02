import { useAuth } from '@clerk/react'
import { ClientOnly } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { browserPublicApi } from '@/features/publishing/browser-public-api'
import { createDataApi, errorMessage } from '@/features/publishing/data-api'
import { PublicFeed } from '@/features/publishing/public-feed'

type Artist = {
  slug: string
  display_name: string
  bio: string
  blog_repo: string
}
const fields = 'slug,display_name,bio,blog_repo'
const url = import.meta.env.VITE_NEON_DATA_API_URL
export function ArtistProfileForm() {
  const { getToken, userId } = useAuth()
  const request = useMemo(
    () => (url ? createDataApi({ url, getToken }) : null),
    [getToken],
  )
  const [artist, setArtist] = useState<Artist>({
    slug: '',
    display_name: '',
    bio: '',
    blog_repo: '',
  })
  const [existing, setExisting] = useState(false)
  const [state, setState] = useState('loading')
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  // biome-ignore lint/correctness/useExhaustiveDependencies: retry intentionally repeats a failed load.
  useEffect(() => {
    if (!request || !userId) return
    const controller = new AbortController()
    setState('loading')
    setError('')
    request(
      `artist_profiles?owner_id=eq.${encodeURIComponent(userId)}&select=${fields}&limit=1`,
      { signal: controller.signal },
    )
      .then((response) => response.json())
      .then((rows: Artist[]) => {
        if (!controller.signal.aborted) {
          setArtist(
            rows[0] ?? { slug: '', display_name: '', bio: '', blog_repo: '' },
          )
          setExisting(rows.length > 0)
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
  }, [request, userId, retry])
  if (!request) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Public artist profile</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault()
            if (
              !/^[a-z0-9][a-z0-9-]{2,39}$/.test(artist.slug) ||
              artist.slug === 'onlyjah'
            ) {
              setError(
                'Use a unique handle of 3–40 lowercase letters, numbers or hyphens. OnlyJah is reserved.',
              )
              return
            }
            setState('saving')
            setError('')
            try {
              await request('artist_profiles?on_conflict=owner_id', {
                method: 'POST',
                headers: {
                  Prefer: 'resolution=merge-duplicates,return=minimal',
                },
                body: JSON.stringify(artist),
              })
              setExisting(true)
              setState('saved')
            } catch (cause) {
              setError(errorMessage(cause))
              setState('ready')
            }
          }}
        >
          <p className="text-sm text-muted-foreground">
            Saving makes these artist details public. Your private account
            introduction remains separate.
          </p>
          <fieldset
            disabled={
              state === 'loading' || state === 'saving' || state === 'error'
            }
            className="space-y-4"
          >
            {(['slug', 'display_name', 'blog_repo'] as const).map((key) => (
              <div className="space-y-2" key={key}>
                <Label htmlFor={`artist-${key}`}>
                  {key === 'slug'
                    ? 'Public handle'
                    : key === 'display_name'
                      ? 'Artist name'
                      : 'Blog repository · optional public GitHub URL'}
                </Label>
                <Input
                  id={`artist-${key}`}
                  value={artist[key]}
                  disabled={key === 'slug' && existing}
                  required={key !== 'blog_repo'}
                  maxLength={
                    key === 'slug' ? 40 : key === 'display_name' ? 80 : 200
                  }
                  type={key === 'blog_repo' ? 'url' : 'text'}
                  onChange={(event) => {
                    setArtist({ ...artist, [key]: event.target.value })
                    setState('ready')
                  }}
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="artist-bio">Public introduction</Label>
              <Textarea
                id="artist-bio"
                maxLength={600}
                value={artist.bio}
                onChange={(event) =>
                  setArtist({ ...artist, bio: event.target.value })
                }
              />
            </div>
            <Button type="submit">
              {state === 'saving' ? 'Saving…' : 'Save public artist profile'}
            </Button>
          </fieldset>
          {state === 'saved' && (
            <p role="status">
              Public artist profile saved.{' '}
              <a
                href={`/artist?name=${encodeURIComponent(artist.slug)}`}
                className="text-primary underline"
              >
                View profile
              </a>
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {state === 'error' && (
            <Button
              variant="outline"
              type="button"
              onClick={() => setRetry((value) => value + 1)}
            >
              Try again
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
function LoadedArtist({ slug }: { slug: string }) {
  const [artist, setArtist] = useState<Artist | null>(null)
  const [message, setMessage] = useState('Loading artist…')
  useEffect(() => {
    const controller = new AbortController()
    if (!url) {
      setMessage('The artist directory is not connected yet.')
      return
    }
    if (!/^[a-z0-9][a-z0-9-]{2,39}$/.test(slug)) {
      setMessage('Choose an artist from a published work.')
      return
    }
    createDataApi(browserPublicApi)(
      `artist_profiles?slug=eq.${encodeURIComponent(slug)}&select=${fields}&limit=1`,
      { signal: controller.signal },
      false,
    )
      .then((response) => response.json())
      .then((rows: Artist[]) => {
        if (!controller.signal.aborted) {
          setArtist(rows[0] ?? null)
          setMessage(rows.length ? '' : 'Artist not found.')
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setMessage(errorMessage(cause))
      })
    return () => controller.abort()
  }, [slug])
  if (!artist) return <p role="status">{message}</p>
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{artist.display_name}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap">{artist.bio}</p>
          {/^https:\/\/github\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\/?$/.test(
            artist.blog_repo,
          ) && (
            <a
              href={artist.blog_repo}
              rel="noopener noreferrer"
              target="_blank"
              className="text-primary underline"
            >
              Public blog repository
            </a>
          )}
        </CardContent>
      </Card>
      <PublicFeed artist={slug} target="personal" />
    </div>
  )
}
export function PublicArtist({ slug }: { slug: string }) {
  return (
    <ClientOnly fallback={<p>Live artist profile</p>}>
      <LoadedArtist slug={slug} />
    </ClientOnly>
  )
}
