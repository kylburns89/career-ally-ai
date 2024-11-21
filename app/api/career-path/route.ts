import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { generateCareerPath } from '@/lib/openai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { useProfile, careerInput } = await req.json();
    const supabase = createRouteHandlerClient({ cookies });

    let prompt = '';
    
    if (useProfile) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .single();

      if (!profile) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        );
      }

      prompt = `Generate a detailed career progression path based on the following profile:
      Current Role: ${profile.current_role || 'Not specified'}
      Skills: ${profile.skills?.join(', ') || 'Not specified'}
      Experience Level: ${profile.experience_level || 'Not specified'}
      Interests: ${profile.interests?.join(', ') || 'Not specified'}

      For each step in the career path, include:
      1. Role title
      2. Estimated timeline
      3. Required technical and soft skills
      4. Recommended certifications or qualifications
      5. Key responsibilities

      Format the response as a JSON object with a "career_steps" array containing the progression steps.
      Each step should have: title, timeline, required_skills (array), certifications (array), and responsibilities (array).`;
    } else {
      prompt = `Generate a detailed career progression path for someone interested in becoming a ${careerInput}.
      
      For each step in the career path, include:
      1. Role title
      2. Estimated timeline
      3. Required technical and soft skills
      4. Recommended certifications or qualifications
      5. Key responsibilities

      Format the response as a JSON object with a "career_steps" array containing the progression steps.
      Each step should have: title, timeline, required_skills (array), certifications (array), and responsibilities (array).`;
    }

    const response = await generateCareerPath(prompt, {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    return NextResponse.json(JSON.parse(response));
  } catch (error) {
    console.error('Career path generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate career path' },
      { status: 500 }
    );
  }
}
