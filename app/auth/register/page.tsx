'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
        router.push('/auth/login')
      } else {
        const data = await res.json()
        setError(data.details?.[0] ?? data.error ?? 'Registration failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-sm rounded-lg border border-yellow-800 p-8" style={{ backgroundColor: '#111' }}>
        <h1 className="mb-6 text-center text-2xl font-bold" style={{ color: 'var(--gold)' }}>Create Account</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full Name"
            className="rounded border border-yellow-700 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-600" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email"
            className="rounded border border-yellow-700 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-600" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password (min 8 chars)" minLength={8}
            className="rounded border border-yellow-700 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-600" />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={loading}
            className="rounded py-2 text-sm font-semibold disabled:opacity-50"
            style={{ backgroundColor: 'var(--gold)', color: '#0D0D0D' }}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
          <p className="text-center text-xs text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: 'var(--gold)' }}>Sign in</Link>
          </p>
        </form>
      </div>
    </main>
  )
}
