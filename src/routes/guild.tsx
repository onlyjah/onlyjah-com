import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/guild')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <h1>OnlyJah Guild!</h1>
    <br />
    <p>A guilded guild of golden goods :D</p>
    <br />
    <p>The Guild is all about collaboration, improvement, and access.</p>
    <p>All members will be able to partake in community.</p>
    <p>
      Guild allows individuals to establish organizations or parties,
      engage in marketplace activities such as production and commerce,
      submit and/or fulfill official guild requests of varying categories,
      and gain access to many exclusive perks through formal membership!
    </p>

    {/* SECTION: TABS */}
    <div> {/* CARD 1 */}
      <a href="/jobs">Work</a>/
      <a href="/shop">Shop</a>/
      <a href="/join">Join</a>
    </div>
  </div>
}
