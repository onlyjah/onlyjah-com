import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type LinkCardProps = {
  title: string
  href: string
  description?: ReactNode
  eyebrow?: string
  tags?: readonly string[]
  footer?: ReactNode
  className?: string
}

export function LinkCard({
  title,
  href,
  description,
  eyebrow,
  tags,
  footer,
  className,
}: LinkCardProps) {
  return (
    <Card
      className={cn(
        'relative h-full border-primary/15 shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/40',
        className,
      )}
    >
      <CardHeader>
        {eyebrow && (
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <CardTitle>
          <h3 className="text-lg">
            <a
              href={href}
              className="flex items-start justify-between gap-4 after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-ring"
            >
              {title}
              <ArrowUpRight
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </a>
          </h3>
        </CardTitle>
      </CardHeader>
      {(description || tags?.length) && (
        <CardContent className="space-y-4">
          {description && (
            <div className="text-pretty leading-6 text-muted-foreground">
              {description}
            </div>
          )}
          {tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      )}
      {footer && (
        <CardFooter className="mt-auto text-xs text-muted-foreground">
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}
