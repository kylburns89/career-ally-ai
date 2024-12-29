import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import { authOptions } from "../../auth/auth-options";

// GET /api/applications/[id] - Get a specific application
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
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

    const application = await prisma.jobApplication.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
      include: {
        contact: true,
      },
    });
    
    if (!application) {
      return new Response(
        JSON.stringify({ message: "Application not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Transform to match Application type
    const transformedApplication = {
      id: application.id,
      userId: application.userId,
      jobTitle: application.jobTitle,
      company: application.company,
      location: application.location,
      status: application.status,
      appliedDate: application.appliedDate,
      contactId: application.contactId,
      resumeId: application.resumeId,
      coverLetterId: application.coverLetterId,
      notes: application.notes,
      nextSteps: application.nextSteps,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    };

    return NextResponse.json(transformedApplication);
  } catch (error) {
    console.error("GET /api/applications/[id] error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to fetch application",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// PUT /api/applications/[id] - Update a specific application
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
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

    // Verify the application belongs to the user
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingApplication) {
      return new Response(
        JSON.stringify({ message: "Application not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const updatedData = await req.json();

    const application = await prisma.jobApplication.update({
      where: { id: id },
      data: {
        jobTitle: updatedData.jobTitle,
        company: updatedData.company,
        location: updatedData.location,
        status: updatedData.status,
        appliedDate: updatedData.appliedDate,
        contactId: updatedData.contactId,
        resumeId: updatedData.resumeId,
        coverLetterId: updatedData.coverLetterId,
        notes: updatedData.notes,
        nextSteps: updatedData.nextSteps,
      }
    });

    // Transform to match Application type
    const transformedApplication = {
      id: application.id,
      userId: application.userId,
      jobTitle: application.jobTitle,
      company: application.company,
      location: application.location,
      status: application.status,
      appliedDate: application.appliedDate,
      contactId: application.contactId,
      resumeId: application.resumeId,
      coverLetterId: application.coverLetterId,
      notes: application.notes,
      nextSteps: application.nextSteps,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    };

    return NextResponse.json(transformedApplication);
  } catch (error) {
    console.error("PUT /api/applications/[id] error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to update application",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// PATCH /api/applications/[id] - Update specific fields of an application
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
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

    // Verify the application belongs to the user
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingApplication) {
      return new Response(
        JSON.stringify({ message: "Application not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const patchData = await req.json();

    const application = await prisma.jobApplication.update({
      where: { id: id },
      data: {
        contactId: patchData.contactId,
      },
      include: {
        contact: true,
      }
    });

    // Transform to match Application type
    const transformedApplication = {
      id: application.id,
      userId: application.userId,
      jobTitle: application.jobTitle,
      company: application.company,
      location: application.location,
      status: application.status,
      appliedDate: application.appliedDate,
      contactId: application.contactId,
      resumeId: application.resumeId,
      coverLetterId: application.coverLetterId,
      notes: application.notes,
      nextSteps: application.nextSteps,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    };

    return NextResponse.json(transformedApplication);
  } catch (error) {
    console.error("PATCH /api/applications/[id] error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to update application",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE /api/applications/[id] - Delete a specific application
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
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

    // Verify the application belongs to the user
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingApplication) {
      return new Response(
        JSON.stringify({ message: "Application not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    await prisma.jobApplication.delete({
      where: { id: id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/applications/[id] error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to delete application",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
