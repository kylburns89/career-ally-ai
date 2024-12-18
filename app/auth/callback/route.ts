import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  const supabase = createClient()

  if (code) {
    // OAuth or magic link flow
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL('/auth/error', request.url))
    }

    // Verify session was established
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      console.error('Error getting session after code exchange:', sessionError)
      return NextResponse.redirect(new URL('/auth/error', request.url))
    }

    return NextResponse.redirect(new URL(next, request.url))
  } 
  
  if (token_hash && type) {
    // Email confirmation flow
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (error) {
      console.error('Error verifying OTP:', error)
      return NextResponse.redirect(new URL('/auth/error', request.url))
    }

    // Verify session was established
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      console.error('Error getting session after OTP verification:', sessionError)
      return NextResponse.redirect(new URL('/auth/error', request.url))
    }

    return NextResponse.redirect(new URL(next, request.url))
  }

  // Return the user to an error page with some instructions
  console.error('No code or token_hash found in callback')
  return NextResponse.redirect(new URL('/auth/error', request.url))
}
