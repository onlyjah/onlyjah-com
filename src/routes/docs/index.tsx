import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { LinkCard } from '@/components/blocks/link-card'
import { PageLayout } from '@/components/layouts/page-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { chapters } from '@/content/manual'

export const Route = createFileRoute('/docs/')({
  head: () => ({ meta: [{ title: 'The living manual · OnlyJah' }] }),
  component: Docs,
})

const tags = [...new Set(chapters.flatMap((chapter) => chapter.tags))].sort()

function Docs() {
  const [tag, setTag] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const visible = chapters.filter(
    (chapter) =>
      (!tag || chapter.tags.includes(tag)) &&
      `${chapter.title} ${chapter.tags.join(' ')}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  )
  return (
    <PageLayout
      title="The living manual"
      eyebrow="Documentation"
      description="Features, plans, architecture, philosophies, and methodologies."
      actions={
        <Button
          variant="outline"
          render={<Link to="/docs/words">In Jah’s words</Link>}
          nativeButton={false}
        />
      }
    >
      <div className="space-y-6">
        <LinkCard
          title="Vocabulary"
          href="/docs/terms"
          tags={['Ark', 'Forge', 'Realm']}
        />
        <div className="max-w-sm space-y-2">
          <Label htmlFor="docs-search">Find a chapter</Label>
          <Input
            id="docs-search"
            type="search"
            placeholder="Search titles and tags…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <fieldset className="space-y-3">
          <legend className="mb-3 text-sm font-medium">Filter by tag</legend>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={tag === null ? 'default' : 'outline'}
              aria-pressed={tag === null}
              onClick={() => setTag(null)}
            >
              All
            </Button>
            {tags.map((item) => (
              <Button
                key={item}
                size="sm"
                variant={item === tag ? 'default' : 'outline'}
                aria-pressed={item === tag}
                onClick={() => setTag(item)}
              >
                {item}
              </Button>
            ))}
          </div>
        </fieldset>
        <p role="status" className="text-sm text-muted-foreground">
          {visible.length} chapters{tag ? ` tagged ${tag}` : ''}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((chapter) => (
            <LinkCard
              key={chapter.slug}
              title={chapter.label}
              href={`/docs/${chapter.slug}`}
              tags={chapter.tags}
              eyebrow={chapter.status}
              footer={`Updated ${chapter.updated}`}
            />
          ))}
        </div>
        {!visible.length && (
          <p className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
            No chapters match. Try another title or tag.
          </p>
        )}
      </div>
    </PageLayout>
  )
}
