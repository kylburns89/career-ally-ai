import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../../lib/prisma";
import { authOptions } from "../../../auth/auth-options";

// PATCH /api/applications/[id]/communication - Add a new communication entry
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Verify the application belongs to the user
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        contact: true
      }
    });

    if (!existingApplication) {
      return new Response(
        JSON.stringify({ message: "Application not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const communicationData = await req.json();

    const currentHistory = (existingApplication as any).communicationHistory || [];
    const newEntry = {
      ...communicationData,
      date: new Date().toISOString()
    };

    const application = await prisma.jobApplication.update({
      where: { id: params.id },
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
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to add communication",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE /api/applications/[id]/communication - Delete a communication entry
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Verify the application belongs to the user
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        contact: true
      }
    });

    if (!existingApplication) {
      return new Response(
        JSON.stringify({ message: "Application not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const { index } = await req.json();
    const currentHistory = (existingApplication as any).communicationHistory || [];
    
    // Remove the communication at the specified index
    const updatedHistory = [
      ...currentHistory.slice(0, index),
      ...currentHistory.slice(index + 1)
    ];

    const application = await prisma.jobApplication.update({
      where: { id: params.id },
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
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to delete communication",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
