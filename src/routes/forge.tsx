import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/forge')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <h1>OnlyJah Forge!</h1>
    <br />
    <p>Source Forge, build cool stuff...</p>
    <br />


    {/* SECTION: TABS */}
    <div> {/* CARD 1 */}
      <a href="#labs">Labs</a>/
      <a href="#prod">Prod</a>/
      <a href="#heap">Heap</a>
    </div>

    <br />
    <br />
    <br />

  </div>
}
