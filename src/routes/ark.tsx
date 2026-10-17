import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '@/components/layouts/page-layout'
import { ArkLanding } from '@/features/ark/landing'
// Jah Noah [Q007]: "all my projects are sovereign"
// Engineering: /ark uses OnlyJah's root frame; the source snapshot is the UI kit's pinned 0.1.0 block.
export const Route = createFileRoute('/ark')({
  head: () => ({ meta: [{ title: 'Ark · OnlyJah' }] }),
  component: () => (
    <PageLayout title="Ark" eyebrow="OnlyJah / Forge">
      <ArkLanding />
    </PageLayout>
  ),
})
