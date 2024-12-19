import { createServerClient } from '@supabase/ssr';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cookies } from 'next/headers';
import { Database } from '../../../types/database';
import { generateCareerPath } from '../../../lib/openai';
import { NextResponse } from 'next/server';

interface Education {
  degree: string;
  field: string;
}

interface Experience {
  title: string;
  company: string;
}

export async function POST(req: Request) {
  try {
    const { useProfile, careerInput } = await req.json();
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Partial<ResponseCookie>) {
            cookieStore.set({
              name,
              value,
              ...options,
              // Ensure secure cookies in production
              secure: process.env.NODE_ENV === 'production',
              // Support OAuth flows
              sameSite: 'lax',
              // Set path to root
              path: '/',
            });
          },
          remove(name: string, options: Partial<ResponseCookie>) {
            cookieStore.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
            });
          },
        },
      }
    );

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

      prompt = `You are a career progression expert. Analyze the following profile and generate a detailed career path. Return ONLY a JSON object with no additional text. The response must start with "{" and end with "}".

Profile Information:
Current Title: ${profile.title || 'Not specified'}
Years of Experience: ${profile.years_experience || 'Not specified'}
Skills: ${profile.skills?.join(', ') || 'Not specified'}
Industries: ${profile.industries?.join(', ') || 'Not specified'}
Education: ${(profile.education as Education[])?.map(edu => `${edu.degree} in ${edu.field}`).join(', ') || 'Not specified'}
Experience: ${(profile.experience as Experience[])?.map(exp => `${exp.title} at ${exp.company}`).join(', ') || 'Not specified'}
Certifications: ${profile.certifications?.join(', ') || 'Not specified'}
Desired Salary: ${profile.desired_salary ? `$${profile.desired_salary}` : 'Not specified'}
Desired Location: ${profile.desired_location || 'Not specified'}
Remote Only: ${profile.remote_only ? 'Yes' : 'No'}

The response must exactly match this structure:
{
  "career_steps": [
    {
      "title": "Role title",
      "timeline": "Timeline description",
      "required_skills": ["Skill 1", "Skill 2"],
      "certifications": ["Cert 1", "Cert 2"],
      "responsibilities": ["Responsibility 1", "Responsibility 2"]
    }
  ]
}`;
    } else {
      prompt = `You are a career progression expert. Generate a detailed career path for someone interested in becoming a ${careerInput}. Return ONLY a JSON object with no additional text. The response must start with "{" and end with "}".

The response must exactly match this structure:
{
  "career_steps": [
    {
      "title": "Role title",
      "timeline": "Timeline description",
      "required_skills": ["Skill 1", "Skill 2"],
      "certifications": ["Cert 1", "Cert 2"],
      "responsibilities": ["Responsibility 1", "Responsibility 2"]
    }
  ]
}`;
    }

    const response = await generateCareerPath(prompt, {
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      temperature: 0.7
    });

    // Parse the response and ensure it has the expected structure
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
      if (!parsedResponse.career_steps || !Array.isArray(parsedResponse.career_steps)) {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error parsing career path response:', error);
      return NextResponse.json(
        { error: 'Failed to generate career path. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Career path generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate career path' },
      { status: 500 }
    );
  }
}
