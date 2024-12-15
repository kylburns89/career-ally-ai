import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// List of public routes that don't require authentication
const publicRoutes = [
  '/',
  '/about',
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
  '/auth/reset-password',
  '/auth/forgot-password',
  '/auth/mfa',
  '/support/help',
  '/support/privacy',
  '/support/terms'
];

// Check if the route is public
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.includes(pathname) || 
         pathname.startsWith('/_next') || 
         pathname.startsWith('/api/') ||
         pathname.match(/\.(ico|png|jpg|jpeg|gif|svg)$/) !== null;
}

export async function middleware(request: NextRequest) {
  try {
    // Create response to modify
    const response = NextResponse.next();

    // Create Supabase client
    const supabase = createClient();

    // Refresh session if it exists
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    // For public routes, just return the response
    if (isPublicRoute(request.nextUrl.pathname)) {
      return response;
    }

    // If there's a session error or no session, redirect to login
    if (sessionError || !session) {
      // Don't redirect if already on login page to prevent loops
      if (request.nextUrl.pathname === '/auth/login') {
        return response;
      }

      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Add user context to headers for API routes
    if (session.user) {
      response.headers.set('x-user-id', session.user.id);
      response.headers.set('x-user-email', session.user.email ?? '');
      response.headers.set('x-user-role', session.user.role ?? '');
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, only redirect to login if not already on a public route
    if (!isPublicRoute(request.nextUrl.pathname)) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - /_next (static files)
     * - /api (API routes)
     * - /favicon.ico (favicon file)
     * - public files (.ico, .png, etc)
     */
    '/((?!_next|api|favicon.ico).*)',
  ],
};
