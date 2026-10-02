import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from './-templates/auth-page'

export const Route = createFileRoute('/sign-in')({
  head: () => ({
    meta: [
      { title: 'Sign in · OnlyJah' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: () => <AuthPage mode="sign-in" />,
})
