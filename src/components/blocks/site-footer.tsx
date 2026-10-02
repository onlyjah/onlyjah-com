import type { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'

export function SiteFooter({
  brand,
  links,
  note,
}: {
  brand: ReactNode
  links: readonly { label: string; href: string }[]
  note?: string
}) {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          {brand}
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-6 text-sm text-muted-foreground"
          >
            {links.map((link) => (
              <a
                className="hover:text-foreground hover:underline underline-offset-4"
                key={link.href}
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        {note && (
          <>
            <Separator />
            <p className="font-mono text-xs text-muted-foreground">{note}</p>
          </>
        )}
      </div>
    </footer>
  )
}
