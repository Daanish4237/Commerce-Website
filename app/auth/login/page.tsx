'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    <main className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-sm rounded-lg border border-yellow-800 p-8" style={{ backgroundColor: '#111' }}>
        <h1 className="mb-6 text-center text-2xl font-bold" style={{ color: 'var(--gold)' }}>
          {requiresOtp ? 'Enter OTP' : 'Sign In'}
        </h1>

        {!requiresOtp ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email"
              className="rounded border border-yellow-700 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-600" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password"
              className="rounded border border-yellow-700 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-600" />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button type="submit" disabled={loading}
              className="rounded py-2 text-sm font-semibold disabled:opacity-50"
              style={{ backgroundColor: 'var(--gold)', color: '#0D0D0D' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
            <p className="text-center text-xs text-gray-400">
              No account?{' '}
              <Link href="/auth/register" style={{ color: 'var(--gold)' }}>Register</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleOtp} className="flex flex-col gap-4">
            <p className="text-sm text-gray-300">A 6-digit OTP has been sent to your email.</p>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder="6-digit OTP" maxLength={6}
              className="rounded border border-yellow-700 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-600" />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button type="submit" disabled={loading}
              className="rounded py-2 text-sm font-semibold disabled:opacity-50"
              style={{ backgroundColor: 'var(--gold)', color: '#0D0D0D' }}>
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
