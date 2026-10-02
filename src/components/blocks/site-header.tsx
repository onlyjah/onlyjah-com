import { Menu } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

type SiteHeaderProps = {
  brand: ReactNode
  links: readonly { label: string; href: string }[]
  actions?: ReactNode
  accent?: ReactNode
  activePath?: string
}

export function SiteHeader({
  brand,
  links,
  actions,
  accent,
  activePath = '/',
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false)
  // Provider controls and identity arrive through slots to keep this portable.
  function isActive(href: string) {
    return activePath === href || activePath.startsWith(`${href}/`)
  }
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      {accent}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
        {brand}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {links.map((link) => (
            <Button
              key={link.href}
              size="sm"
              variant={isActive(link.href) ? 'secondary' : 'ghost'}
              render={
                <a
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </a>
              }
              nativeButton={false}
            />
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {actions}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu aria-hidden="true" />
                </Button>
              }
            />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>Explore the app.</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile navigation" className="grid gap-2 px-4">
                {links.map((link) => (
                  <Button
                    key={link.href}
                    variant={isActive(link.href) ? 'secondary' : 'ghost'}
                    className="justify-start"
                    onClick={() => setOpen(false)}
                    render={
                      <a
                        href={link.href}
                        aria-current={isActive(link.href) ? 'page' : undefined}
                      >
                        {link.label}
                      </a>
                    }
                    nativeButton={false}
                  />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
