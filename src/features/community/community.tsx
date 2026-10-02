import { useAuth } from '@clerk/react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MemberGate } from '@/features/auth/member-gate'
import { createDataApi, errorMessage } from '@/features/publishing/data-api'
import {
  type Access,
  createPostClient,
} from '@/features/publishing/post-client'

type Message = {
  id: string
  body: string
  author_name: string
  created_at: string
}
function Room() {
  const { getToken, userId } = useAuth()
  const url = import.meta.env.VITE_NEON_DATA_API_URL
  const request = useMemo(
    () => (url ? createDataApi({ url, getToken }) : null),
    [getToken],
  )
  const [access, setAccess] = useState<Access | null>(null)
  const [room, setRoom] = useState('community')
  const [rows, setRows] = useState<Message[]>([])
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [moderating, setModerating] = useState<string | null>(null)
  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh rechecks membership before fetching messages.
  useEffect(() => {
    if (!url || !userId) return
    let active = true
    createPostClient({ url, getToken })
      .access(userId)
      .then((value) => {
        if (active) setAccess(value)
      })
      .catch((cause) => {
        if (active) setError(errorMessage(cause))
      })
    return () => {
      active = false
    }
  }, [url, getToken, userId, refresh])
  useEffect(() => {
    if (!request || !access) return
    const controller = new AbortController()
    setRows([])
    setModerating(null)
    request(
      `community_messages?room=eq.${room}&select=id,body,author_name,created_at&order=created_at.desc&limit=50`,
      { signal: controller.signal },
    )
      .then((response) => response.json())
      .then((messages: Message[]) => {
        if (!controller.signal.aborted) {
          setRows(messages.reverse())
          setError('')
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(errorMessage(cause))
      })
    return () => controller.abort()
  }, [request, room, access])
  if (!request) return <p>Community storage isn’t connected yet.</p>
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>
            {room === 'ketema' ? 'Ketema · invitation only' : 'Community'}
          </h2>
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={room === 'community' ? 'secondary' : 'outline'}
            onClick={() => setRoom('community')}
          >
            Community
          </Button>
          <Button
            variant={room === 'ketema' ? 'secondary' : 'outline'}
            disabled={!access?.ketema}
            onClick={() => setRoom('ketema')}
          >
            Ketema
          </Button>
          <Button
            variant="outline"
            onClick={() => setRefresh((value) => value + 1)}
          >
            Refresh
          </Button>
        </div>
        {!access?.ketema && (
          <p className="text-sm text-muted-foreground">
            Ketema access comes by invitation, separately from signup and
            organization status.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <ol aria-label="Community messages" className="space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="space-y-2 rounded-lg border bg-accent/25 p-4"
            >
              <p className="text-sm font-medium">{row.author_name}</p>
              <p className="whitespace-pre-wrap break-words">{row.body}</p>
              <time
                className="text-xs text-muted-foreground"
                dateTime={row.created_at}
              >
                {new Date(row.created_at).toLocaleString()}
              </time>
              {room === 'community' &&
                access?.comment_moderate &&
                (moderating === row.id ? (
                  <div className="space-y-2">
                    <p>Remove this community message?</p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true)
                          setError('')
                          try {
                            const response = await request(
                              `community_messages?id=eq.${encodeURIComponent(row.id)}&room=eq.community&select=id`,
                              {
                                method: 'DELETE',
                                headers: { Prefer: 'return=representation' },
                              },
                            )
                            const removed = await response.json()
                            if (!Array.isArray(removed) || removed.length !== 1)
                              throw new Error(
                                'The message was already removed or your moderation access changed.',
                              )
                            setModerating(null)
                            setRefresh((value) => value + 1)
                          } catch (cause) {
                            setError(errorMessage(cause))
                          } finally {
                            setBusy(false)
                          }
                        }}
                      >
                        Remove message
                      </Button>
                      <Button
                        variant="outline"
                        disabled={busy}
                        onClick={() => setModerating(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => setModerating(row.id)}
                  >
                    Moderate message
                  </Button>
                ))}
            </li>
          ))}
        </ol>
        {access && !rows.length && (
          <p className="text-sm text-muted-foreground">
            No messages in this room yet.
          </p>
        )}
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault()
            setBusy(true)
            setError('')
            try {
              await request('community_messages', {
                method: 'POST',
                headers: { Prefer: 'return=minimal' },
                body: JSON.stringify({ room, body: body.trim() }),
              })
              setBody('')
              setRefresh((value) => value + 1)
            } catch (cause) {
              setError(errorMessage(cause))
            } finally {
              setBusy(false)
            }
          }}
        >
          <Label htmlFor="community-message">Your message</Label>
          <Textarea
            id="community-message"
            required
            maxLength={1200}
            rows={3}
            value={body}
            disabled={!access || busy}
            onChange={(event) => setBody(event.target.value)}
          />
          <Button type="submit" disabled={!access || busy || !body.trim()}>
            {busy ? 'Sending…' : 'Send message'}
          </Button>
        </form>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Refresh to read new messages. Community message removal requires a
          separate moderation duty. Live chat and automatic abuse controls
          remain planned.
        </p>
      </CardContent>
    </Card>
  )
}
function SessionRoom() {
  const { userId } = useAuth()
  return <Room key={userId} />
}
export function Community() {
  return (
    <MemberGate>
      <SessionRoom />
    </MemberGate>
  )
}
