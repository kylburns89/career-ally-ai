import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../lib/prisma';
import { PrismaClient } from '@prisma/client';
import { searchLearningResources } from '../../../lib/brave';
import { SkillGap, LearningResource, LearningPathModel } from '../../../types/learning';
import { AdaptedSearchResult } from '../../../types/brave';

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
    create: (args: { data: any }) => Promise<any>;
    findMany: (args: { where: any; orderBy: any }) => Promise<DbLearningPath[]>;
    delete: (args: { where: any }) => Promise<any>;
  };
};

export async function POST(request: Request) {
  console.log('POST /api/learning-path - Start');
  try {
    // Verify authentication using NextAuth
    const session = await getServerSession();
    if (!session?.user?.email) {
      console.log('No session found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log('User authenticated:', session.user.email);

    const body = await request.json();
    console.log('Request body:', body);
    
    const { skillGaps } = body as { skillGaps: SkillGap[] };

    if (!skillGaps?.length) {
      console.log('No skill gaps provided');
      return NextResponse.json(
        { error: 'Skill gaps are required' },
        { status: 400 }
      );
    }

    console.log('Processing skill gaps:', skillGaps);
    const resources: LearningResource[] = [];

    for (const gap of skillGaps) {
      try {
        console.log(`Processing skill: ${gap.skill}`);
        
        // Add delay between requests to avoid rate limits
        if (gap !== skillGaps[0]) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }

        // Search for learning resources
        console.log('Searching for learning resources');
        const resourcesResponse = await searchLearningResources(
          `${gap.skill} tutorials courses learning resources`
        ).catch(error => {
          if (error.message.includes('429')) {
            throw new Error('Rate limit reached. Please try again in a few moments.');
          }
          throw error;
        });
        
        if (!resourcesResponse?.results?.length) {
          console.log(`No resources found for ${gap.skill}`);
          return;
        }
        
        console.log(`Found ${resourcesResponse.results.length} learning resources`);

        // Transform search results into learning resources
        const skillResources: LearningResource[] = resourcesResponse.results.slice(0, 3).map((result: AdaptedSearchResult) => ({
          title: result.title,
          url: result.url,
          description: result.content || 'No description available',
          provider: result.source || 'Unknown',
          type: result.url.includes('certification') ? 'certification' : 'course',
          duration: 'Varies',
          skills: [gap.skill],
          difficulty: gap.currentLevel ? 
            gap.currentLevel.toLowerCase().includes('begin') ? 'Beginner' :
            gap.currentLevel.toLowerCase().includes('inter') ? 'Intermediate' :
            'Advanced' : 'Intermediate'
        }));

        resources.push(...skillResources);
        
        console.log(`Successfully processed skill: ${gap.skill}`);
      } catch (error) {
        console.error(`Error processing skill ${gap.skill}:`, error);
        // Continue with other skills if one fails
        continue;
      }
    }

    if (resources.length === 0) {
      console.log('No learning resources were found');
      return NextResponse.json(
        { error: 'No learning resources found. This may be due to rate limiting. Please try again in a few moments.' },
        { status: 429 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Store the learning path in the database
    const learningPath = await db.learningPath.create({
      data: {
        userId: user.id,
        title: `Learning Path - ${new Date().toLocaleDateString()}`,
        description: 'Generated learning path based on skill gaps',
        skillGaps: JSON.stringify(skillGaps),
        resources: JSON.stringify(resources.slice(0, 10)), // Store top 10 most relevant resources
        completed: false // Default to not completed
      }
    });

    // Parse data back to objects for response
    const response = {
      ...learningPath,
      skillGaps: JSON.parse(learningPath.skillGaps as string),
      resources: JSON.parse(learningPath.resources as string)
    } as LearningPathModel;

    console.log('Learning path created successfully');
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating learning path:', error);
    return NextResponse.json(
      { error: 'Failed to create learning path' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  console.log('GET /api/learning-path - Start');
  try {
    // Verify authentication using NextAuth
    const session = await getServerSession();
    if (!session?.user?.email) {
      console.log('No session found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log('User authenticated:', session.user.email);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Fetching learning paths from database');
    const learningPaths = await db.learningPath.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Parse skillGaps and resources for each learning path
    const parsedPaths = learningPaths.map((path: DbLearningPath) => {
      try {
        return {
          ...path,
          skillGaps: JSON.parse(path.skillGaps),
          resources: JSON.parse(path.resources)
        } as LearningPathModel;
      } catch (error) {
        console.error(`Error parsing JSON for path ${path.id}:`, error);
        return {
          ...path,
          skillGaps: [],
          resources: []
        } as LearningPathModel;
      }
    });

    console.log(`Found ${learningPaths.length} learning paths`);
    return NextResponse.json(parsedPaths);
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning paths' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete the learning path
    await db.learningPath.delete({
      where: {
        id: context.params.id,
        userId: user.id
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
