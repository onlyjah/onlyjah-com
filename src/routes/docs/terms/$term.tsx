import { createFileRoute, notFound } from '@tanstack/react-router'
import { LinkCard } from '@/components/blocks/link-card'
import { PageLayout } from '@/components/layouts/page-layout'
import { Section } from '@/components/sections/section'
import terms from '@/content/terms.json'
import { SourceQuote } from '@/features/editorial/source-quote'

export const Route = createFileRoute('/docs/terms/$term')({
  loader: ({ params }) => {
    const term = terms.find((item) => item.id === params.term)
    if (!term) throw notFound()
    return term
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.label ?? 'Vocabulary'} · OnlyJah` }],
  }),
  component: Term,
})
function Term() {
  const term = Route.useLoaderData()
  return (
    <PageLayout title={term.label} eyebrow="Ark / Vocabulary">
      <Section title="In Jah’s words">
        {term.quoteIds.length ? (
          term.quoteIds.map((id) => (
            <SourceQuote key={id} id={id} collapsible={false} />
          ))
        ) : (
          <p>Definition pending.</p>
        )}
      </Section>
      {term.exampleIds.length > 0 && (
        <Section title="Examples">
          {term.exampleIds.map((id) => (
            <SourceQuote key={id} id={id} />
          ))}
        </Section>
      )}
      <Section title="Related">
        <div className="grid gap-4 sm:grid-cols-2">
          {term.related.map((id) => {
            const related = terms.find((item) => item.id === id)
            return related ? (
              <LinkCard
                key={id}
                title={related.label}
                href={`/docs/terms/${id}`}
              />
            ) : null
          })}
        </div>
      </Section>
    </PageLayout>
  )
}
