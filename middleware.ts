import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of public paths that don't require authentication
const publicPaths = ['/', '/about', '/auth/login', '/auth/signup', '/auth/callback'];

// List of public API routes that don't require authentication
const publicApiPaths = ['/api/auth'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;
  const isApiRoute = pathname.startsWith('/api/');

  // Handle API routes
  if (isApiRoute) {
    const isPublicApiPath = publicApiPaths.some(path => pathname.startsWith(path));
    if (!isPublicApiPath && !session) {
      // For PDF export route, return a redirect to login
      if (pathname.includes('/api/resumes/export/pdf/')) {
        const redirectUrl = new URL('/auth/login', req.url);
        redirectUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(redirectUrl);
      }
      // For other API routes, return 401 JSON response
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }
    return res;
  }

  // Handle page routes
  const isPublicPath = publicPaths.some(path => pathname === path);
  if (!isPublicPath && !session) {
    const redirectUrl = new URL('/auth/login', req.url);
    // Add the original URL as a redirect parameter
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
