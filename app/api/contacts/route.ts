import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../lib/prisma";
import { authOptions } from "../auth/auth-options";
import { Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic';

// GET /api/contacts - Get all contacts for the authenticated user
export async function GET() {
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

    const contacts = await prisma.contact.findMany({
      where: { userId: user.id },
      include: {
        applications: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("GET /api/contacts error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to fetch contacts",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST /api/contacts - Create a new contact
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

    const body = await req.json();
    
    const contact = await prisma.contact.create({
      data: {
        userId: user.id,
        name: body.name,
        title: body.title || null,
        company: body.company || null,
        email: body.email || null,
        phone: body.phone || null,
        notes: body.notes || null,
        relationship_score: body.relationshipScore || 50,
      } as Prisma.ContactUncheckedCreateInput,
      include: {
        applications: true,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("POST /api/contacts error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to create contact",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE /api/contacts - Delete a contact
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
        JSON.stringify({ message: "Contact ID is required" }),
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

    // Verify the contact belongs to the user
    const existingContact = await prisma.contact.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingContact) {
      return new Response(
        JSON.stringify({ message: "Contact not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    await prisma.contact.delete({
      where: { id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/contacts error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to delete contact",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
