import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function ItemEditor({
  title,
  body,
  kind,
  status,
  kinds,
  statuses,
  disabled,
  children,
  onChange,
  onSave,
}: {
  title: string
  body: string
  kind: string
  status: string
  kinds: string[]
  statuses: string[]
  disabled: boolean
  children?: React.ReactNode
  onChange: (field: 'title' | 'body' | 'kind' | 'status', value: string) => void
  onSave: () => void
}) {
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSave()
      }}
    >
      <fieldset disabled={disabled} className="space-y-4">
        <Label>
          Title
          <Input
            value={title}
            maxLength={160}
            required
            onChange={(event) => onChange('title', event.target.value)}
          />
        </Label>
        <Label>
          Type
          <select
            className="w-full rounded-md border bg-background p-2"
            value={kind}
            onChange={(event) => onChange('kind', event.target.value)}
          >
            {kinds.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Label>
        <Label>
          Status
          <select
            className="w-full rounded-md border bg-background p-2"
            value={status}
            onChange={(event) => onChange('status', event.target.value)}
          >
            {statuses.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </Label>
        <Label>
          Content
          <Textarea
            rows={8}
            value={body}
            onChange={(event) => onChange('body', event.target.value)}
          />
        </Label>
        {children}
        <Button type="submit">Save</Button>
      </fieldset>
    </form>
  )
}
