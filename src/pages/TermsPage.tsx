import { Link } from 'react-router-dom'

// NOTE: starter template — review (ideally with a professional) before store submission.
// Operator is shown as the brand "GoJulley" (no personal name). Placeholders to
// finalise: a registered legal-entity name (if any), refund/cancellation specifics,
// and the governing-law city.
export default function TermsPage() {
  return (
    <div className="page" style={{ maxWidth: 760, paddingTop: '2.5rem', paddingBottom: '3rem', lineHeight: 1.6 }}>
      <span className="eyebrow">Legal</span>
      <h2 className="section-title">Terms of Service</h2>
      <p style={{ color: 'var(--muted)' }}>Last updated: 13 July 2026</p>

      <p>
        These terms govern your use of GoJulley (“we”, “us”). By creating an account or booking,
        you agree to them. If you don’t agree, please don’t use the service.
      </p>

      <h3>Eligibility &amp; your account</h3>
      <p>
        You must be at least 18 and provide accurate information. You’re responsible for your login credentials and for
        activity under your account. Verify your email to complete sign-up.
      </p>

      <h3>Bookings &amp; payments</h3>
      <p>
        GoJulley is a platform connecting travellers with stays, rides, services and curated trip packages in Ladakh, which
        are provided by third-party operators. Prices are shown at checkout. You may pay in full, or reserve with a
        <strong> 10% advance</strong> and pay the remaining balance on arrival at Leh. Payments are handled by <strong>Razorpay</strong>;
        a booking is confirmed once payment is verified.
      </p>

      <h3>Cancellations &amp; refunds</h3>
      <p>
        You can cancel a booking from <em>My Bookings</em>. Refunds, where applicable, follow the relevant provider’s policy
        and normal payment-processing timelines. <em>[Placeholder — state your exact refund/advance policy here before launch,
        e.g. whether the 10% advance is refundable and any cancellation windows.]</em>
      </p>

      <h3>Reviews &amp; your content</h3>
      <p>
        You keep ownership of reviews you post and grant us a licence to display them within GoJulley. Content must be honest,
        lawful and your own. We may remove content that breaches these terms.
      </p>

      <h3>Acceptable use</h3>
      <p>Don’t misuse the service — no fraud, scraping, attempts to break security, or unlawful activity.</p>

      <h3>Third-party providers &amp; disclaimers</h3>
      <p>
        Stays, rides and activities are operated by independent third parties; availability and quality are their
        responsibility. The service is provided “as is” without warranties. To the extent permitted by law, we are not liable
        for indirect or consequential losses, or for the acts or omissions of third-party providers.
      </p>

      <h3>Governing law</h3>
      <p>These terms are governed by the laws of India, with jurisdiction in the courts of <em>[your city]</em>, India.</p>

      <h3>Changes</h3>
      <p>We may update these terms; the “last updated” date reflects the latest version.</p>

      <h3>Contact</h3>
      <p>Questions: <a href="mailto:support@gojulley.com">support@gojulley.com</a>.</p>

      <p style={{ marginTop: '2rem' }}>
        <Link to="/privacy">Privacy Policy</Link> · <Link to="/support">Support</Link>
      </p>
    </div>
  )
}
