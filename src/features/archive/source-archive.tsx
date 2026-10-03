import { useAuth } from '@clerk/react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MemberGate } from '@/features/auth/member-gate'
import { errorMessage } from '@/features/publishing/data-api'
import {
  createSourceClient,
  type Source,
  type SourceSummary,
} from './source-client'

function Archive() {
  const { userId, getToken } = useAuth()
  const url = import.meta.env.VITE_NEON_DATA_API_URL
  const client = useMemo(
    () => (url ? createSourceClient({ url, getToken }) : null),
    [getToken],
  )
  const [sources, setSources] = useState<SourceSummary[]>([])
  const [usage, setUsage] = useState<{
    used_bytes: number
    limit_bytes: number
    source_count: number
  }>()
  const [title, setTitle] = useState(''),
    [text, setText] = useState(''),
    [tags, setTags] = useState(''),
    [search, setSearch] = useState(''),
    [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false),
    [selected, setSelected] = useState<Source>()
  useEffect(() => {
    if (!client || !userId) return
    const controller = new AbortController()
    Promise.all([client.list(controller.signal), client.usage(userId)])
      .then(([rows, meter]) => {
        if (!controller.signal.aborted) {
          setSources(rows)
          setUsage(meter)
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setMessage(errorMessage(cause))
      })
    return () => controller.abort()
  }, [client, userId])
  useEffect(() => {
    if (!text && !title && !tags) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [text, title, tags])
  if (!client) return <p>Private source storage is not connected.</p>
  const rows = sources.filter((s) =>
    [s.title, ...s.tags].join(' ').toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>Your private source archive</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm">
          Original chats, notes and documents. Saving here does not publish
          them.
        </p>
        {usage && (
          <p role="status">
            {(usage.used_bytes / 1000000).toFixed(2)} MB of{' '}
            {usage.limit_bytes / 1000000} MB · {usage.source_count} sources
          </p>
        )}
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault()
            if (!userId) return
            setBusy(true)
            try {
              const source = await client.save({
                title,
                original_text: text,
                source_kind: 'note',
                tags: tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
              setSources((old) => [
                source,
                ...old.filter((s) => s.id !== source.id),
              ])
              setSelected(source)
              setMessage(
                'Original stored privately. Identical text reuses its existing source.',
              )
              setTitle('')
              setText('')
              setTags('')
              try {
                setUsage(await client.usage(userId))
              } catch {
                setMessage(
                  'Original stored privately. Usage could not refresh; reload to check it.',
                )
              }
            } catch (cause) {
              setMessage(errorMessage(cause))
            } finally {
              setBusy(false)
            }
          }}
        >
          <fieldset disabled={busy || !usage} className="space-y-4">
            <Label htmlFor="source-title">Source title</Label>
            <Input
              id="source-title"
              required
              maxLength={160}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Label htmlFor="source-text">Original text</Label>
            <Textarea
              id="source-text"
              required
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Label htmlFor="source-tags">Tags, comma separated</Label>
            <Input
              id="source-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <Label htmlFor="source-import">
              Load a text or Markdown source
            </Label>
            <Input
              id="source-import"
              type="file"
              accept=".txt,.md,.markdown,text/plain,text/markdown"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                if (file.size > 1000000) {
                  setMessage('Use a source under 1 MB.')
                  return
                }
                if (
                  text &&
                  !window.confirm('Replace the current unsaved source text?')
                )
                  return
                try {
                  setText(await file.text())
                  if (!title) setTitle(file.name.slice(0, 160))
                } catch {
                  setMessage('The source could not be read.')
                }
              }}
            />
            <Button type="submit">
              {busy ? 'Storing…' : 'Store original privately'}
            </Button>
          </fieldset>
        </form>
        <p role="status">{message}</p>
        <Label htmlFor="source-search">Search loaded titles and tags</Label>
        <Input
          id="source-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <p className="text-sm">
          {rows.length} of {sources.length} loaded sources
        </p>
        <div className="flex flex-wrap gap-2">
          {rows.map((source) => (
            <Button
              key={source.id}
              variant="outline"
              onClick={async () => {
                try {
                  setSelected(await client.read(source.id))
                } catch (cause) {
                  setMessage(errorMessage(cause))
                }
              }}
            >
              {source.title}
            </Button>
          ))}
        </div>
        {selected && (
          <section className="space-y-3">
            <h3 className="text-xl">{selected.title}</h3>
            <p className="text-sm">{selected.tags.join(' · ')}</p>
            <pre className="whitespace-pre-wrap break-words font-sans">
              {selected.original_text}
            </pre>
            <Button
              variant="outline"
              onClick={() => {
                const href = URL.createObjectURL(
                  new Blob([JSON.stringify(selected, null, 2)], {
                    type: 'application/json',
                  }),
                )
                const link = document.createElement('a')
                link.href = href
                link.download = 'forge-source.json'
                link.click()
                URL.revokeObjectURL(href)
              }}
            >
              Download original record
            </Button>
          </section>
        )}
      </CardContent>
    </Card>
  )
}
function SessionArchive() {
  const { userId } = useAuth()
  return <Archive key={userId} />
}
export function SourceArchive() {
  return (
    <MemberGate>
      <SessionArchive />
    </MemberGate>
  )
}
