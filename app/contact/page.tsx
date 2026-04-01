'use client'

import { useState } from 'react'
import OrnamentDivider from '@/components/OrnamentDivider'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // In production, send to an email service
    setSubmitted(true)
  }

  const inputCls = "w-full rounded border border-yellow-800 bg-transparent px-4 py-2.5 text-sm text-white placeholder-gray-600 transition-all focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-600"

  return (
    <main className="mx-auto max-w-4xl px-6 py-16" style={{ color: 'white' }}>
      <div className="text-center mb-12 animate-slide-up">
        <h1 className="text-4xl font-light tracking-[0.2em] mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--gold)' }}>
          Contact Us
        </h1>
        <OrnamentDivider size="md" animate />
        <p className="text-gray-400 text-sm mt-6 max-w-md mx-auto">
          We&apos;d love to hear from you. Reach out for enquiries, custom orders, or any questions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-slide-up-delay">
        {/* Contact info */}
        <div className="flex flex-col gap-8">
          {[
            { label: 'Email', value: 'sohomarketingnet@gmail.com', icon: '✉' },
            { label: 'WhatsApp', value: '+60 11-1633 2904', icon: '📱' },
            { label: 'Location', value: 'Kuala Lumpur, Malaysia', icon: '📍' },
            { label: 'Hours', value: 'Mon – Sat, 10am – 8pm', icon: '🕐' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-4">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">{item.label}</p>
                <p className="text-sm" style={{ color: 'var(--gold)' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact form */}
        {submitted ? (
          <div className="flex flex-col items-center justify-center gap-4 luxury-card p-8 text-center animate-fade-in">
            <span className="text-4xl">✓</span>
            <h3 className="text-xl" style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif' }}>Message Sent</h3>
            <p className="text-sm text-gray-400">Thank you for reaching out. We&apos;ll get back to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 luxury-card p-8">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wider text-gray-400">Name</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your name" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wider text-gray-400">Email</label>
              <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wider text-gray-400">Message</label>
              <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="How can we help you?" className={inputCls} />
            </div>
            <button type="submit"
              className="mt-2 rounded py-3 text-xs font-bold tracking-[0.2em] uppercase transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: 'var(--gold)', color: '#0A0A0A' }}>
              Send Message
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
