import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../../lib/prisma";
import { authOptions } from "../../../auth/auth-options";

// PATCH /api/applications/[id]/communication - Add a new communication entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Verify the application belongs to the user
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
      include: {
        contact: true
      }
    });

    if (!existingApplication) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    const communicationData = await request.json();

    const currentHistory = (existingApplication as any).communicationHistory || [];
    const newEntry = {
      ...communicationData,
      date: new Date().toISOString()
    };

    const application = await prisma.jobApplication.update({
      where: { id: id },
      data: {
        communicationHistory: [...currentHistory, newEntry]
      } as any,
      include: {
        contact: true
      }
    });

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
    console.error("PATCH /api/applications/[id]/communication error:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to add communication",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/applications/[id]/communication - Delete a communication entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Verify the application belongs to the user
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
      include: {
        contact: true
      }
    });

    if (!existingApplication) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 }
      );
    }

    const { index } = await request.json();
    const currentHistory = (existingApplication as any).communicationHistory || [];
    
    // Remove the communication at the specified index
    const updatedHistory = [
      ...currentHistory.slice(0, index),
      ...currentHistory.slice(index + 1)
    ];

    const application = await prisma.jobApplication.update({
      where: { id: id },
      data: {
        communicationHistory: updatedHistory
      } as any,
      include: {
        contact: true
      }
    });

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
    console.error("DELETE /api/applications/[id]/communication error:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to delete communication",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
