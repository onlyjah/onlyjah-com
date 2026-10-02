import { useAuth, useUser } from '@clerk/react'
import { useEffect, useMemo, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createProfileClient, type MemberProfile } from './profile-client'

const dataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL

export function ProfileForm() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [profile, setProfile] = useState<MemberProfile>({
    display_name: '',
    bio: '',
  })
  const [state, setState] = useState<
    'loading' | 'ready' | 'saving' | 'saved' | 'error'
  >('loading')
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const client = useMemo(
    () =>
      dataApiUrl ? createProfileClient({ url: dataApiUrl, getToken }) : null,
    [getToken],
  )
  const defaultName = user?.fullName || user?.username || ''

  // biome-ignore lint/correctness/useExhaustiveDependencies: retry intentionally repeats a failed load.
  useEffect(() => {
    if (!client) return
    setState('loading')
    setError('')
    const controller = new AbortController()
    client
      .load(controller.signal)
      .then((value) => {
        if (controller.signal.aborted) return
        setProfile(value ?? { display_name: defaultName, bio: '' })
        setState('ready')
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setError(
          cause instanceof Error
            ? cause.message
            : 'Profile storage is unavailable. Try again.',
        )
        setState('error')
      })
    return () => controller.abort()
  }, [client, defaultName, retry])

  if (!client)
    return (
      <Alert>
        <AlertTitle>Your account is ready</AlertTitle>
        <AlertDescription>
          Profile storage isn’t connected yet. You can manage your sign-in
          details below.
        </AlertDescription>
      </Alert>
    )

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Your OnlyJah profile</h2>
        </CardTitle>
        <CardDescription>
          A name and an introduction, in your words. This draft profile is
          private to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={async (event) => {
            event.preventDefault()
            setState('saving')
            setError('')
            try {
              await client.save(profile)
              setState('saved')
            } catch (cause) {
              setError(
                cause instanceof Error
                  ? cause.message
                  : 'Your profile could not be saved. Please try again.',
              )
              setState('ready')
            }
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="display-name">Name</Label>
            <Input
              id="display-name"
              value={profile.display_name}
              maxLength={80}
              required
              disabled={
                state === 'loading' || state === 'saving' || state === 'error'
              }
              onChange={(event) => {
                setProfile({ ...profile, display_name: event.target.value })
                setState('ready')
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-bio">Introduce yourself</Label>
            <Textarea
              id="profile-bio"
              rows={5}
              value={profile.bio}
              maxLength={600}
              disabled={
                state === 'loading' || state === 'saving' || state === 'error'
              }
              onChange={(event) => {
                setProfile({ ...profile, bio: event.target.value })
                setState('ready')
              }}
            />
            <p className="text-xs text-muted-foreground">
              {profile.bio.length}/600 characters
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button
              type="submit"
              disabled={
                state === 'loading' || state === 'saving' || state === 'error'
              }
            >
              {state === 'saving' ? 'Saving…' : 'Save profile'}
            </Button>
            <p role="status" className="text-sm text-muted-foreground">
              {state === 'loading'
                ? 'Loading your profile…'
                : state === 'saved'
                  ? 'Profile saved.'
                  : ''}
            </p>
          </div>
          {error && (
            <div className="space-y-3">
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
              {state === 'error' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRetry((value) => value + 1)}
                >
                  Try again
                </Button>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
