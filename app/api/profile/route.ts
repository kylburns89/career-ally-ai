import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextResponse } from "next/server";

// POST /api/profile - Create a new profile
export async function POST(req: Request) {
  try {
    console.log('[PROFILE_POST] Starting profile creation...');
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Partial<ResponseCookie>) {
            cookieStore.set({
              name,
              value,
              ...options,
              // Ensure secure cookies in production
              secure: process.env.NODE_ENV === 'production',
              // Support OAuth flows
              sameSite: 'lax',
              // Set path to root
              path: '/',
            });
          },
          remove(name: string, options: Partial<ResponseCookie>) {
            cookieStore.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
            });
          },
        },
      }
    );
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('[PROFILE_POST] Session error:', sessionError);
      return new NextResponse(JSON.stringify({ error: 'Session error', details: sessionError }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!session) {
      console.log('[PROFILE_POST] No session found');
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[PROFILE_POST] Session found for user:', session.user.id);
    console.log('[PROFILE_POST] Checking for existing profile...');
    
    const { data: existingProfile, error: existingError } = await supabase
      .from("profiles")
      .select()
      .eq("id", session.user.id)
      .single();

    if (existingError) {
      console.error('[PROFILE_POST] Error checking existing profile:', existingError);
      throw existingError;
    }

    // If profile already exists, return it
    if (existingProfile) {
      console.log('[PROFILE_POST] Existing profile found:', existingProfile.id);
      return NextResponse.json(existingProfile);
    }

    console.log('[PROFILE_POST] Creating new profile for user:', session.user.id);
    const { data: profile, error } = await supabase
      .from("profiles")
      .insert({
        id: session.user.id,
        title: null,
        bio: null,
        location: null,
        years_experience: null,
        skills: [],
        industries: [],
        education: [],
        experience: [],
        certifications: [],
        desired_salary: null,
        desired_location: null,
        remote_only: false,
        linkedin: null,
        github: null,
        portfolio: null,
      })
      .select()
      .single();

    if (error) {
      console.error("[PROFILE_POST] Insert error:", {
        code: error.code,
        message: error.message,
        details: error.details
      });
      
      // Check if it's an RLS error
      if (error.message?.includes('policy')) {
        console.error('[PROFILE_POST] Possible RLS policy violation');
      }
      
      throw error;
    }

    console.log('[PROFILE_POST] New profile created:', profile?.id);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_POST] Error:", error);
    return new NextResponse(JSON.stringify({ error: 'Internal Error', details: error }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// PATCH /api/profile - Update profile
export async function PATCH(req: Request) {
  try {
    console.log('[PROFILE_PATCH] Starting profile update...');
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Partial<ResponseCookie>) {
            cookieStore.set({
              name,
              value,
              ...options,
              // Ensure secure cookies in production
              secure: process.env.NODE_ENV === 'production',
              // Support OAuth flows
              sameSite: 'lax',
              // Set path to root
              path: '/',
            });
          },
          remove(name: string, options: Partial<ResponseCookie>) {
            cookieStore.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
            });
          },
        },
      }
    );
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('[PROFILE_PATCH] Session error:', sessionError);
      return new NextResponse(JSON.stringify({ error: 'Session error', details: sessionError }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!session) {
      console.log('[PROFILE_PATCH] No session found');
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[PROFILE_PATCH] Session found for user:', session.user.id);
    
    const updates = await req.json();
    console.log('[PROFILE_PATCH] Updating profile with:', updates);

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", session.user.id)
      .select()
      .single();

    if (error) {
      console.error("[PROFILE_PATCH] Update error:", {
        code: error.code,
        message: error.message,
        details: error.details
      });
      
      // Check if it's an RLS error
      if (error.message?.includes('policy')) {
        console.error('[PROFILE_PATCH] Possible RLS policy violation');
      }
      
      throw error;
    }

    console.log('[PROFILE_PATCH] Profile updated:', profile?.id);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_PATCH] Error:", error);
    return new NextResponse(JSON.stringify({ error: 'Internal Error', details: error }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    console.log('[PROFILE_GET] Starting profile fetch...');
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Partial<ResponseCookie>) {
            cookieStore.set({
              name,
              value,
              ...options,
              // Ensure secure cookies in production
              secure: process.env.NODE_ENV === 'production',
              // Support OAuth flows
              sameSite: 'lax',
              // Set path to root
              path: '/',
            });
          },
          remove(name: string, options: Partial<ResponseCookie>) {
            cookieStore.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
            });
          },
        },
      }
    );
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('[PROFILE_GET] Session error:', sessionError);
      return new NextResponse(JSON.stringify({ error: 'Session error', details: sessionError }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!session) {
      console.log('[PROFILE_GET] No session found');
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[PROFILE_GET] Session found for user:', session.user.id);

    // Verify RLS is not blocking access
    console.log('[PROFILE_GET] Checking RLS policies...');
    const { data: profile, error } = await supabase
      .from("profiles")
      .select()
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("[PROFILE_GET] Database error:", {
        code: error.code,
        message: error.message,
        details: error.details
      });
      
      // PGRST116 means no rows returned
      if (error.code === 'PGRST116') {
        console.log('[PROFILE_GET] No profile found for user:', session.user.id);
        return new NextResponse(JSON.stringify({ error: 'Profile not found' }), { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Check if it's an RLS error
      if (error.message?.includes('policy')) {
        console.error('[PROFILE_GET] Possible RLS policy violation');
      }
      
      throw error;
    }

    if (!profile) {
      console.log('[PROFILE_GET] No profile found for user:', session.user.id);
      return new NextResponse(JSON.stringify({ error: 'Profile not found' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[PROFILE_GET] Profile found:', {
      id: profile.id,
      title: profile.title,
      hasData: !!profile
    });
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
