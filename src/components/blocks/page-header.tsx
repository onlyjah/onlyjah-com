import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type PageHeaderProps = {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  status?: string
  actions?: ReactNode
  className?: string
  headingLevel?: 'h1' | 'h2'
}

export function PageHeader({
  eyebrow,
  title,
  description,
  status,
  actions,
  className,
  headingLevel: Heading = 'h1',
}: PageHeaderProps) {
  return (
    <header className={cn('space-y-6', className)}>
      <div className="flex flex-wrap items-center gap-3">
        {eyebrow && (
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
        )}
        {status && <Badge variant="outline">{status}</Badge>}
      </div>
      <Heading className="max-w-4xl text-balance text-4xl font-semibold tracking-tight md:text-5xl">
        {title}
      </Heading>
      {description && (
        <div className="max-w-2xl text-pretty text-base leading-7 text-muted-foreground">
          {description}
        </div>
      )}
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  )
}
