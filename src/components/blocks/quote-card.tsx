import { Quote } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

type QuoteCardProps = {
  text: string
  author: string
  title?: string
  citation: { href: string; label: string }
  collapsible?: boolean
  className?: string
}

export function QuoteCard({
  text,
  author,
  title,
  citation,
  collapsible = true,
  className,
}: QuoteCardProps) {
  const [expanded, setExpanded] = useState(false)
  const id = useId()
  // Collapse presentation only: preserve the complete quotation in the DOM.
  const canExpand = collapsible && text.length > 220
  return (
    <Card className={cn('h-full', className)}>
      {title && (
        <CardHeader>
          <CardTitle>
            <h2 className="flex items-center gap-3 text-lg">
              <Quote className="size-4 text-primary" aria-hidden="true" />
              {title}
            </h2>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <figure className="space-y-5">
          <blockquote
            id={id}
            className={cn(
              'text-pretty text-lg leading-8',
              canExpand && !expanded && 'line-clamp-4',
            )}
          >
            <p>{text}</p>
          </blockquote>
          <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{author}</span>
            <a
              className="underline underline-offset-4 hover:text-foreground"
              href={citation.href}
            >
              {citation.label}
            </a>
          </figcaption>
        </figure>
      </CardContent>
      {canExpand && (
        <CardFooter className="mt-auto">
          <Button
            size="sm"
            variant="ghost"
            aria-expanded={expanded}
            aria-controls={id}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show less' : 'Read full quote'}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
