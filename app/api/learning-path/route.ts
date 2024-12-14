import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { searchLearningResources, searchCertifications } from '../../../lib/brave';
import { SkillGap, LearningResource } from '../../../types/learning';
import { AdaptedSearchResult } from '../../../types/brave';

interface SkillInput {
  name: string;
  currentLevel: number;
  targetLevel: number;
}

export async function POST(request: Request) {
  console.log('POST /api/learning-path - Start');
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify authentication
    console.log('Verifying authentication');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No session found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log('User authenticated:', session.user.id);

    const body = await request.json();
    console.log('Request body:', body);
    
    const { skills, userId } = body as { 
      skills: SkillInput[],
      userId: string 
    };

    if (!skills?.length) {
      console.log('No skills provided');
      return NextResponse.json(
        { error: 'Skills are required' },
        { status: 400 }
      );
    }

    // Verify the authenticated user matches the requested userId
    if (session.user.id !== userId) {
      console.log('User ID mismatch');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Processing skills:', skills);
    const skillGaps: SkillGap[] = [];

    for (const skill of skills) {
      try {
        console.log(`Processing skill: ${skill.name}`);
        
        // Search for learning resources
        console.log('Searching for learning resources');
        const resourcesResponse = await searchLearningResources(
          `${skill.name} tutorials courses learning resources`
        );
        console.log(`Found ${resourcesResponse.results.length} learning resources`);

        // Search for relevant certifications
        console.log('Searching for certifications');
        const certificationsResponse = await searchCertifications(skill.name);
        console.log(`Found ${certificationsResponse.results.length} certifications`);

        // Transform search results into learning resources
        const resources: LearningResource[] = resourcesResponse.results.map((result: AdaptedSearchResult) => ({
          id: crypto.randomUUID(),
          title: result.title,
          url: result.url,
          provider: result.source,
          type: result.url.includes('certification') ? 'certification' : 'course',
          skillArea: skill.name,
          completed: false,
          progress: 0
        }));

        skillGaps.push({
          skill: skill.name,
          currentLevel: skill.currentLevel,
          targetLevel: skill.targetLevel,
          resources,
          certifications: certificationsResponse.results
        });
        
        console.log(`Successfully processed skill: ${skill.name}`);
      } catch (error) {
        console.error(`Error processing skill ${skill.name}:`, error);
        // Continue with other skills if one fails
        continue;
      }
    }

    if (skillGaps.length === 0) {
      console.log('No skill gaps were successfully processed');
      return NextResponse.json(
        { error: 'Failed to generate learning resources' },
        { status: 500 }
      );
    }

    // Store the learning path in the database
    console.log('Storing learning path in database');
    const { data, error } = await supabase
      .from('learning_paths')
      .insert({
        user_id: userId,
        title: 'Custom Learning Path',
        description: 'Based on your skill gaps',
        skill_gaps: JSON.stringify(skillGaps),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Learning path created successfully');
    // Parse the skill_gaps back to an object before returning
    const response = {
      ...data,
      skill_gaps: JSON.parse(data.skill_gaps as string)
    };
    
    console.log('Sending response');
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
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify authentication
    console.log('Verifying authentication');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No session found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log('User authenticated:', session.user.id);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      console.log('No userId provided');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify the authenticated user matches the requested userId
    if (session.user.id !== userId) {
      console.log('User ID mismatch');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Fetching learning paths from database');
    const { data, error } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} learning paths`);

    // Parse the skill_gaps JSON string for each learning path
    const parsedData = data?.map(path => ({
      ...path,
      skill_gaps: JSON.parse(path.skill_gaps as string)
    }));

    console.log('Sending response');
    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning paths' },
      { status: 500 }
    );
  }
}
