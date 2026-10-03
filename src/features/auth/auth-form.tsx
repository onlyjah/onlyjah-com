import { SignIn, SignUp, useClerk } from '@clerk/react'
import { ClientOnly } from '@tanstack/react-router'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { authConfigured, hostSettings } from './provider'

function SatelliteAuth({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const clerk = useClerk()
  if (!clerk.loaded) return <AuthLoading />
  const options = {
    signInForceRedirectUrl: `${window.location.origin}/account`,
    signUpForceRedirectUrl: `${window.location.origin}/account`,
  }
  // Clerk's URL builder adds the satellite sync trigger; a plain primary URL does not.
  const href =
    mode === 'sign-in'
      ? clerk.buildSignInUrl(options)
      : clerk.buildSignUpUrl(options)
  return (
    <Button
      nativeButton={false}
      render={<a href={href}>{mode === 'sign-in' ? 'Sign in' : 'Join'}</a>}
    />
  )
}

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
      {hostSettings.isSatellite ? (
        <SatelliteAuth mode={mode} />
      ) : mode === 'sign-up' ? (
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
