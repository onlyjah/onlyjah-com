import { createFileRoute, notFound } from '@tanstack/react-router'
import { chapters } from '@/content/manual'
import { DocumentPage } from '../-templates/document-page'

export const Route = createFileRoute('/docs/$slug')({
  loader: ({ params }) => {
    const chapter = chapters.find((item) => item.slug === params.slug)
    if (!chapter) throw notFound()
    return chapter
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.label ?? 'Docs'} · OnlyJah` }],
  }),
  component: ChapterRoute,
})

function ChapterRoute() {
  return <DocumentPage chapter={Route.useLoaderData()} />
}
