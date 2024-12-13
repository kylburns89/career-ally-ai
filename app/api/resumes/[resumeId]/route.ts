import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validateData, resumeSchema } from "@/lib/validations";
import { formToDbFormat } from "@/types/resume";
import type { Database } from "@/types/database";
import type { Json } from "@/types/database";

// GET /api/resumes/[resumeId] - Get a specific resume
export async function GET(
  req: Request,
  { params }: { params: { resumeId: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new Response(
        JSON.stringify({ message: "Please log in to view this resume" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data: resume, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", params.resumeId)
      .eq("user_id", session.user.id)
      .single();

    if (error) {
      console.error("Database error:", error);
      throw error;
    }
    
    if (!resume) {
      return new Response(
        JSON.stringify({ message: "Resume not found" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Error fetching resume:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to fetch resume",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// PATCH /api/resumes/[resumeId] - Update a resume
export async function PATCH(
  req: Request,
  { params }: { params: { resumeId: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new Response(
        JSON.stringify({ message: "Please log in to update this resume" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();

    // Validate request body
    const validation = await validateData(resumeSchema, body.content);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ message: validation.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert form data to database format and ensure it matches Json type
    const dbContent = JSON.parse(JSON.stringify(formToDbFormat(validation.data))) as Json;

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
        name: body.name,
        content: dbContent,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.resumeId)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Error updating resume:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to update resume",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// DELETE /api/resumes/[resumeId] - Delete a resume
export async function DELETE(
  req: Request,
  { params }: { params: { resumeId: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new Response(
        JSON.stringify({ message: "Please log in to delete this resume" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if resume exists and belongs to user
    const { data: existingResume, error: checkError } = await supabase
      .from("resumes")
      .select("id, content")
      .eq("id", params.resumeId)
      .eq("user_id", session.user.id)
      .single();

    if (checkError || !existingResume) {
      return new Response(
        JSON.stringify({ message: "Resume not found" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete file from storage if it exists
    const content = existingResume.content as Record<string, any>;
    if (content?.file_url) {
      const fileName = content.file_url.split('/').pop();
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('resumes')
          .remove([`${session.user.id}/${fileName}`]);

        if (storageError) {
          console.error("Storage error:", storageError);
          throw storageError;
        }
      }
    }

    // Delete record from database
    const { error } = await supabase
      .from("resumes")
      .delete()
      .eq("id", params.resumeId)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to delete resume",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
