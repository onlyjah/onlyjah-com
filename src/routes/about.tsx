import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/components/layouts/page-layout'
import { siteCopy } from '@/content/site-copy'
import { SourceQuote } from '@/features/editorial/source-quote'

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: 'About · OnlyJah' }] }),
  component: () => (
    <PageLayout
      title="OnlyJah"
      eyebrow="About"
      description={siteCopy('about.purpose')}
    >
      <SourceQuote id="jah-06" title="Collaboration" />
      <SourceQuote id="jah-03" title="OnlyJah / Ark" />
      <SourceQuote id="testing-unity" />
    </PageLayout>
  ),
})
