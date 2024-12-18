import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

// List of public routes that don't require authentication
const publicRoutes = ['/', '/about', '/auth/login', '/auth/signup', '/auth/callback', '/auth/verify', '/auth/error']

// Check if the route is public
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.includes(pathname) || 
         pathname.startsWith('/_next') || 
         pathname.startsWith('/api/auth') ||
         pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp)$/) !== null
}

export async function updateSession(request: NextRequest) {
  // Create a response to modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    // Create a Supabase client using the request cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // If the cookie is updated, update the response
            response.cookies.set({
              name,
              value,
              ...options,
              secure: process.env.NODE_ENV === 'production',
              path: '/',
              // Use strict sameSite policy for better security
              sameSite: 'strict',
              // Set appropriate maxAge for different token types
              maxAge: name.includes('access_token') 
                ? 3600 // 1 hour for access tokens
                : name.includes('refresh_token')
                ? 30 * 24 * 3600 // 30 days for refresh tokens
                : undefined,
              domain: undefined
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
              secure: process.env.NODE_ENV === 'production',
              path: '/',
              sameSite: 'strict',
              maxAge: 0,
              domain: undefined
            })
          },
        },
        auth: {
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    )

    // IMPORTANT: Use getUser() instead of getSession() in middleware
    // getUser() sends a request to Supabase Auth server to revalidate the token
    const { data: { user }, error } = await supabase.auth.getUser()

    // If the route is public, just update the session and return
    if (isPublicRoute(request.nextUrl.pathname)) {
      return response
    }

    // For protected routes, check if we have a valid user
    if (error || !user) {
      // If there was an error or no user, clear any invalid session cookies
      const authCookies = [
        'sb-access-token',
        'sb-refresh-token',
        'sb-auth-token',
        'supabase-auth-token'
      ]
      
      authCookies.forEach(name => {
        response.cookies.delete(name)
      })

      // Store the original URL to redirect back after login
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // User is authenticated, allow access to protected route
    return response
  } catch (error) {
    console.error('Auth middleware error:', error)
    
    // On error, redirect to login if not on a public route
    if (!isPublicRoute(request.nextUrl.pathname)) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    return response
  }
}
