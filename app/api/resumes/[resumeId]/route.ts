import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { handleErrorResponse } from "@/lib/supabase/client";
import { validateData, resumeSchema } from "@/lib/validations";

// GET /api/resumes/[resumeId] - Get a specific resume
export async function GET(
  req: Request,
  { params }: { params: { resumeId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("auth/unauthorized");
    }

    const { data: resume, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", params.resumeId)
      .eq("user_id", session.user.id)
      .single();

    if (error) throw error;
    if (!resume) {
      return new Response(
        JSON.stringify({ message: "Resume not found" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return NextResponse.json(resume);
  } catch (error) {
    return handleErrorResponse(error);
  }
}

// PATCH /api/resumes/[resumeId] - Update a resume
export async function PATCH(
  req: Request,
  { params }: { params: { resumeId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("auth/unauthorized");
    }

    const body = await req.json();

    // Validate request body
    const validation = await validateData(resumeSchema, body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ message: validation.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { name, content } = validation.data;

    // Check if resume exists and belongs to user
    const { data: existingResume, error: checkError } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", params.resumeId)
      .eq("user_id", session.user.id)
      .single();

    if (checkError || !existingResume) {
      return new Response(
        JSON.stringify({ message: "Resume not found" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data: resume, error } = await supabase
      .from("resumes")
      .update({
        name,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.resumeId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(resume);
  } catch (error) {
    return handleErrorResponse(error);
  }
}

// DELETE /api/resumes/[resumeId] - Delete a resume
export async function DELETE(
  req: Request,
  { params }: { params: { resumeId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("auth/unauthorized");
    }

    // Check if resume exists and belongs to user
    const { data: existingResume, error: checkError } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", params.resumeId)
      .eq("user_id", session.user.id)
      .single();

    if (checkError || !existingResume) {
      return new Response(
        JSON.stringify({ message: "Resume not found" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error } = await supabase
      .from("resumes")
      .delete()
      .eq("id", params.resumeId);

    if (error) throw error;

    return new Response(null, { status: 204 });
  } catch (error) {
    return handleErrorResponse(error);
  }
}
