import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/explore')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <h1>Explore!</h1>
    <br />
    <p>Imagine all the posts to come...</p>
  </div>
}
