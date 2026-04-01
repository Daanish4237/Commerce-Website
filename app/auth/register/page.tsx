'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/auth/login'), 1500)
      } else {
        const data = await res.json()
        setError(data.details?.[0] ?? data.error ?? 'Registration failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: 'var(--gold)' }} />
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <Image src="/logo.svg" alt="Soho Jewels" width={180} height={45} unoptimized priority />
        </div>

        <div
          className="rounded-2xl border border-yellow-800 p-8 shadow-2xl"
          style={{ backgroundColor: 'rgba(17,17,17,0.95)' }}
        >
          {success ? (
            <div className="flex flex-col items-center gap-4 py-4 animate-fade-in">
              <div className="text-4xl">✓</div>
              <p className="text-sm text-green-400">Account created! Redirecting…</p>
            </div>
          ) : (
            <>
              <h1 className="mb-2 text-center text-2xl font-bold tracking-wide" style={{ color: 'var(--gold)' }}>
                Create Account
              </h1>
              <p className="mb-6 text-center text-xs text-gray-500 animate-slide-up-delay">
                Join Soho Jewels today
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-slide-up-delay">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)} required
                    className="rounded-lg border border-yellow-800 bg-transparent px-4 py-2.5 text-sm text-white placeholder-gray-600 transition-all focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-600"
                    placeholder="Your name"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Email</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="rounded-lg border border-yellow-800 bg-transparent px-4 py-2.5 text-sm text-white placeholder-gray-600 transition-all focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-600"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Password</label>
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                    className="rounded-lg border border-yellow-800 bg-transparent px-4 py-2.5 text-sm text-white placeholder-gray-600 transition-all focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-600"
                    placeholder="Min. 8 characters"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-red-950 border border-red-800 px-3 py-2 text-xs text-red-400 animate-fade-in">
                    {error}
                  </p>
                )}

                <button
                  type="submit" disabled={loading}
                  className="mt-2 rounded-lg py-3 text-sm font-bold tracking-widest uppercase transition-all duration-200 disabled:opacity-50 hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: 'var(--gold)', color: '#0D0D0D' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                      Creating…
                    </span>
                  ) : 'Register'}
                </button>

                <p className="text-center text-xs text-gray-500">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-medium hover:text-yellow-400 transition-colors" style={{ color: 'var(--gold)' }}>
                    Sign in
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
