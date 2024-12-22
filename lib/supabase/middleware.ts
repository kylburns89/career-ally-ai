import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Create a response early so we can modify cookies
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie on the request so it's available for supabase-js
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // Set cookie on the response so it's persisted for future requests
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Remove cookie from the request
          request.cookies.delete(name)
          // Remove cookie from the response
          response.cookies.delete(name)
        },
      },
    }
  )

  try {
    // Get both session and user to ensure proper auth state
    const [
      { data: { session }, error: sessionError },
      { data: { user }, error: userError }
    ] = await Promise.all([
      supabase.auth.getSession(),
      supabase.auth.getUser()
    ])

    const error = sessionError || userError;

    // Log auth state for debugging
    console.log('Middleware auth state:', {
      path: request.nextUrl.pathname,
      hasSession: !!session,
      hasUser: !!user,
      error: error?.message
    });

    // If there's an error but we're on a public route, don't throw
    if (error) {
      const isPublicRoute = request.nextUrl.pathname.startsWith('/auth/') ||
                           ['/', '/about'].includes(request.nextUrl.pathname)
      
      if (!isPublicRoute) {
        // Store the original URL to redirect back after login
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Set auth state in cookies for client-side access
    if (session) {
      response.cookies.set('auth-state', 'authenticated', {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 10 // 10 minutes
      });
    } else {
      response.cookies.delete('auth-state');
    }

    // If session was refreshed, the response will have new cookie values to persist
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // On critical errors, redirect to login
    const redirectUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }
}
