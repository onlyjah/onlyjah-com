import type { ComponentProps, ReactNode } from 'react'
import { SiteHeader } from '../blocks/site-header'
import { SiteFooter } from '../blocks/site-footer'

export function SiteLayout({ header, footer, children }: {
  header: ComponentProps<typeof SiteHeader>
  footer: ComponentProps<typeof SiteFooter>
  children: ReactNode
}) {
  return <><SiteHeader {...header} />{children}<SiteFooter {...footer} /></>
}
