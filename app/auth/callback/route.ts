import { createClient } from '../../../lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Helper to create error redirect URL with message
function createErrorUrl(request: NextRequest, message: string): URL {
  const errorUrl = new URL('/auth/error', request.url)
  errorUrl.searchParams.set('message', encodeURIComponent(message))
  return errorUrl
}

// Helper to verify user session with retries
async function verifySession(supabase: Awaited<ReturnType<typeof createClient>>) {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second
  const timeout = 10000; // 10 second timeout

  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Session verification timed out')), timeout)
  );

  const verifyPromise = (async () => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        // Add a delay before checking (skip delay on first try)
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        if (!session) throw new Error('No session established')
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) throw new Error('No user found')
        
        return { user, session }
      } catch (error) {
        if (i === maxRetries - 1) throw error; // Throw on last retry
        console.warn(`Session verification attempt ${i + 1} failed, retrying...`);
      }
    }
    throw new Error('Session verification failed after all retries');
  })();

  try {
    return await Promise.race([verifyPromise, timeoutPromise]);
  } catch (error) {
    if (error instanceof Error && error.message === 'Session verification timed out') {
      console.error('Session verification timed out');
    }
    throw error;
  }
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
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  try {
    if (code) {
      // Handle OAuth or magic link flow
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error

      try {
        await verifySession(supabase)
      } catch (error) {
        console.error('Session verification failed:', error);
        throw new Error('Failed to verify authentication. Please try logging in again.');
      }
      
      // Check if user needs to set up profile
      const profileRedirect = await ensureUserProfile(request)
      if (profileRedirect) {
        return NextResponse.redirect(profileRedirect)
      }

      return NextResponse.redirect(new URL(next, request.url))
    } 
    
    if (token_hash && type) {
      // Handle email confirmation flow
      const { error } = await supabase.auth.verifyOtp({ type, token_hash })
      if (error) throw error

      await verifySession(supabase)
      
      // For email confirmations, always redirect to profile setup first
      const setupUrl = new URL('/settings/profile', request.url)
      setupUrl.searchParams.set('redirectTo', next)
      return NextResponse.redirect(setupUrl)
    }

    throw new Error('No authentication parameters found')
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(
      createErrorUrl(
        request,
        error instanceof Error ? error.message : 'Authentication failed'
      )
    )
  }
}
