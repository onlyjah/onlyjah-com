import { UserButton, useAuth } from '@clerk/react'
import { ClientOnly, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { authConfigured } from './provider'

function JoinLink() {
  return (
    <Button
      size="sm"
      render={
        <Link to="/sign-up" aria-label="Join OnlyJah">
          <span className="sm:hidden">Join</span>
          <span className="hidden sm:inline">Join OnlyJah</span>
        </Link>
      }
      nativeButton={false}
    />
  )
}

function LoadedControls() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded || !isSignedIn) return <JoinLink />
  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        render={<Link to="/account">Account</Link>}
        nativeButton={false}
      />
      <UserButton />
    </>
  )
}

export function AuthControls() {
  if (!authConfigured) return <JoinLink />
  return (
    <ClientOnly fallback={<JoinLink />}>
      <LoadedControls />
    </ClientOnly>
  )
}
