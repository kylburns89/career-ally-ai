import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// POST /api/profile - Create a new profile
export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select()
      .eq("id", session.user.id)
      .single();

    // If profile already exists, return it
    if (existingProfile) {
      return NextResponse.json(existingProfile);
    }

    // Create new profile
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
        work_history: [],
        desired_salary: null,
        desired_location: null,
        remote_only: false,
        linkedin: null,
        github: null,
        portfolio: null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH /api/profile - Update profile
export async function PATCH(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updates = await req.json();

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", session.user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select()
      .eq("id", session.user.id)
      .single();

    if (error) throw error;

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
