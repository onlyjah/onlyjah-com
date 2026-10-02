import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { ImageCard } from '@/components/blocks/image-card'
import { LinkCard } from '@/components/blocks/link-card'
import { PageHeader } from '@/components/blocks/page-header'
import { CardGrid } from '@/components/sections/card-grid'
import { Section } from '@/components/sections/section'
import { Button } from '@/components/ui/button'
import { photos } from '@/content/photos'
import { products } from '@/content/products'
import { siteCopy } from '@/content/site-copy'
import { SourceQuote } from '@/features/editorial/source-quote'

export const Route = createFileRoute('/')({
  component: Home,
  head: () => ({ meta: [{ title: 'OnlyJah / Ark' }] }),
})

function Home() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-6xl space-y-12 px-4 py-9 md:px-8 md:py-12"
    >
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <PageHeader
            eyebrow="OnlyJah / Ark"
            title={siteCopy('home.hero')}
            description={siteCopy('home.purpose')}
            className="[&_h1]:text-4xl md:[&_h1]:text-5xl"
            actions={
              <>
                <Button
                  size="lg"
                  render={
                    <Link to="/sign-up">
                      Create an account <ArrowRight aria-hidden="true" />
                    </Link>
                  }
                  nativeButton={false}
                />
                <Button
                  size="lg"
                  variant="outline"
                  render={<Link to="/docs">Explore the docs</Link>}
                  nativeButton={false}
                />
              </>
            }
          />
          <a
            href="/docs/words#jah-14"
            className="text-xs text-muted-foreground underline underline-offset-4"
          >
            Jah · Homepage interview · 2 October 2026
          </a>
        </div>
        <ImageCard {...photos.earth} priority />
      </section>
      <CardGrid
        title="Forge · Media · Realm"
        items={[
          {
            title: 'Forge',
            eyebrow: '01 / Create',
            href: '/forge',
            description: products.forge.description,
          },
          {
            title: 'Media',
            eyebrow: '02 / Publish',
            href: '/media',
            description: products.media.description,
          },
          {
            title: 'Realm',
            eyebrow: '03 / Connect',
            href: '/realm',
            description: products.realm.description,
          },
        ]}
      />
      <Section title="OnlyJah & Ark">
        <div className="grid items-start gap-4 md:grid-cols-2">
          <SourceQuote id="jah-06" title="Collaboration" />
          <SourceQuote id="jah-03" title="Twin stars" />
        </div>
      </Section>
      <Section title="Spirit, life, OnlyJah">
        <div className="grid items-center gap-6 md:grid-cols-2">
          <ImageCard {...photos.canopy} imageClassName="aspect-[4/3]" />
          <div className="space-y-4">
            <SourceQuote
              id="jah-23"
              title="Funds, vision, expertise & passion"
            />
            <LinkCard
              title="The Market"
              href="/market"
              description="OnlyJah listings"
              tags={['Community']}
            />
          </div>
        </div>
      </Section>
      <Section title="Read & explore">
        <div className="grid gap-4 md:grid-cols-2">
          <LinkCard
            title="The living manual"
            href="/docs"
            eyebrow="Documentation"
            description={siteCopy('home.purpose')}
            tags={['vision', 'architecture', 'design']}
          />
          <LinkCard
            title="Ark Notes 001"
            href="/media/news/ark-notes-001"
            eyebrow="Captain’s log"
            tags={['Draft for review']}
          />
        </div>
      </Section>
    </main>
  )
}
