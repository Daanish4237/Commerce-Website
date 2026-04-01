import { NextAuthOptions, getServerSession as nextAuthGetServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, email: true, password: true, role: true },
        })

        if (!user) {
          return null
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password)
        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
}

/**
 * Server-side helper to get the current session.
 * Wraps NextAuth's getServerSession with authOptions pre-applied.
 */
export function getServerSession() {
  return nextAuthGetServerSession(authOptions)
}

/**
 * Require authentication (and optionally a specific role) in an API route.
 * Returns the session if valid, or throws a NextResponse with 401/403.
 *
 * Usage:
 *   const session = await requireAuth()          // any authenticated user
 *   const session = await requireAuth('ADMIN')   // admin only
 */
export async function requireAuth(role?: string) {
  const session = await getServerSession()

  if (!session) {
    throw NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  if (role && session.user.role !== role) {
    throw NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return session
}
