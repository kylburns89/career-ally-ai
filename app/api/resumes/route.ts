import { NextResponse } from "next/server";
import { validateData, resumeSchema, newResumeSchema } from "../../../lib/validations";
import { formToDbFormat } from "../../../types/resume";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/auth-options";
import { prisma } from "../../../lib/prisma";

export const dynamic = 'force-dynamic';

// GET /api/resumes - Get all resumes for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ message: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ message: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        title: true,
        content: true,
        template: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(resumes);
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ message: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ message: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    console.log("Received resume data:", JSON.stringify(body, null, 2));
    
    const validation = await validateData(newResumeSchema, body.content);
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

    // Convert form data to database format and ensure it's JSON-compatible
    const dbContent = JSON.parse(JSON.stringify(formToDbFormat(validation.data)));

    // Create new resume in database
    const newResume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: body.title,
        content: dbContent,
        template: body.template || 'professional',
      },
      select: {
        id: true,
        userId: true,
        title: true,
        content: true,
        template: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    console.log("Successfully saved resume:", newResume);
    return NextResponse.json(newResume);
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
