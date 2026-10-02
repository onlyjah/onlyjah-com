import type { ComponentProps, ReactNode } from 'react'
import { PageHeader } from '@/components/blocks/page-header'

// Shared document frame and skip-link target, composed with a generic header.
export function PageLayout({
  children,
  ...header
}: ComponentProps<typeof PageHeader> & { children: ReactNode }) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-6xl space-y-10 px-4 py-9 md:px-8 md:py-12"
    >
      <PageHeader {...header} />
      {children}
    </main>
  )
}
