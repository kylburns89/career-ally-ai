import { createClient } from './supabase/client'
import type { FactorList } from '../types/auth'

// List of public routes that don't require authentication
export const publicRoutes = [
  '/',
  '/about',
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
  '/auth/reset-password',
  '/auth/forgot-password',
  '/auth/mfa',
  '/auth/verify',
  '/support/help',
  '/support/privacy',
  '/support/terms'
] as const

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
