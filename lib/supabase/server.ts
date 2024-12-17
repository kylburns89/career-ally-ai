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
            // Ensure cookies work in production
            cookieStore.set({
              name,
              value,
              ...options,
              // Force secure in production
              secure: process.env.NODE_ENV === 'production' ? true : options.secure,
              // Ensure same-site policy
              sameSite: 'lax',
              // Set path to root to ensure availability across all routes
              path: '/',
              // Set domain based on environment
              ...(process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SITE_URL
                ? { domain: new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname }
                : {})
            })
          } catch (error) {
            console.warn('Error setting cookie:', error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // Use same options as set to ensure proper removal
            cookieStore.set({
              name,
              value: '',
              ...options,
              secure: process.env.NODE_ENV === 'production' ? true : options.secure,
              sameSite: 'lax',
              path: '/',
              ...(process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SITE_URL
                ? { domain: new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname }
                : {}),
              maxAge: 0
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
