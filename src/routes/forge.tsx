import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/forge')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <h1>OnlyJah Forge!</h1>
    <br />
    <p>Source Forge, build cool stuff...</p>
  </div>
}
