import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/policy')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <h1>OnlyJah Policy</h1>
    <ul>
      <li>No weird evil stuff to try and usurp others' sovereignty</li>
      <li>Make cool stuff and share them with others to enjoy</li>
      <li>Commit to quality so that others may rely on the stuff</li>
      <li>Ensure sustainable flow and support others' goals well</li>
    </ul>

  </div>
}
