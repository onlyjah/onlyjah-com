import { ImageCard } from '@/components/blocks/image-card'
import { PageLayout } from '@/components/layouts/page-layout'
import { photos } from '@/content/photos'
import { AuthForm } from '@/features/auth/auth-form'

export function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  return (
    <PageLayout
      title={mode === 'sign-up' ? 'Join OnlyJah' : 'Welcome back'}
      eyebrow="Account"
      description="Connect and collaborate with others."
    >
      <div className="grid items-start gap-10 lg:grid-cols-2">
        <div className="flex min-h-96 min-w-0 justify-center">
          <AuthForm mode={mode} />
        </div>
        <ImageCard {...photos.clouds} />
      </div>
    </PageLayout>
  )
}
