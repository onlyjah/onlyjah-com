import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// Portable controlled fields. Identity, saving, importing and permissions belong
// to the feature that composes this block, rather than the shared UI layer.
export function MarkdownEditor({
  title,
  body,
  onTitleChange,
  onBodyChange,
  onImport,
  id = 'editor',
  titleLimit = 160,
  bodyLimit = 100000,
}: {
  title: string
  body: string
  onTitleChange: (value: string) => void
  onBodyChange: (value: string) => void
  onImport?: (file: File) => void | Promise<void>
  id?: string
  titleLimit?: number
  bodyLimit?: number
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor={`${id}-title`}>Title</Label>
        <Input
          id={`${id}-title`}
          value={title}
          required
          maxLength={titleLimit}
          onChange={(event) => onTitleChange(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-body`}>Your words · Markdown</Label>
        <Textarea
          id={`${id}-body`}
          value={body}
          maxLength={bodyLimit}
          rows={16}
          onChange={(event) => onBodyChange(event.target.value)}
          className="font-mono text-sm"
        />
      </div>
      {onImport && (
        <div className="space-y-2">
          <Label htmlFor={`${id}-import`}>
            Import Markdown or a text blurb
          </Label>
          <Input
            id={`${id}-import`}
            type="file"
            accept=".md,.markdown,.txt,text/markdown,text/plain"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (file) await onImport(file)
              event.target.value = ''
            }}
          />
        </div>
      )}
    </div>
  )
}
