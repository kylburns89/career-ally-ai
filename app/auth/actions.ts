'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getURL } from '@/lib/utils'

export async function signIn(formData: FormData) {
  // Call cookies() before any Supabase operations to opt out of caching
  const cookieStore = cookies()
  const redirectTo = cookieStore.get('redirectTo')?.value || '/'
  
  const supabase = createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: error.message }
  }

  // Verify the user is authenticated using getUser() instead of getSession()
  // This is more secure as it validates the token with the Supabase Auth server
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: userError?.message || 'Authentication failed' }
  }

  // Ensure session is properly set
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    return { error: sessionError?.message || 'Failed to establish session' }
  }

  // Clear the redirect cookie
  cookieStore.delete('redirectTo')
  
  redirect(redirectTo)
}

export async function signOut() {
  // Call cookies() before any Supabase operations to opt out of caching
  const cookieStore = cookies()
  const supabase = createClient()

  // Sign out from Supabase auth
  const { error } = await supabase.auth.signOut()
  if (error) {
    return { error: error.message }
  }

  // Clear all auth-related cookies
  const authCookies = [
    'sb-access-token',
    'sb-refresh-token',
    'sb-auth-token',
    'supabase-auth-token',
    'redirectTo'
  ]
  
  authCookies.forEach(name => {
    cookieStore.delete(name)
  })

  // Clear any other session data
  cookieStore.getAll().forEach(cookie => {
    if (cookie.name.startsWith('sb-') || cookie.name.includes('supabase')) {
      cookieStore.delete(cookie.name)
    }
  })

  redirect('/auth/login')
}

export async function signUp(formData: FormData) {
  // Call cookies() before any Supabase operations to opt out of caching
  cookies()
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: `${getURL()}auth/callback?next=/`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/auth/verify')
}

export async function signInWithOAuth(provider: 'github' | 'google') {
  // Call cookies() before any Supabase operations to opt out of caching
  cookies()
  const supabase = createClient()
  
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

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

// MFA-related server actions
export async function enrollMFA() {
  // Call cookies() before any Supabase operations to opt out of caching
  cookies()
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp'
    })
    if (error) throw error
    return { data }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function verifyMFA(factorId: string, code: string) {
  // Call cookies() before any Supabase operations to opt out of caching
  cookies()
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code
    })
    if (error) throw error
    return { data }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function unenrollMFA(factorId: string) {
  // Call cookies() before any Supabase operations to opt out of caching
  cookies()
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.auth.mfa.unenroll({ factorId })
    if (error) throw error
    return { data }
  } catch (error: any) {
    return { error: error.message }
  }
}
