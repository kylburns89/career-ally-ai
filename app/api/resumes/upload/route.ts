import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get file from request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ message: "No file provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('text/plain')) {
      return new Response(
        JSON.stringify({ message: "Invalid file type. Only PDF and TXT files are allowed." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate file size (4MB for PDF, 1MB for TXT)
    const maxSize = file.type.includes('pdf') ? 4 * 1024 * 1024 : 1024 * 1024;
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ message: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.type.includes('pdf') ? '.pdf' : '.txt';
    const fileName = `${session.user.id}-${timestamp}${fileExtension}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ message: "Failed to upload file" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("POST /api/resumes/upload error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to upload resume",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
