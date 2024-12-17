import { createClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/'
    
    if (code) {
      const cookieStore = cookies()
      const supabase = createClient()
      
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        // Get the intended destination or default to /
        const redirectTo = cookieStore.get('redirectTo')?.value || next
        
        // Clear the redirect cookie
        cookieStore.delete('redirectTo')
        
        // Ensure the redirect URL is absolute
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin
        const redirectUrl = new URL(redirectTo, baseUrl)
        
        return NextResponse.redirect(redirectUrl)
      }
      
      console.error('Auth callback error:', error)
    }
  } catch (error) {
    console.error('Auth callback error:', error)
  }

  // If there's no code or an error occurred, redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url))
}
