import { createClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const cookieStore = cookies()
    const supabase = createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the intended destination or default to /
      const redirectTo = cookieStore.get('redirectTo')?.value || '/'
      
      // Clear the redirect cookie
      cookieStore.delete('redirectTo')
      
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
    }
  }

  // If there's no code or an error occurred, redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url))
}
