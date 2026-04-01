import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Admin routes require ADMIN role
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        // Protected routes that require any authenticated user
        const protectedPaths = ['/cart', '/wishlist', '/checkout', '/orders']
        const isProtected = protectedPaths.some((p) => pathname.startsWith(p)) || pathname.startsWith('/admin')
        if (isProtected) return !!token
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/cart', '/wishlist', '/checkout', '/orders/:path*'],
}
