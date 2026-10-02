import { useAuth } from '@clerk/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Access } from './post-client'

export function AuthoringAccess({
  access,
  busy,
  dirty,
  onRetry,
  setNotice,
  setError,
}: {
  access: Access | null
  busy: boolean
  dirty: boolean
  onRetry: () => void
  setNotice: (value: string) => void
  setError: (value: string) => void
}) {
  const { userId, getToken } = useAuth()
  return (
    <Card className="bg-accent/40">
      <CardHeader>
        <CardTitle>
          <h2>Your authoring access</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {access ? 'Private drafts · available' : 'Checking your workspace'}
          </Badge>
          <Badge variant="secondary">
            Personal publishing ·{' '}
            {access
              ? access.personal_publish
                ? 'enabled'
                : 'not granted'
              : 'not verified'}
          </Badge>
          <Badge variant="secondary">
            OnlyJah publishing ·{' '}
            {access
              ? access.onlyjah_publish
                ? 'enabled'
                : 'not granted'
              : 'not verified'}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={busy || dirty}
          >
            Check access again
          </Button>
          <details className="w-full space-y-3">
            <summary className="cursor-pointer text-sm">Advanced tools</summary>
            <p className="break-all text-sm">
              Account: <code>{userId}</code>
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  // Pick up signed claim changes immediately instead of cached tokens.
                  const token = await getToken({ skipCache: true })
                  if (!token) throw new Error('Sign in again.')
                  await navigator.clipboard.writeText(token)
                  setNotice(
                    'Short-lived API token copied. Keep it private; never paste it into chat.',
                  )
                } catch {
                  setError(
                    'The token could not be copied. Check browser clipboard permissions.',
                  )
                }
              }}
            >
              Copy short-lived API token
            </Button>
            <a
              href="/docs/authoring"
              className="self-center text-sm text-primary underline"
            >
              API & authoring guide
            </a>
          </details>
        </div>
      </CardContent>
    </Card>
  )
}
