import { CookieOptions } from '@supabase/ssr'

export const cookieConfig = {
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
  domain: undefined
} as const

export const getCookieExpiry = (name: string) => {
  if (name.includes('access_token')) return 3600 // 1 hour
  if (name.includes('refresh_token')) return 30 * 24 * 3600 // 30 days
  return undefined
}

export const authConfig = {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
} as const

export const createCookieOptions = (name: string): CookieOptions => ({
  ...cookieConfig,
  maxAge: getCookieExpiry(name),
})
