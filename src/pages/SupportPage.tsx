import { Link } from 'react-router-dom'

import { useSeo } from '../useSeo'

export default function SupportPage() {
  useSeo({ title: 'Support | GoJulley', description: 'Get help with GoJulley — bookings, payments, account and more.', path: '/support' })
  return (
    <div className="page" style={{ maxWidth: 760, paddingTop: '2.5rem', paddingBottom: '3rem', lineHeight: 1.6 }}>
      <span className="eyebrow">Help</span>
      <h2 className="section-title">Support</h2>
      <p>Need a hand with GoJulley? We’re happy to help.</p>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Contact us</h3>
        <p style={{ margin: 0 }}>
          Email <a href="mailto:support@gojulley.com">support@gojulley.com</a> — we aim to reply within 1–2 business days.
          For payment or booking issues, include your <strong>booking reference</strong> so we can find it quickly.
        </p>
      </div>

      <h3>Common topics</h3>
      <ul>
        <li><strong>Bookings</strong> — browse stays, rides, services or a curated trip, then book with a date and traveller count.</li>
        <li><strong>Payments</strong> — pay in full or reserve with a 10% advance and settle the balance on arrival at Leh. Payments are processed securely by Razorpay.</li>
        <li><strong>Cancellations &amp; refunds</strong> — cancel from <em>My Bookings</em>; see our <Link to="/terms">Terms</Link> for the refund policy.</li>
        <li><strong>Account &amp; login</strong> — sign up with your email and verify the one-time code we send.</li>
        <li><strong>Deleting your account</strong> — in the app under <em>Account → Delete account</em>, or email us and we’ll do it for you.</li>
      </ul>

      <p style={{ marginTop: '2rem' }}>
        <Link to="/privacy">Privacy Policy</Link> · <Link to="/terms">Terms of Service</Link>
      </p>
    </div>
  )
}
