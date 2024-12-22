'use server'

import { createClient } from '../../lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export type AuthSuccess = { success: true; redirectTo: string }
export type AuthError = { error: string }
export type AuthResult = AuthSuccess | AuthError

// Helper to get base URL for redirects
function getURL() {
  // In production, prefer NEXT_PUBLIC_SITE_URL if set
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const url = process.env.NEXT_PUBLIC_SITE_URL
    return url.endsWith('/') ? url : `${url}/`
  }
  
  // For Vercel deployments
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/`
  }
  
  // Fallback for local development
  return 'http://localhost:3000/'
}

// Helper to handle auth errors consistently
function handleAuthError(error: Error | null): AuthError {
  console.error('Auth error:', error)
  return { error: error?.message || 'An unknown error occurred' }
}

// Helper to clear auth cookies
function clearAuthCookies() {
  const cookieStore = cookies()
  const authCookies = [
    'sb-access-token',
    'sb-refresh-token',
    'redirectTo'
  ]
  
  // Clear specific auth cookies
  authCookies.forEach(name => {
    cookieStore.delete(name)
  })

  // Clear any other Supabase-related cookies
  cookieStore.getAll().forEach(cookie => {
    if (cookie.name.startsWith('sb-') || cookie.name.includes('supabase')) {
      cookieStore.delete(cookie.name)
    }
  })
}

export async function signIn(formData: FormData) {
  const cookieStore = cookies()
  const redirectTo = cookieStore.get('redirectTo')?.value || '/'
  
  const supabase = await createClient()
  
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })
    if (error) throw error

    cookieStore.delete('redirectTo')
    return { success: true as const, redirectTo }
  } catch (error) {
    return handleAuthError(error as Error)
  }
}

export async function signOut() {
  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    clearAuthCookies()
    return { success: true as const, redirectTo: '/auth/login' }
  } catch (error) {
    return handleAuthError(error as Error)
  }
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signUp({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      options: {
        emailRedirectTo: `${getURL()}auth/callback?next=/`,
      },
    })
    if (error) throw error

    return { success: true as const, redirectTo: '/auth/verify' }
  } catch (error) {
    return handleAuthError(error as Error)
  }
}

export async function signInWithOAuth(provider: 'github' | 'google') {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${getURL()}auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) throw error

    if (data.url) {
      return { success: true as const, redirectTo: data.url }
    }
    throw new Error('No OAuth URL returned')
  } catch (error) {
    return handleAuthError(error as Error)
  }
}

// MFA-related server actions
export async function enrollMFA() {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp'
    })
    if (error) throw error
    return { data }
  } catch (error) {
    return handleAuthError(error as Error)
  }
}

export async function verifyMFA(factorId: string, code: string) {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code
    })
    if (error) throw error
    return { data }
  } catch (error) {
    return handleAuthError(error as Error)
  }
}

export async function unenrollMFA(factorId: string) {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase.auth.mfa.unenroll({ factorId })
    if (error) throw error
    return { data }
  } catch (error) {
    return handleAuthError(error as Error)
  }
}

export async function resetPassword(email: string) {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getURL()}auth/update-password`,
    })
    if (error) throw error
    return { success: true as const }
  } catch (error) {
    return handleAuthError(error as Error)
  }
}

export async function updatePassword(password: string) {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    return { success: true as const, redirectTo: '/auth/login' }
  } catch (error) {
    return handleAuthError(error as Error)
  }
}
