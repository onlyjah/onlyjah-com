import { useAuth } from '@clerk/react'
import { useEffect, useMemo, useState } from 'react'
import { ItemEditor } from '@/components/blocks/item-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MemberGate } from '@/features/auth/member-gate'
import { errorMessage } from '@/features/publishing/data-api'
import {
  type Access,
  createPostClient,
} from '@/features/publishing/post-client'
import {
  createItemClient,
  itemKinds,
  marketKinds,
  type WorkspaceInput,
  type WorkspaceItem,
} from './item-client'

function fresh(scope: 'forge' | 'market'): WorkspaceInput {
  return {
    kind: scope === 'forge' ? 'project' : 'offering',
    title: '',
    body: '',
    status: 'draft',
    links: [],
    editor_ids: [],
    price_label: '',
  }
}
function Loaded({ scope }: { scope: 'forge' | 'market' }) {
  const { userId, getToken } = useAuth()
  const [items, setItems] = useState<WorkspaceItem[]>([])
  const [saved, setSaved] = useState<WorkspaceItem>()
  const [input, setInput] = useState<WorkspaceInput>(() => fresh(scope))
  const [access, setAccess] = useState<Access | null>(null)
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [message, setMessage] = useState('')
  const options = useMemo(
    () => ({
      url:
        import.meta.env.VITE_NEON_DATA_API_URL ||
        'https://unconfigured.invalid/rest/v1',
      getToken: () => getToken({ skipCache: true }),
    }),
    [getToken],
  )
  const client = useMemo(
    () => createItemClient(options, scope),
    [options, scope],
  )
  useEffect(() => {
    if (!userId || !import.meta.env.VITE_NEON_DATA_API_URL) return
    const controller = new AbortController()
    createPostClient(options)
      .access(userId)
      .then(async (rights) => {
        const rows = await client.list(userId, controller.signal)
        if (!controller.signal.aborted) {
          setAccess(rights)
          setItems(rows)
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setMessage(errorMessage(cause))
      })
    return () => controller.abort()
  }, [userId, options, client])
  useEffect(() => {
    if (!dirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])
  if (!import.meta.env.VITE_NEON_DATA_API_URL)
    return <p>Workspace connection pending.</p>
  const canPublish = access?.marketplace_post || access?.curate
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>
            {scope === 'forge'
              ? 'Projects & shared documents'
              : 'Your marketplace items'}
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p role="status" className="text-sm">
          {message}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={busy || dirty}
            onClick={() => {
              setSaved(undefined)
              setInput(fresh(scope))
              setMessage('')
            }}
          >
            New item
          </Button>
          {dirty && (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => {
                setInput(saved ?? fresh(scope))
                setDirty(false)
                setMessage('Unsaved changes discarded.')
              }}
            >
              Discard changes
            </Button>
          )}
          <Button
            variant="outline"
            disabled={busy || dirty || !userId}
            onClick={async () => {
              if (!userId) return
              try {
                setItems(await client.list(userId))
                setMessage('Items refreshed.')
              } catch (cause) {
                setMessage(errorMessage(cause))
              }
            }}
          >
            Refresh
          </Button>
          {items.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              disabled={busy || dirty}
              onClick={() => {
                setSaved(item)
                setInput(item)
                setMessage('')
              }}
            >
              {item.title}
            </Button>
          ))}
        </div>
        <ItemEditor
          {...input}
          kinds={scope === 'forge' ? itemKinds : marketKinds}
          statuses={
            scope === 'forge'
              ? ['draft', 'active', 'completed']
              : canPublish
                ? ['draft', 'published']
                : ['draft']
          }
          disabled={busy || !access}
          onChange={(field, value) => {
            setInput((prior) => ({ ...prior, [field]: value }))
            setDirty(true)
          }}
          onSave={async () => {
            setBusy(true)
            try {
              const row = await client.save(input, saved)
              setSaved(row)
              setInput(row)
              setItems((prior) => [
                row,
                ...prior.filter((item) => item.id !== row.id),
              ])
              setDirty(false)
              setMessage('Saved. Refresh to load your stored item.')
            } catch (cause) {
              setMessage(errorMessage(cause))
            } finally {
              setBusy(false)
            }
          }}
        >
          {scope === 'market' ? (
            <Label>
              Exchange or price description
              <Input
                value={input.price_label}
                maxLength={100}
                onChange={(event) => {
                  setInput({ ...input, price_label: event.target.value })
                  setDirty(true)
                }}
              />
            </Label>
          ) : (
            <>
              <Label>
                Project links, one per line
                <textarea
                  className="min-h-20 w-full rounded-md border bg-background p-2"
                  value={input.links.join('\n')}
                  onChange={(event) => {
                    setInput({
                      ...input,
                      links: event.target.value.split('\n').filter(Boolean),
                    })
                    setDirty(true)
                  }}
                />
              </Label>
              <details>
                <summary className="cursor-pointer text-sm">
                  Collaborators
                </summary>
                <Label>
                  Verified account IDs, one per line
                  <textarea
                    className="min-h-20 w-full rounded-md border bg-background p-2"
                    disabled={Boolean(saved && saved.owner_id !== userId)}
                    value={input.editor_ids.join('\n')}
                    onChange={(event) => {
                      setInput({
                        ...input,
                        editor_ids: event.target.value
                          .split('\n')
                          .filter(Boolean),
                      })
                      setDirty(true)
                    }}
                  />
                </Label>
              </details>
            </>
          )}
        </ItemEditor>
      </CardContent>
    </Card>
  )
}
export function Workspace({ scope }: { scope: 'forge' | 'market' }) {
  return (
    <MemberGate>
      <Loaded scope={scope} />
    </MemberGate>
  )
}
