import { Link } from '@tanstack/react-router'
import { Markdown } from '@/components/blocks/markdown'
import { PageHeader } from '@/components/blocks/page-header'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { chapters } from '@/content/manual'

export function DocumentPage({
  chapter,
}: {
  chapter: (typeof chapters)[number]
}) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 md:px-8 lg:grid-cols-[15rem_minmax(0,1fr)]"
    >
      <aside className="space-y-4 self-start lg:sticky lg:top-24">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Living manual
        </p>
        <nav
          className="grid grid-cols-2 gap-1 lg:grid-cols-1"
          aria-label="Documentation chapters"
        >
          {chapters.map((item) => (
            <Button
              key={item.slug}
              variant={item.slug === chapter.slug ? 'secondary' : 'ghost'}
              className="justify-start whitespace-normal text-left"
              render={
                <Link
                  to="/docs/$slug"
                  params={{ slug: item.slug }}
                  aria-current={item.slug === chapter.slug ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              }
              nativeButton={false}
            />
          ))}
          <Button
            variant="ghost"
            className="justify-start"
            render={<Link to="/docs/words">In Jah’s words</Link>}
            nativeButton={false}
          />
        </nav>
      </aside>
      <article className="min-w-0 space-y-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{chapter.label}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <PageHeader title={chapter.title} status={chapter.status} />
        <div className="flex flex-wrap items-center gap-2">
          {chapter.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          <span className="ml-2 text-xs text-muted-foreground">
            Updated {chapter.updated}
          </span>
        </div>
        <Markdown>{chapter.body}</Markdown>
      </article>
    </main>
  )
}
