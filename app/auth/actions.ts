'use server'

import { createClient } from '../../lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getURL } from '../../lib/utils'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const cookieStore = cookies()
  const supabase = createClient()

  // First, try to find if a user with this email exists and has a GitHub provider
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
  const existingUser = users?.find(u => 
    u.email === email && 
    u.app_metadata?.provider === 'github'
  )

  if (existingUser) {
    // If user exists with GitHub, try to link the email/password account
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getURL()}auth/callback`,
      }
    })

    if (signUpError) {
      return { error: signUpError.message }
    }

    // Now sign in with the credentials
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      return { error: signInError.message }
    }
  } else {
    // No existing GitHub account, proceed with normal sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }
  }

  // Get the intended destination
  const redirectTo = cookieStore.get('redirectTo')?.value || '/'
  
  // Clear the redirect cookie
  cookieStore.delete('redirectTo')
  
  redirect(redirectTo)
}

export async function signOut() {
  const cookieStore = cookies()
  const supabase = createClient()

  // Sign out from Supabase auth
  await supabase.auth.signOut()

  // Clear all auth-related cookies
  const authCookies = [
    'sb-access-token',
    'sb-refresh-token',
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
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = createClient()
  
  // Check if a user with this email exists with a different provider
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
  const existingUser = users?.find(u => 
    u.email === email && 
    u.app_metadata?.provider !== 'email'
  )

  if (existingUser) {
    // If user exists with another provider, link the accounts
    const { error: linkError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getURL()}auth/callback`,
      }
    })

    if (linkError) {
      return { error: linkError.message }
    }

    // Redirect to a special page explaining the account linking
    redirect('/auth/link-accounts')
  }

  // No existing account, proceed with normal sign up
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getURL()}auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/auth/verify')
}

export async function signInWithOAuth(provider: 'github' | 'google') {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${getURL()}auth/callback`,
      queryParams: {
        // Enable account linking if the email matches an existing account
        access_type: 'offline',
        prompt: 'consent'
      }
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
  const supabase = createClient()
  try {
    const { data, error } = await supabase.auth.mfa.unenroll({ factorId })
    if (error) throw error
    return { data }
  } catch (error: any) {
    return { error: error.message }
  }
}
