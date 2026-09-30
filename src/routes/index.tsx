import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    {/* Page Name: HOME/ROOT/INDEX */}
    <h1>OnlyJah.com</h1>
    <p>Cloud Faring Vessel _ Universe in the Sky</p>
    <img src="hero_home.wjpg" alt="Home Hero Image: Dragonfly" />
    <br />

    {/* SECTION: CARDS */}
    <div> {/* CARD 1 */}
      <a href="/forge">Forge</a>/
      <a href="/guild">Guild</a>/
      <a href="/realm">Realm</a>
    </div>

  </div>
}
