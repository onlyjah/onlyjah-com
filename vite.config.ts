import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const key =
    env.VITE_CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY
  if (key && !/^pk_(test|live)_/.test(key))
    throw new Error(
      'Use a Clerk publishable key for VITE_CLERK_PUBLISHABLE_KEY; secret keys cannot be bundled.',
    )
  const dataApi =
    env.VITE_NEON_DATA_API_URL || process.env.VITE_NEON_DATA_API_URL
  if (dataApi) {
    let url: URL
    try {
      url = new URL(dataApi)
    } catch {
      throw new Error(
        'VITE_NEON_DATA_API_URL must be the public HTTPS Data API endpoint.',
      )
    }
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !url.pathname.endsWith('/rest/v1')
    )
      throw new Error(
        'Use the public Neon Data API URL ending in /rest/v1, without credentials, for VITE_NEON_DATA_API_URL.',
      )
  }
  const guestAuth =
    env.VITE_NEON_PUBLIC_AUTH_URL || process.env.VITE_NEON_PUBLIC_AUTH_URL
  if (guestAuth) {
    const url = new URL(guestAuth)
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      throw new Error(
        'VITE_NEON_PUBLIC_AUTH_URL must be a public HTTPS auth base URL without credentials.',
      )
  }
  return {
    resolve: { tsconfigPaths: true },
    // Native Start prerendering keeps the portable artifact free of Nitro.
    environments: {
      client: { build: { outDir: '.output/public' } },
      server: { build: { outDir: '.output/build-server' } },
    },
    plugins: [
      tailwindcss(),
      tanstackStart({
        pages: [
          { path: '/sign-in' },
          { path: '/sign-up' },
          { path: '/account' },
          { path: '/design-preview' },
        ],
        prerender: {
          enabled: true,
          failOnError: true,
          crawlLinks: true,
          // Fragment links identify quotes within a page, not separate documents.
          filter: ({ path }) => !path.includes('#'),
        },
      }),
      react(),
    ],
    base: '/',
  }
})
