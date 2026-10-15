import type { ReactNode } from 'react'
import { Button } from '../ui/button'

export function NavigationBar({ brand, links, actions, activePath = '/' }: {
  brand: ReactNode
  links: readonly { label: string; href: string }[]
  actions?: ReactNode
  activePath?: string
}) {
  return <header className="topbar">{brand}<nav className="nav" aria-label="Main navigation">
    {links.map(link => <Button key={link.href} variant="link" className="nav-link" nativeButton={false}
      render={<a href={link.href} aria-current={activePath.replace(/\/$/, '') === link.href.replace(/\/$/, '') || activePath.startsWith(`${link.href.replace(/\/$/, '')}/`) ? 'page' : undefined}>{link.label}</a>} />)}
    {actions}
  </nav></header>
}
