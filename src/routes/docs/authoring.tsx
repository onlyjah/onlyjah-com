import { createFileRoute } from '@tanstack/react-router'
import { LinkCard } from '@/components/blocks/link-card'
import { PageLayout } from '@/components/layouts/page-layout'
import { SourceQuote } from '@/features/editorial/source-quote'
export const Route = createFileRoute('/docs/authoring')({
  head: () => ({ meta: [{ title: 'Authoring · OnlyJah' }] }),
  component: () => (
    <PageLayout title="Authoring" eyebrow="Forge / Documentation">
      <SourceQuote id="jah-02" />
      <SourceQuote id="testing-forge" />
      <SourceQuote id="testing-contributor" />
      <div className="grid gap-4 md:grid-cols-2">
        <LinkCard title="Forge" href="/forge" />
        <LinkCard title="Market" href="/market" />
        <LinkCard title="Account" href="/account" />
      </div>
    </PageLayout>
  ),
})
