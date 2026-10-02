import type { ReactNode } from 'react'
import type { LinkCardProps } from '@/components/blocks/link-card'
import { PageLayout } from '@/components/layouts/page-layout'
import { CardGrid } from '@/components/sections/card-grid'
import { SourceQuote } from '@/features/editorial/source-quote'

export function EditorialPage({
  title,
  eyebrow,
  description,
  status,
  quotes,
  related,
  children,
}: {
  title: string
  eyebrow: string
  description: string
  status?: string
  quotes: readonly { id: string; title: string }[]
  related?: readonly LinkCardProps[]
  children?: ReactNode
}) {
  return (
    <PageLayout
      title={title}
      eyebrow={eyebrow}
      description={description}
      status={status}
    >
      <div className="grid items-start gap-4 md:grid-cols-2">
        {quotes.map((quote) => (
          <SourceQuote key={quote.id} {...quote} />
        ))}
      </div>
      {children}
      {related && <CardGrid title="Explore" items={related} />}
    </PageLayout>
  )
}
