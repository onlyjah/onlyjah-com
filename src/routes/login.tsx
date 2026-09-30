import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <h1>Login</h1>
    <br />
    <p>Source Forge, build cool stuff...</p>
  </div>
}
