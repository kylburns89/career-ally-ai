import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from './lib/supabase/server';

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

    // Check both session and user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // For public routes, just return the response
    if (isPublicRoute(request.nextUrl.pathname)) {
      return response;
    }

    // If there's no session or user, redirect to login
    if (sessionError || !session || userError || !user) {
      // Store the current URL to redirect back after login
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);

      // Create the response with redirect
      const redirectResponse = NextResponse.redirect(redirectUrl);

      // Clear any existing auth cookies to ensure clean state
      const cookiesToClear = [
        'sb-access-token',
        'sb-refresh-token',
        'supabase-auth-token'
      ];
      
      cookiesToClear.forEach(name => {
        redirectResponse.cookies.delete(name);
      });

      return redirectResponse;
    }

    // Add user context to headers for API routes
    if (user) {
      response.headers.set('x-user-id', user.id);
      response.headers.set('x-user-email', user.email ?? '');
      response.headers.set('x-user-role', user.role ?? '');
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, redirect to login if not on a public route
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
