import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../../lib/prisma';
import { PrismaClient } from '@prisma/client';
import { SkillGap, LearningResource, LearningPathModel } from '../../../../types/learning';

import { JsonValue } from '@prisma/client/runtime/library';

// Define the database model type
interface DbLearningPath {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  skillGaps: JsonValue;
  resources: JsonValue;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Type assertion for Prisma client with our model
const db = prisma as PrismaClient & {
  learningPath: {
    update: (args: { where: any; data: any }) => Promise<DbLearningPath>;
    findUnique: (args: { where: any }) => Promise<DbLearningPath | null>;
    delete: (args: { where: any }) => Promise<DbLearningPath>;
  };
};

// Helper function to safely parse JSON
function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    const parsed = JSON.parse(json);
    return parsed === null ? fallback : parsed;
  } catch (error) {
    return fallback;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the learning path
    await db.learningPath.delete({
      where: {
        id: id,
        userId: user.id // Ensure the path belongs to the user
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting learning path:', error);
    return NextResponse.json(
      { error: 'Failed to delete learning path' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { skillGaps, completed } = body as { skillGaps?: SkillGap[]; completed?: boolean };

    // Prepare update data
    const updateData: Partial<DbLearningPath> & { updatedAt: Date } = {
      updatedAt: new Date()
    };

    if (skillGaps !== undefined) {
      if (!skillGaps.length) {
        return NextResponse.json(
          { error: 'Skill gaps array cannot be empty' },
          { status: 400 }
        );
      }
      updateData.skillGaps = JSON.stringify(skillGaps);
    }

    if (completed !== undefined) {
      updateData.completed = completed;
    }

    // Update the learning path
    const updatedPath = await db.learningPath.update({
      where: {
        id: id,
        userId: user.id // Ensure the path belongs to the user
      },
      data: updateData
    });

    // Parse JSON fields for response
    const response = {
      ...updatedPath,
      skillGaps: safeJsonParse<SkillGap[]>(updatedPath.skillGaps as string, []),
      resources: safeJsonParse<LearningResource[]>(updatedPath.resources as string, [])
    } as LearningPathModel;
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating learning path:', error);
    return NextResponse.json(
      { error: 'Failed to update learning path' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the learning path
    const learningPath = await db.learningPath.findUnique({
      where: {
        id: id,
        userId: user.id // Ensure the path belongs to the user
      }
    });

    if (!learningPath) {
      return NextResponse.json(
        { error: 'Learning path not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields for response
    const response = {
      ...learningPath,
      skillGaps: safeJsonParse<SkillGap[]>(learningPath.skillGaps as string, []),
      resources: safeJsonParse<LearningResource[]>(learningPath.resources as string, [])
    } as LearningPathModel;
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching learning path:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning path' },
      { status: 500 }
    );
  }
}
