import type { ReactNode } from 'react'
import { Button } from '../ui/button'

export function LinkFooter({ brand, links, note }: {
  brand: ReactNode
  links: readonly { label: string; href: string }[]
  note?: ReactNode
}) {
  return <footer className="footer">{brand}<div className="footer-links">
    {links.map(link => <Button key={link.href} variant="link" className="footer-link" nativeButton={false} render={<a href={link.href}>{link.label}</a>} />)}
  </div>{note}</footer>
}
