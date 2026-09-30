import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/contact')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <h1>Contact Today</h1>
    <p>Reflections and Inquiries Welcome!</p>
    <form action="contact" method="post">
      <input type="email" name="email" id="email" placeholder='Email: ' />
      <br />
      <input type="url" name="website" id="website" placeholder='Your Website (optional):' />
      <br />
      <input type="text" name="message" id="message" placeholder='Message: ' />
      <br />
      Urgent: <input type="checkbox" name="urgent" id="isUrgent" />
      Commission: <input type="checkbox" name="commission" id="isCommission" />
      <br />
      <input type="submit" value="Submit" />
    </form>
    <br />
    <p>Alternitavely, send an email directly to: </p>
    <a href="mailto:oj@onlyjah.com">oj@onlyjah.com</a>
    <br />
    <br />
    <br />
    <br />
  </div>
}
