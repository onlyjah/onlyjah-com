import { ClerkProvider } from '@clerk/react'
import { shadcn } from '@clerk/ui/themes'
import type { ReactNode } from 'react'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
export const authConfigured = Boolean(publishableKey)

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
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/account"
      signUpFallbackRedirectUrl="/account"
    >
      {children}
    </ClerkProvider>
  )
}
