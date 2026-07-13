import { Link } from 'react-router-dom'

// NOTE: starter template — review (ideally with a professional) before store submission.
// Operator is shown as the brand "GoJulley" (no personal name). If you register a
// business entity later, put its legal name in the intro paragraph.
export default function PrivacyPage() {
  return (
    <div className="page" style={{ maxWidth: 760, paddingTop: '2.5rem', paddingBottom: '3rem', lineHeight: 1.6 }}>
      <span className="eyebrow">Legal</span>
      <h2 className="section-title">Privacy Policy</h2>
      <p style={{ color: 'var(--muted)' }}>Last updated: 13 July 2026</p>

      <p>
        GoJulley (“we”, “us”) provides a platform to browse and book stays, rides, services
        and curated trip packages in Ladakh, India. This policy explains what we collect, why, and the choices you have.
        Questions: <a href="mailto:support@gojulley.com">support@gojulley.com</a>.
      </p>

      <h3>Information we collect</h3>
      <ul>
        <li><strong>Account</strong> — your name, email address, and a securely hashed password. Your email is verified with a one-time code (OTP).</li>
        <li><strong>Bookings &amp; reviews</strong> — the listings/trips you book, dates, traveller counts, amounts, and any reviews you write.</li>
        <li><strong>Payments</strong> — processed by our payment provider, <strong>Razorpay</strong>. We do <em>not</em> store your card, UPI or bank details; Razorpay handles them. We receive only a payment confirmation and reference id.</li>
        <li><strong>Technical</strong> — a login token stored on your device to keep you signed in.</li>
      </ul>

      <h3>How we use it</h3>
      <ul>
        <li>To create and secure your account and verify your email.</li>
        <li>To process bookings and payments and show your booking history.</li>
        <li>To publish reviews you choose to submit.</li>
        <li>To send transactional emails (verification and booking/payment updates).</li>
      </ul>

      <h3>Who we share it with</h3>
      <ul>
        <li><strong>Razorpay</strong> — to process payments, subject to Razorpay’s own privacy policy.</li>
        <li><strong>Email delivery (Brevo)</strong> — to send verification and transactional emails.</li>
        <li><strong>Hosting (Render)</strong> — our servers and database are hosted there.</li>
      </ul>
      <p>We do not sell your personal data.</p>

      <h3>Data retention &amp; deletion</h3>
      <p>
        We keep your data while your account is active. You can <strong>delete your account at any time</strong> — in the
        app under <em>Account → Delete account</em>, or by emailing <a href="mailto:support@gojulley.com">support@gojulley.com</a>.
        Deleting your account permanently removes your profile, bookings and reviews from our systems. Some records may be
        retained where required by law or for legitimate tax/accounting purposes.
      </p>

      <h3>Security</h3>
      <p>
        Passwords are stored only as bcrypt hashes and payments are confirmed with a cryptographic signature; API access
        requires an authenticated token. No system is perfectly secure, but we take reasonable measures to protect your data.
      </p>

      <h3>Children</h3>
      <p>GoJulley is not intended for anyone under 18.</p>

      <h3>Changes</h3>
      <p>We may update this policy; material changes are reflected by the “last updated” date above.</p>

      <h3>Contact</h3>
      <p>Questions or data requests: <a href="mailto:support@gojulley.com">support@gojulley.com</a>.</p>

      <p style={{ marginTop: '2rem' }}>
        <Link to="/terms">Terms of Service</Link> · <Link to="/support">Support</Link>
      </p>
    </div>
  )
}
