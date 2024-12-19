import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

// Routes that don't require authentication
const publicPatterns = [
  // Static pages
  /^\/$/,  // Landing page
  /^\/about\/?$/,  // About page
  // Auth routes
  /^\/auth\/(login|signup|callback|verify|error|confirm|check-email)\/?$/,
  // Static assets and Next.js internals
  /^\/_next\//,
  /^\/api\/auth\//,
  /\.(ico|png|jpg|jpeg|gif|svg|webp)$/,
]

// API routes that need session but shouldn't redirect
const apiPatterns = [
  /^\/api\/(profile|jobs|resumes|cover-letter|career-path|market-analysis|salary-coach|learning-path|challenges|interview|chat)\/?/
]

function matchesPattern(pathname: string, patterns: RegExp[]): boolean {
  return patterns.some(pattern => pattern.test(pathname))
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Create a response to modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // If it's a public route, no need to check auth
  if (matchesPattern(pathname, publicPatterns)) {
    return response
  }

  try {
    // Create Supabase client with simplified cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
              secure: process.env.NODE_ENV === 'production',
              path: '/',
              sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
              maxAge: name.includes('access_token') 
                ? 3600 // 1 hour for access tokens
                : name.includes('refresh_token')
                ? 30 * 24 * 3600 // 30 days for refresh tokens
                : undefined,
              // Don't set domain to allow it to use the current domain
              domain: undefined
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              maxAge: 0,
              path: '/',
              secure: process.env.NODE_ENV === 'production',
              sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
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

    // Check auth state
    const { data: { user } } = await supabase.auth.getUser()

    // For API routes, allow the request but with session context
    if (matchesPattern(pathname, apiPatterns)) {
      return response
    }

    // For protected routes, redirect to login if no user
    if (!user) {
      // Clear any invalid session cookies
      ['sb-access-token', 'sb-refresh-token'].forEach(name => {
        response.cookies.set({
          name,
          value: '',
          maxAge: 0,
          path: '/',
        })
      })

      // Store the original URL to redirect back after login
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch (error) {
    // On error, only redirect if not on a public route
    if (!matchesPattern(pathname, publicPatterns)) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    return response
  }
}
