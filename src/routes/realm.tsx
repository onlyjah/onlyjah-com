import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/realm')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <h1>OnlyJah Realm!</h1>
    <br />
    <p>Public and Private Ecosystems For You...</p>
  </div>
}
