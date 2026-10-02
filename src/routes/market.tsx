import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/components/layouts/page-layout'
import { SourceQuote } from '@/features/editorial/source-quote'
import { KetemaPerks } from '@/features/market/ketema-perks'
import { Marketplace } from '@/features/market/marketplace'
import { Workspace } from '@/features/workspace/workspace'
export const Route = createFileRoute('/market')({
  head: () => ({ meta: [{ title: 'Market · OnlyJah' }] }),
  component: () => (
    <PageLayout title="Market" eyebrow="OnlyJah / Realm">
      <SourceQuote id="jah-23" title="Funds, vision, expertise & passion" />
      <Marketplace />
      <Workspace scope="market" />
      <KetemaPerks />
    </PageLayout>
  ),
})
