import { createFileRoute } from '@tanstack/react-router'
import { LinkCard } from '@/components/blocks/link-card'
import { PageHeader } from '@/components/blocks/page-header'
import { PageLayout } from '@/components/layouts/page-layout'
import { useTheme } from '@/components/providers/theme-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { products } from '@/content/products'
import { paletteProposal } from '@/features/design/palette-proposal'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/design-preview')({
  head: () => ({
    meta: [
      { title: 'Design comparison · OnlyJah' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: DesignPreview,
})

function DesignPreview() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <PageLayout
      title="Design comparison"
      eyebrow="Local review"
      status="Proposal · not applied"
      description="Compare spacing and color with the same components and words. The proposal stays on this page."
      actions={
        <>
          <Button variant="outline" onClick={() => setTheme('light')}>
            Light
          </Button>
          <Button variant="outline" onClick={() => setTheme('dark')}>
            Dark
          </Button>
          <Button variant="outline" onClick={() => setTheme('system')}>
            Use device theme
          </Button>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <Example compact={false} />
        <div style={paletteProposal[resolvedTheme]}>
          <Example compact />
        </div>
      </div>
    </PageLayout>
  )
}

// The comparison composes existing blocks instead of inventing a second UI kit.
function Example({ compact }: { compact: boolean }) {
  return (
    <section
      aria-label={
        compact ? 'Compact and brighter proposal' : 'Current roots palette'
      }
      className={cn(
        'min-w-0 space-y-6 border bg-background p-4 text-foreground sm:p-6',
        compact && 'space-y-5',
      )}
    >
      <Badge variant="outline">
        {compact ? 'B · Compact + brighter' : 'A · Current roots palette'}
      </Badge>
      <PageHeader
        headingLevel="h2"
        eyebrow="OnlyJah / Ark"
        title="A cloud-faring vessel. Universe in the sky. OnlyJah."
        className={compact ? 'space-y-4 [&_h2]:text-3xl' : undefined}
        actions={
          <Button
            render={<a href="/sign-up">Create an account</a>}
            nativeButton={false}
          />
        }
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {[products.forge, products.media, products.realm, products.ark].map(
          (product) => (
            <LinkCard
              key={product.name}
              title={product.name}
              href={product.href}
              description={product.description}
              tags={['Working direction']}
              className={
                compact
                  ? 'gap-3 py-4 [&_h3]:text-base [&_[data-slot=card-content]]:text-sm'
                  : undefined
              }
            />
          ),
        )}
      </div>
      <a
        href="/docs/words#jah-14"
        className="text-xs text-muted-foreground underline underline-offset-4"
      >
        Jah · Source quotations
      </a>
    </section>
  )
}
