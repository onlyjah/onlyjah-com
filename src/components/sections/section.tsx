import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// A titled content region; content and actions are supplied by the caller.
export function Section({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('space-y-6', className)}>
      {(title || description || action) && (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            {title && (
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
