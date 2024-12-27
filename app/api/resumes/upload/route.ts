import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/auth-options";
import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Check session using next-auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get user from prisma
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return new Response(
        JSON.stringify({ message: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
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

    // Store file in database
    const fileContent = await file.text(); // Get file content as text
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: file.name, // Use filename as title
        content: {
          type: file.type,
          size: file.size,
          content: fileContent,
        },
        template: 'default', // Default template
      },
    });

    if (!resume) {
      return new Response(
        JSON.stringify({ message: "Failed to save resume" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return NextResponse.json({ 
      id: resume.id,
      title: resume.title,
      template: resume.template,
      createdAt: resume.createdAt
    });
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
