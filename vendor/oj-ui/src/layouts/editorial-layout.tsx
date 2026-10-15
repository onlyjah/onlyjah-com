import type { ComponentProps, ReactNode } from 'react'
import { NavigationBar } from '../blocks/navigation-bar'
import { LinkFooter } from '../blocks/link-footer'

export function EditorialLayout({ header, footer, children }: {
  header: ComponentProps<typeof NavigationBar>
  footer: ComponentProps<typeof LinkFooter>
  children: ReactNode
}) {
  return <div className="shell"><NavigationBar {...header} /><main id="main">{children}</main><LinkFooter {...footer} /></div>
}
