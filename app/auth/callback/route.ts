import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    console.log('Auth callback initiated with code:', code)

    // Exchange the code for a session
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (sessionError) {
      console.error('Session exchange error:', {
        code: sessionError.code,
        message: sessionError.message,
        name: sessionError.name,
        stack: sessionError.stack
      })
      return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
    }

    console.log('Session exchange successful:', {
      userId: session?.user?.id,
      email: session?.user?.email
    })

    if (session?.user) {
      // Check if profile exists
      console.log('Checking if profile exists for user:', session.user.id)
      const { data: profile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (profileCheckError) {
        console.error('Profile check error:', {
          code: profileCheckError.code,
          message: profileCheckError.message
        })
        if (profileCheckError.code !== 'PGRST116') { // PGRST116 is "not found" error
          return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
        }
      }

      console.log('Profile check result:', { exists: !!profile })

      // If profile doesn't exist, create it
      if (!profile) {
        console.log('Creating new profile for user:', session.user.id)
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert([{ id: session.user.id }])

        if (createProfileError) {
          console.error('Profile creation error:', {
            code: createProfileError.code,
            message: createProfileError.message
          })
          return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
        }
        console.log('Profile created successfully')
      }
    }
  } else {
    console.error('No code provided in callback URL')
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
