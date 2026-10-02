import { useAuth } from '@clerk/react'
import { ClientOnly, Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { EmptyState } from '@/components/blocks/empty-state'
import { Button } from '@/components/ui/button'
import { authConfigured } from './provider'

function SignIn() {
  return (
    <EmptyState
      title="Your space to create"
      description="Sign in to continue."
      action={
        <Button
          render={<Link to="/sign-in">Sign in</Link>}
          nativeButton={false}
        />
      }
    />
  )
}
function Loaded({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return <p role="status">Loading your account…</p>
  return isSignedIn ? children : <SignIn />
}
// Mount private features only after identity is loaded; the API still authorizes every call.
export function MemberGate({ children }: { children: ReactNode }) {
  if (!authConfigured) return <SignIn />
  return (
    <ClientOnly fallback={<p role="status">Loading your account…</p>}>
      <Loaded>{children}</Loaded>
    </ClientOnly>
  )
}
