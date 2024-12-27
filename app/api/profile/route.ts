import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/auth-options";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user.profile);
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const json = await req.json();
    const {
      headline,
      summary,
      location,
      skills,
      experience,
      education,
      certifications
    } = json;

    const profile = await prisma.profile.upsert({
      where: {
        userId: user.id,
      },
      update: {
        headline,
        summary,
        location,
        skills,
        experience,
        education,
        certifications
      },
      create: {
        userId: user.id,
        headline,
        summary,
        location,
        skills,
        experience,
        education,
        certifications
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (!user.profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    const json = await req.json();
    const profile = await prisma.profile.update({
      where: {
        id: user.profile.id,
      },
      data: json,
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
