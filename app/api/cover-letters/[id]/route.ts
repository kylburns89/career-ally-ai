import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/auth-options";
import { prisma } from "../../../../lib/prisma";

// GET /api/cover-letters/[id] - Get a specific cover letter
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const coverLetter = await prisma.coverLetter.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: true,
      },
    });

    if (!coverLetter) {
      return new NextResponse("Cover letter not found", { status: 404 });
    }

    // Verify ownership
    if (coverLetter.user.email !== session.user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json({
      id: coverLetter.id,
      userId: coverLetter.userId,
      name: coverLetter.title,
      content: coverLetter.content,
      createdAt: coverLetter.createdAt,
      updatedAt: coverLetter.updatedAt
    });
  } catch (error) {
    console.error("GET /api/cover-letters/[id] error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to fetch cover letter",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// PUT /api/cover-letters/[id] - Update a specific cover letter
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const coverLetter = await prisma.coverLetter.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: true,
      },
    });

    if (!coverLetter) {
      return new NextResponse("Cover letter not found", { status: 404 });
    }

    // Verify ownership
    if (coverLetter.user.email !== session.user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const { title, content } = json;

    const updatedCoverLetter = await prisma.coverLetter.update({
      where: {
        id: params.id,
      },
      data: {
        title: title || coverLetter.title,
        content: content || coverLetter.content,
      },
    });

    return NextResponse.json({
      id: updatedCoverLetter.id,
      userId: updatedCoverLetter.userId,
      name: updatedCoverLetter.title,
      content: updatedCoverLetter.content,
      createdAt: updatedCoverLetter.createdAt,
      updatedAt: updatedCoverLetter.updatedAt
    });
  } catch (error) {
    console.error("PUT /api/cover-letters/[id] error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to update cover letter",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE /api/cover-letters/[id] - Delete a specific cover letter
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const coverLetter = await prisma.coverLetter.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: true,
      },
    });

    if (!coverLetter) {
      return new NextResponse("Cover letter not found", { status: 404 });
    }

    // Verify ownership
    if (coverLetter.user.email !== session.user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.coverLetter.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/cover-letters/[id] error:", error);
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Failed to delete cover letter",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
