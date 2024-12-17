import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value,
              ...options,
              // Always secure in production
              secure: process.env.NODE_ENV === 'production',
              // Always set path to root
              path: '/',
              // Use Strict same-site policy
              sameSite: 'strict',
              // Set max age for session cookies
              maxAge: name.includes('access_token') ? 3600 : undefined,
              // Don't set domain to allow it to use the current domain
              domain: undefined
            })
          } catch (error) {
            console.warn('Error setting cookie:', error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value: '',
              ...options,
              secure: process.env.NODE_ENV === 'production',
              path: '/',
              sameSite: 'strict',
              maxAge: 0,
              domain: undefined
            })
          } catch (error) {
            console.warn('Error removing cookie:', error)
          }
        },
      },
      auth: {
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  )
}
