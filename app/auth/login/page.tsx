'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import OrnamentDivider from '@/components/OrnamentDivider'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [requiresOtp, setRequiresOtp] = useState(false)
  const [userId, setUserId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error === 'requiresOtp') {
        setRequiresOtp(true)
        setUserId(result.url ?? '')
      } else if (result?.error) {
        setError('Invalid email or password.')
      } else {
        router.push('/')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp, fingerprint: navigator.userAgent }),
      })
      if (res.ok) {
        router.push('/admin')
      } else {
        setError('Invalid or expired OTP.')
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
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: 'var(--gold)' }} />
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <Image src="/Soho Jewels logo.jpeg" alt="Soho Jewels" width={120} height={60} unoptimized priority className="object-contain" />
          <OrnamentDivider size="sm" animate className="mt-2" />
        </div>

        <div
          className="rounded-2xl border border-yellow-800 p-8 shadow-2xl backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(17,17,17,0.95)' }}
        >
          <h1 className="mb-2 text-center text-2xl font-bold tracking-wide animate-slide-up" style={{ color: 'var(--gold)' }}>
            {requiresOtp ? 'Verify OTP' : 'Welcome Back'}
          </h1>
          <p className="mb-6 text-center text-xs text-gray-500 animate-slide-up-delay">
            {requiresOtp ? 'Enter the code sent to your email' : 'Sign in to your account'}
          </p>

          {!requiresOtp ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4 animate-slide-up-delay">
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
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="rounded-lg border border-yellow-800 bg-transparent px-4 py-2.5 text-sm text-white placeholder-gray-600 transition-all focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-600"
                  placeholder="••••••••"
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
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>

              <p className="text-center text-xs text-gray-500">
                No account?{' '}
                <Link href="/auth/register" className="font-medium hover:text-yellow-400 transition-colors" style={{ color: 'var(--gold)' }}>
                  Create one
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtp} className="flex flex-col gap-4 animate-slide-up-delay">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400 uppercase tracking-wider">6-digit OTP</label>
                <input
                  type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6}
                  className="rounded-lg border border-yellow-800 bg-transparent px-4 py-2.5 text-center text-lg tracking-[0.5em] text-white placeholder-gray-600 transition-all focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-600"
                  placeholder="000000"
                />
              </div>
              {error && (
                <p className="rounded-lg bg-red-950 border border-red-800 px-3 py-2 text-xs text-red-400">{error}</p>
              )}
              <button
                type="submit" disabled={loading}
                className="rounded-lg py-3 text-sm font-bold tracking-widest uppercase transition-all disabled:opacity-50 hover:brightness-110 active:scale-95"
                style={{ backgroundColor: 'var(--gold)', color: '#0D0D0D' }}
              >
                {loading ? 'Verifying…' : 'Verify'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
