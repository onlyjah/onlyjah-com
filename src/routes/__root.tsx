import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouterState,
} from '@tanstack/react-router'
import { Orbit } from 'lucide-react'
import { SiteFooter } from '@/components/blocks/site-footer'
import { SiteHeader } from '@/components/blocks/site-header'
import { ThemeToggle } from '@/components/blocks/theme-toggle'
import { PageLayout } from '@/components/layouts/page-layout'
import {
  ContentPreferences,
  MatureToggle,
} from '@/components/providers/content-preferences'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Button } from '@/components/ui/button'
import { AuthControls } from '@/features/auth/auth-controls'
import { AuthProvider } from '@/features/auth/provider'
import { themeInitScript, themeStorageKey } from '@/lib/theme'
import stylesheet from '@/styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    links: [{ rel: 'stylesheet', href: stylesheet }],
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'OnlyJah' },
      ...(import.meta.env.VITE_RELEASE_STAGE === 'testing'
        ? [{ name: 'robots', content: 'noindex, nofollow' }]
        : []),
    ],
  }),
  component: RootDocument,
  notFoundComponent: () => (
    <PageLayout
      title="Page not found"
      description="This destination is not available."
    >
      <Button
        render={<Link to="/docs">Browse the manual</Link>}
        nativeButton={false}
      />
    </PageLayout>
  ),
})

function Brand() {
  return (
    <Link
      to="/"
      aria-label="OnlyJah home"
      className="flex items-center gap-2 font-mono text-lg font-semibold tracking-tight"
    >
      <Orbit className="size-5 text-primary" aria-hidden="true" />
      onlyjah<span className="text-primary">.</span>
    </Link>
  )
}

function RootDocument() {
  const path = useRouterState({ select: (state) => state.location.pathname })
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script>{themeInitScript}</script>
        <HeadContent />
      </head>
      <body className="flex min-h-svh flex-col antialiased">
        <a
          href="#main-content"
          className="sr-only fixed top-3 left-3 z-50 bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only"
        >
          Skip to content
        </a>
        <ThemeProvider storageKey={themeStorageKey}>
          <AuthProvider>
            <ContentPreferences>
              <SiteHeader
                accent={
                  <div aria-hidden="true" className="grid h-1 grid-cols-3">
                    <span className="bg-chart-3" />
                    <span className="bg-chart-1" />
                    <span className="bg-chart-2" />
                  </div>
                }
                brand={<Brand />}
                activePath={path}
                actions={
                  <>
                    <ThemeToggle />
                    <MatureToggle />
                    <AuthControls />
                  </>
                }
                links={[
                  { label: 'Forge', href: '/forge' },
                  { label: 'About', href: '/about' },
                  { label: 'Media', href: '/media' },
                  { label: 'Realm', href: '/realm' },
                  { label: 'Market', href: '/market' },
                  { label: 'Ark', href: '/p/ark' },
                  { label: 'Docs', href: '/docs' },
                ]}
              />
              {import.meta.env.VITE_RELEASE_STAGE === 'testing' && (
                <p
                  role="status"
                  className="bg-accent px-4 py-2 text-center text-sm"
                >
                  Testing · wording for Jah’s review
                </p>
              )}
              <Outlet />
              <SiteFooter
                brand={<Brand />}
                note="OnlyJah / Ark · Pre-alpha"
                links={[
                  { label: 'Living manual', href: '/docs' },
                  { label: 'Ark', href: '/p/ark' },
                  { label: 'Pre-alpha', href: '/pre-alpha' },
                  { label: 'Contact', href: 'mailto:onlyjah@pm.me' },
                ]}
              />
            </ContentPreferences>
          </AuthProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
