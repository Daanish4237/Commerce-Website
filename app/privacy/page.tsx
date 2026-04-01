export const metadata = { title: 'Privacy Policy – Soho Jewels' }

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16" style={{ color: '#e8e0d0' }}>
      <h1 className="text-3xl font-light tracking-widest mb-8" style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif' }}>
        Privacy Policy
      </h1>
      <div className="flex flex-col gap-6 text-sm text-gray-400 leading-relaxed">
        <p>Last updated: April 2026</p>
        <section>
          <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--gold)' }}>1. Information We Collect</h2>
          <p>We collect information you provide when registering, placing orders, or contacting us — including your name, email address, shipping address, and payment information.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--gold)' }}>2. How We Use Your Information</h2>
          <p>We use your information to process orders, deliver products, send order updates, and improve our services. We do not sell your personal data to third parties.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--gold)' }}>3. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data. Passwords are hashed and never stored in plaintext. Payment processing is handled securely by Stripe.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--gold)' }}>4. Cookies</h2>
          <p>We use session cookies for authentication purposes only. We do not use tracking or advertising cookies.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--gold)' }}>5. Contact</h2>
          <p>For privacy-related enquiries, contact us at sohomarketingnet@gmail.com</p>
        </section>
      </div>
    </main>
  )
}
