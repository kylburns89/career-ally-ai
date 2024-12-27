import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma";
import { authOptions } from "../auth/auth-options";

export const dynamic = 'force-dynamic';

// GET /api/applications - Get all applications for the authenticated user
export async function GET(req: Request) {
  try {
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

    const { searchParams } = new URL(req.url);
    const unlinked = searchParams.get('unlinked') === 'true';

    const applications = await prisma.jobApplication.findMany({
      where: { 
        userId: user.id,
        ...(unlinked ? { contactId: null } : {})
      },
      include: {
        contact: true
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform the data to match the Application type
    const transformedApplications = applications.map(app => ({
      id: app.id,
      userId: app.userId,
      jobTitle: app.jobTitle,
      company: app.company,
      location: app.location,
      status: app.status,
      appliedDate: app.appliedDate,
      contactId: app.contactId,
      resumeId: app.resumeId,
      coverLetterId: app.coverLetterId,
      notes: app.notes,
      nextSteps: app.nextSteps,
      communicationHistory: (app as any).communicationHistory || [],
      createdAt: app.createdAt,
      updatedAt: app.updatedAt
    }));

    return NextResponse.json(transformedApplications);
  } catch (error) {
    console.error("GET /api/applications error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to fetch applications",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST /api/applications - Create a new application
export async function POST(req: Request) {
  try {
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

    const applicationData = await req.json();
    
    const application = await prisma.jobApplication.create({
      data: {
        userId: user.id,
        jobTitle: applicationData.jobTitle,
        company: applicationData.company,
        location: applicationData.location,
        status: applicationData.status || 'applied',
        appliedDate: applicationData.appliedDate || new Date(),
        contactId: applicationData.contactId,
        resumeId: applicationData.resumeId,
        coverLetterId: applicationData.coverLetterId,
        notes: applicationData.notes || null,
        nextSteps: applicationData.nextSteps || null,
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
      communicationHistory: (application as any).communicationHistory || [],
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    };

    return NextResponse.json(transformedApplication);
  } catch (error) {
    console.error("POST /api/applications error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to create application",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// PUT /api/applications/[id] - Update an application
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const updatedData = await req.json();

    if (!id) {
      return new Response(
        JSON.stringify({ message: "Application ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
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
        id,
        userId: user.id,
      },
    });

    if (!existingApplication) {
      return new Response(
        JSON.stringify({ message: "Application not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const application = await prisma.jobApplication.update({
      where: { id },
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
      communicationHistory: (application as any).communicationHistory || [],
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    };

    return NextResponse.json(transformedApplication);
  } catch (error) {
    console.error("PUT /api/applications error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to update application",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE /api/applications/[id] - Delete an application
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ message: "Application ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
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
        id,
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
      where: { id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/applications error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to delete application",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
