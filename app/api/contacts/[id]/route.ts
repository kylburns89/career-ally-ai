import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "../../../../lib/prisma";
import { authOptions } from "../../auth/auth-options";

// GET /api/contacts/[id] - Get a specific contact
export async function GET(
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

    const contact = await prisma.contact.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        applications: true,
      },
    });
    
    if (!contact) {
      return new Response(
        JSON.stringify({ message: "Contact not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error("GET /api/contacts/[id] error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to fetch contact",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// PATCH /api/contacts/[id] - Update specific fields of a contact
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

    const existingContact = await prisma.contact.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingContact) {
      return new Response(
        JSON.stringify({ message: "Contact not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const updates = await req.json();

    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: updates,
      include: {
        applications: true,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("PATCH /api/contacts/[id] error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to update contact",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE /api/contacts/[id] - Delete a specific contact
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

    const existingContact = await prisma.contact.findFirst({
      where: {
        id: params.id,
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
      where: { id: params.id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/contacts/[id] error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to delete contact",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
