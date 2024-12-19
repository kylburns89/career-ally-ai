import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { authConfig, createCookieOptions } from './config'

export async function updateSession(request: NextRequest) {
  // Create a response to modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    // Create Supabase client with cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        ...authConfig,
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              response.cookies.set({
                name,
                value,
                ...createCookieOptions(name),
                ...options,
              })
            } catch (error) {
              console.error('Error setting cookie:', error)
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              response.cookies.set({
                name,
                value: '',
                ...createCookieOptions(name),
                ...options,
                maxAge: 0,
              })
            } catch (error) {
              console.error('Error removing cookie:', error)
            }
          },
        },
      }
    )

    // Only refresh the session, route protection is handled by protected-route component
    await supabase.auth.getSession()

    return response
  } catch (error) {
    console.error('Session refresh error:', error)
    return response
  }
}
