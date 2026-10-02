import { createFileRoute } from '@tanstack/react-router'
import { AuthPage } from './-templates/auth-page'

export const Route = createFileRoute('/sign-up')({
  head: () => ({
    meta: [
      { title: 'Join OnlyJah' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: () => <AuthPage mode="sign-up" />,
})
