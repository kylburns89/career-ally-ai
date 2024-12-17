import { createClient } from './supabase/client'
import { NextRequest, NextResponse } from 'next/server'
import { AuthenticatorAssuranceLevels } from '@supabase/supabase-js'
import type { FactorList } from '../types/auth'

// Keep middleware functions that use server-side client
export async function requireAuth(req: NextRequest) {
  const response = await fetch('/api/auth/check', {
    headers: {
      cookie: req.headers.get('cookie') || ''
    }
  })
  
  if (!response.ok) {
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
  const response = await fetch('/api/auth/mfa/check', {
    headers: {
      cookie: req.headers.get('cookie') || ''
    }
  })

  if (!response.ok) {
    const data = await response.json()
    const redirectPath = data.hasMFASetup ? '/auth/mfa' : '/settings/security'
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

// Client-side auth helpers using browser client
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
