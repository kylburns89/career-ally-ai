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
              path: '/',
              sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
              maxAge: name.includes('access_token') 
                ? 3600 // 1 hour for access tokens
                : name.includes('refresh_token')
                ? 30 * 24 * 3600 // 30 days for refresh tokens
                : undefined,
              domain: undefined
            })
          } catch (error) {
            console.error('Error setting cookie:', error)
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
              sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
              maxAge: 0,
              domain: undefined
            })
          } catch (error) {
            console.error('Error removing cookie:', error)
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
