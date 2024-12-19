import { updateSession } from './lib/supabase/middleware'
import { type NextRequest } from 'next/server'

// List of paths that don't require session refresh
const publicPaths = [
  // Static assets and Next.js internals
  '/_next',
  '/favicon.ico',
  // Public images
  '/images',
  // Public routes
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
  '/auth/error',
  '/auth/confirm',
  '/auth/check-email',
  '/',
  '/about',
]

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url)

  // Skip session refresh for public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
