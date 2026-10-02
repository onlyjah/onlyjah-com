import { LinkCard, type LinkCardProps } from '@/components/blocks/link-card'
import { Section } from '@/components/sections/section'

// One responsive layout for link collections; no route or product knowledge.
export function CardGrid({
  title,
  description,
  items,
}: {
  title?: string
  description?: string
  items: readonly LinkCardProps[]
}) {
  return (
    <Section title={title} description={description}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <LinkCard key={item.href} {...item} />
        ))}
      </div>
    </Section>
  )
}
