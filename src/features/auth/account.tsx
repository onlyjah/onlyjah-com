import { UserProfile, useAuth } from '@clerk/react'
import { ClientOnly, Link } from '@tanstack/react-router'
import { DesignSelector } from '@/components/blocks/design-selector'
import { EmptyState } from '@/components/blocks/empty-state'
import { ThemeToggle } from '@/components/blocks/theme-toggle'
import { Section } from '@/components/sections/section'
import { Button } from '@/components/ui/button'
import { ArtistProfileForm } from '@/features/artists/artist-profile'
import { ProfileForm } from '@/features/membership/profile-form'
import { AuthLoading } from './auth-form'
import { authConfigured } from './provider'

function SignedOut() {
  return (
    <EmptyState
      title="Your account"
      description="Sign in to manage your profile and account settings."
      action={
        <Button
          render={<Link to="/sign-in">Sign in</Link>}
          nativeButton={false}
        />
      }
    />
  )
}

function AccountContent() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  if (!isLoaded) return <AuthLoading />
  if (!isSignedIn) return <SignedOut />
  return (
    <div className="space-y-10">
      <div className="max-w-2xl">
        <ProfileForm key={userId} />
        <div className="mt-6">
          <ArtistProfileForm key={userId} />
        </div>
      </div>
      <Section title="Sign-in & security">
        <UserProfile routing="hash" />
      </Section>
    </div>
  )
}

export function Account() {
  // Static HTML contains no member data. Browser visibility alone is not authorization.
  return (
    <div className="space-y-10">
      <Section title="Appearance">
        <div className="space-y-4">
          <DesignSelector label="Site design" />
          <ThemeToggle />
        </div>
      </Section>
      {authConfigured ? (
        <ClientOnly fallback={<AuthLoading />}>
          <AccountContent />
        </ClientOnly>
      ) : (
        <SignedOut />
      )}
    </div>
  )
}
