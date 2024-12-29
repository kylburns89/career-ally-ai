import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/auth-options";
import { prisma } from "../../../../lib/prisma";
import { validateData, newResumeSchema } from "../../../../lib/validations";
import { formToDbFormat } from "../../../../types/resume";

// GET /api/resumes/[id] - Get a specific resume
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const resume = await prisma.resume.findUnique({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!resume) {
      return new Response(
        JSON.stringify({ message: "Resume not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error("GET /api/resumes/[id] error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to fetch resume",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// PUT /api/resumes/[id] - Update a resume
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    
    if (body.content) {
      const validation = await validateData(newResumeSchema, body.content);
      if (!validation.success) {
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

      // Update resume in database
      const updatedResume = await prisma.resume.update({
        where: {
          id: id,
          userId: user.id,
        },
        data: {
          title: body.title || body.name, // Support both title and name fields
          content: dbContent,
          template: body.template || dbContent.template || 'professional',
        },
      });

      return NextResponse.json(updatedResume);
    } else {
      // Handle name-only updates
      const updatedResume = await prisma.resume.update({
        where: {
          id: id,
          userId: user.id,
        },
        data: {
          title: body.name,
        },
      });

      return NextResponse.json(updatedResume);
    }
  } catch (error) {
    console.error("PUT /api/resumes/[id] error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to update resume",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE /api/resumes/[id] - Delete a resume
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Delete resume from database
    await prisma.resume.delete({
      where: {
        id: id,
        userId: user.id,
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/resumes/[id] error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to delete resume",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
