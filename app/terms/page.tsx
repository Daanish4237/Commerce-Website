export const metadata = { title: 'Terms of Service – Soho Jewels' }

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16" style={{ color: '#e8e0d0' }}>
      <h1 className="text-3xl font-light tracking-widest mb-8" style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif' }}>
        Terms of Service
      </h1>
      <div className="flex flex-col gap-6 text-sm text-gray-400 leading-relaxed">
        <p>Last updated: April 2026</p>
        <section>
          <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--gold)' }}>1. Acceptance of Terms</h2>
          <p>By accessing and using Soho Jewels, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--gold)' }}>2. Products and Orders</h2>
          <p>All products are subject to availability. We reserve the right to refuse or cancel orders at our discretion. Prices are in Malaysian Ringgit (MYR) and subject to change.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--gold)' }}>3. Payments</h2>
          <p>Payments are processed securely via Stripe. By placing an order, you authorise us to charge the total amount to your selected payment method.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--gold)' }}>4. Shipping</h2>
          <p>We ship within Malaysia via our courier partners. Delivery times are estimates and not guaranteed. Risk of loss passes to you upon delivery.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--gold)' }}>5. Returns and Refunds</h2>
          <p>Please contact us within 7 days of receiving your order if there is an issue. We handle returns on a case-by-case basis.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--gold)' }}>6. Contact</h2>
          <p>For enquiries, contact us at sohomarketingnet@gmail.com</p>
        </section>
      </div>
    </main>
  )
}
