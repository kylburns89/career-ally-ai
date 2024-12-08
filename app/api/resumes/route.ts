import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validateData, resumeSchema } from "@/lib/validations";
import { formToDbFormat } from "@/types/resume";
import type { SavedResume } from "@/types/resume";

export const dynamic = 'force-dynamic';

// GET /api/resumes - Get all resumes for the current user
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Session error:", sessionError);
      throw new Error("Failed to get session");
    }
    
    if (!session) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data: resumes, error: fetchError } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", session.user.id)
      .order("updated_at", { ascending: false });

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      throw fetchError;
    }

    return NextResponse.json(resumes || []);
  } catch (error) {
    console.error("GET /api/resumes error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to fetch resumes",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST /api/resumes - Create a new resume
export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Session error:", sessionError);
      throw new Error("Failed to get session");
    }
    
    if (!session) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    console.log("Received resume data:", JSON.stringify(body, null, 2));
    
    const validation = await validateData(resumeSchema, body.content);
    if (!validation.success) {
      console.error("Validation error:", validation.error);
      return new Response(
        JSON.stringify({ 
          message: "Validation failed", 
          error: validation.error 
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert form data to database format
    const dbContent = formToDbFormat(validation.data);

    console.log("Preparing resume data:", {
      user_id: session.user.id,
      name: body.name,
      content: JSON.stringify(dbContent, null, 2)
    });

    // Insert resume
    const { data: resume, error: insertError } = await supabase
      .from("resumes")
      .upsert({
        user_id: session.user.id,
        name: body.name,
        content: dbContent,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    if (!resume) {
      throw new Error("Failed to create resume - no data returned");
    }

    console.log("Successfully saved resume:", resume);
    return NextResponse.json(resume);
  } catch (error) {
    console.error("POST /api/resumes error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to save resume",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
