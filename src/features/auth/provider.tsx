import { ClerkProvider } from '@clerk/react'
import { shadcn } from '@clerk/ui/themes'
import '@clerk/ui/themes/shadcn.css'
import type { ReactNode } from 'react'
import { clerkHostSettings } from './sso-settings'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
export const authConfigured = Boolean(publishableKey)
export const hostSettings = clerkHostSettings({
  primaryUrl: import.meta.env.VITE_CLERK_PRIMARY_URL,
  satelliteDomain: import.meta.env.VITE_CLERK_SATELLITE_DOMAIN,
  allowedOrigins: import.meta.env.VITE_CLERK_ALLOWED_REDIRECT_ORIGINS,
})

// Browser auth only. Public HTML prerenders without server session state or secret keys.
export function AuthProvider({ children }: { children: ReactNode }) {
  if (!authConfigured) return children
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        theme: shadcn,
        variables: {
          borderRadius: 'var(--radius)',
          fontFamily: 'var(--font-sans)',
        },
      }}
      {...hostSettings}
      signInFallbackRedirectUrl="/account"
      signUpFallbackRedirectUrl="/account"
    >
      {children}
    </ClerkProvider>
  )
}
