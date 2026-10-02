import { SignIn, SignUp } from '@clerk/react'
import { ClientOnly } from '@tanstack/react-router'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { authConfigured } from './provider'

export function AuthLoading() {
  return (
    <div role="status" className="w-full max-w-sm space-y-4">
      <span className="sr-only">Loading account controls</span>
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  if (!authConfigured)
    return (
      <Alert>
        <AlertTitle>Signup is being configured</AlertTitle>
        <AlertDescription>
          Account registration will be available here. You can reach OnlyJah at{' '}
          <a className="underline" href="mailto:onlyjah@pm.me">
            onlyjah@pm.me
          </a>
          .
        </AlertDescription>
      </Alert>
    )
  return (
    <ClientOnly fallback={<AuthLoading />}>
      {mode === 'sign-up' ? (
        <SignUp
          routing="hash"
          signInUrl="/sign-in"
          forceRedirectUrl="/account"
        />
      ) : (
        <SignIn
          routing="hash"
          signUpUrl="/sign-up"
          forceRedirectUrl="/account"
        />
      )}
    </ClientOnly>
  )
}
