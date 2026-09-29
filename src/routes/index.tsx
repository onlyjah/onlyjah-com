import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <h1>Hello Jah!</h1>
    <a href="mailto:jahnoah@onlyjah.com">Email JahNoah for inquiries.</a>
    </div>
}
