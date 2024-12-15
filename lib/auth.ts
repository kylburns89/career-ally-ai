import { createClient } from './supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { AuthenticatorAssuranceLevels } from '@supabase/supabase-js'
import type { FactorList } from '@/types/auth'

export async function requireAuth(req: NextRequest) {
  const supabase = createClient()

  // Always use getUser() for auth checks, not getSession()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    // For API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    // For page routes, redirect to login
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return null // No error, request is authenticated
}

export async function requireMFA(req: NextRequest) {
  const supabase = createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized - Authentication required' },
      { status: 401 }
    )
  }

  const { data, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  const currentLevel = data?.currentLevel ?? null

  if (mfaError || currentLevel !== 'aal2' as AuthenticatorAssuranceLevels) {
    // Check if user has MFA set up
    const { data: factors } = await supabase.auth.mfa.listFactors()
    const hasMFASetup = (factors?.totp ?? []).length > 0 || (factors?.phone ?? []).length > 0

    // Redirect based on MFA setup status
    const redirectPath = hasMFASetup ? '/auth/mfa' : '/settings/security'
    const redirectUrl = new URL(redirectPath, req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return null // No error, request is MFA authenticated
}

export function isPublicRoute(pathname: string): boolean {
  const publicPaths = [
    '/',
    '/about',
    '/auth/login',
    '/auth/signup',
    '/auth/callback',
    '/auth/reset-password',
    '/auth/forgot-password',
    '/auth/mfa',
    '/support/help',
    '/support/privacy',
    '/support/terms'
  ]
  
  return publicPaths.some(path => pathname === path)
}

export async function getUser() {
  const supabase = createClient()
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export async function getSession() {
  const supabase = createClient()
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export async function getAuthLevel() {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (error) throw error
    return {
      currentLevel: data?.currentLevel ?? 'aal1',
      nextLevel: data?.nextLevel ?? null
    }
  } catch (error) {
    console.error('Error:', error)
    return { currentLevel: 'aal1', nextLevel: null }
  }
}

export async function listFactors(): Promise<FactorList> {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.auth.mfa.listFactors()
    if (error) throw error
    return {
      totp: data?.totp ?? [],
      phone: data?.phone ?? []
    }
  } catch (error) {
    console.error('Error:', error)
    return { totp: [], phone: [] }
  }
}

export async function enrollTOTP() {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp'
    })
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

export async function verifyTOTP(factorId: string, code: string) {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code
    })
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

export async function unenrollFactor(factorId: string) {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.auth.mfa.unenroll({ factorId })
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// Helper to protect API routes with MFA requirement
export async function withAuthMFA(
  req: NextRequest, 
  handler: (user: any) => Promise<NextResponse>,
  requiredLevel: AuthenticatorAssuranceLevels = 'aal2'
) {
  const supabase = createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized - Authentication required' },
      { status: 401 }
    )
  }

  const { data, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  const currentLevel = data?.currentLevel ?? null
  
  if (mfaError || currentLevel !== requiredLevel) {
    return NextResponse.json(
      { error: 'Unauthorized - MFA required' },
      { status: 403 }
    )
  }

  return handler(user)
}
