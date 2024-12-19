import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { cookies } from 'next/headers'

// Helper to create error redirect URL with message
function createErrorUrl(request: NextRequest, message: string): URL {
  const errorUrl = new URL('/auth/error', request.url)
  errorUrl.searchParams.set('message', encodeURIComponent(message))
  return errorUrl
}

// Helper to verify user session
async function verifySession(supabase: ReturnType<typeof createClient>) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!session) throw new Error('No session established')
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) throw new Error('No user found')
  
  return { user, session }
}

// Helper to check/create user profile
async function ensureUserProfile(request: NextRequest) {
  try {
    const response = await fetch(new URL('/api/profile', request.url))
    if (response.status === 404) {
      // Redirect to profile setup but preserve the intended destination
      const setupUrl = new URL('/settings/profile', request.url)
      const redirectTo = cookies().get('redirectTo')?.value
      if (redirectTo) {
        setupUrl.searchParams.set('redirectTo', redirectTo)
      }
      return setupUrl
    }
    return null
  } catch (error) {
    console.error('Error checking profile:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  try {
    if (!token_hash || !type) {
      throw new Error('Missing verification parameters')
    }

    // Verify the OTP
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (error) throw error

    // Verify session was established
    await verifySession(supabase)

    // For email confirmations, always check profile first
    const profileRedirect = await ensureUserProfile(request)
    if (profileRedirect) {
      return NextResponse.redirect(profileRedirect)
    }

    // All good, redirect to the next page
    return NextResponse.redirect(new URL(next, request.url))
  } catch (error) {
    console.error('Email confirmation error:', error)
    return NextResponse.redirect(
      createErrorUrl(
        request,
        error instanceof Error ? error.message : 'Email confirmation failed'
      )
    )
  }
}
