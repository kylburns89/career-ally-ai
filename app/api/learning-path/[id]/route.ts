import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../../lib/prisma';
import { PrismaClient } from '@prisma/client';
import { SkillGap, LearningResource, LearningPathModel } from '../../../../types/learning';

// Define the database model type
interface DbLearningPath {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  skillGaps: string;
  resources: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Type assertion for Prisma client with our model
const db = prisma as PrismaClient & {
  learningPath: {
    update: (args: { where: any; data: any }) => Promise<DbLearningPath>;
    findUnique: (args: { where: any }) => Promise<DbLearningPath | null>;
  };
};

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
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
        id: context.params.id,
        userId: user.id // Ensure the path belongs to the user
      },
      data: updateData
    });

    // Parse JSON fields for response
    try {
      const response = {
        ...updatedPath,
        skillGaps: JSON.parse(updatedPath.skillGaps),
        resources: JSON.parse(updatedPath.resources)
      } as LearningPathModel;
      return NextResponse.json(response);
    } catch (error) {
      console.error('Error parsing JSON fields:', error);
      return NextResponse.json({
        ...updatedPath,
        skillGaps: [],
        resources: []
      } as LearningPathModel);
    }
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
  context: { params: { id: string } }
) {
  try {
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
        id: context.params.id,
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
    try {
      const response = {
        ...learningPath,
        skillGaps: JSON.parse(learningPath.skillGaps),
        resources: JSON.parse(learningPath.resources)
      } as LearningPathModel;
      return NextResponse.json(response);
    } catch (error) {
      console.error('Error parsing JSON fields:', error);
      return NextResponse.json({
        ...learningPath,
        skillGaps: [],
        resources: []
      } as LearningPathModel);
    }

  } catch (error) {
    console.error('Error fetching learning path:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning path' },
      { status: 500 }
    );
  }
}
