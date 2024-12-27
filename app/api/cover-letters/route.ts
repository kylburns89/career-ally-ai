import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/auth-options";
import { prisma } from "../../../lib/prisma";
import { CoverLetter } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const coverLetters = await prisma.coverLetter.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(coverLetters.map((letter: CoverLetter) => ({
      id: letter.id,
      userId: letter.userId,
      name: letter.title,
      content: letter.content,
      createdAt: letter.createdAt,
      updatedAt: letter.updatedAt
    })));
  } catch (error) {
    console.error("[COVER_LETTERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const json = await req.json();
    const { title, content, jobTitle, company, template } = json;

    if (!title || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId: user.id,
        title,
        content,
      }
    });

    return NextResponse.json({
      id: coverLetter.id,
      userId: coverLetter.userId,
      name: coverLetter.title,
      content: coverLetter.content,
      createdAt: coverLetter.createdAt,
      updatedAt: coverLetter.updatedAt
    });
  } catch (error) {
    console.error("[COVER_LETTERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
